import { AutofillResult, DetectedField } from '../types/detection';
import { UserProfile } from '../types/profile';
import { getProfileValueForField } from './field-mapper';
import { evaluateSafety } from './safety-guard';
import { safeCssEscape } from '../utils/dom-helpers';

/**
 * Safely sets the value of an input/textarea/select element
 * ensuring compatibility with React, Angular, Vue, and vanilla DOM event listeners.
 */
/**
 * Safely sets the value of an input/textarea/select/combobox element
 * ensuring compatibility with React, Angular, Vue, Workday, and vanilla DOM event listeners.
 */
export function setElementValue(
  targetElement: HTMLElement,
  value: string
): boolean {
  try {
    let element: HTMLElement = targetElement;

    // If target is a wrapper/combobox container, find the inner input or select
    if (
      !(
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement
      )
    ) {
      const innerInput = element.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input, textarea, select'
      );
      if (innerInput) {
        element = innerInput;
      }
    }

    const tagName = element.tagName.toLowerCase();

    // Focus element first
    element.focus();

    if (tagName === 'input') {
      const inputEl = element as HTMLInputElement;
      const type = (inputEl.getAttribute('type') || 'text').toLowerCase();

      if (type === 'checkbox' || type === 'radio') {
        // We do not make assumptions about boolean checkboxes
        return false;
      }

      // Native prototype setter to bypass React's synthetic input tracker
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(inputEl, value);
      } else {
        inputEl.value = value;
      }

      // If it's a combobox or has autocomplete dropdown, dispatch keyboard events
      const isCombobox =
        inputEl.getAttribute('role') === 'combobox' ||
        inputEl.getAttribute('aria-autocomplete') !== null ||
        inputEl.getAttribute('data-automation-id')?.toLowerCase().includes('select');

      if (isCombobox) {
        // Trigger keydown events so dropdown listeners initialize
        inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true }));

        // Attempt to find any active/associated popup listbox option
        const ariaControls = inputEl.getAttribute('aria-controls');
        const listbox = ariaControls
          ? document.getElementById(ariaControls)
          : document.querySelector('[role="listbox"], .dropdown-menu, .select-options');

        if (listbox) {
          const valLower = value.toLowerCase().trim();
          const options = Array.from(listbox.querySelectorAll('[role="option"], li, .option'));
          const matchedOpt = options.find((opt) => {
            const optText = (opt.textContent || '').toLowerCase().trim();
            return optText === valLower || optText.includes(valLower);
          });
          if (matchedOpt) {
            (matchedOpt as HTMLElement).click();
          }
        }
      }
    } else if (tagName === 'textarea') {
      const textEl = element as HTMLTextAreaElement;
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;

      if (nativeTextareaValueSetter) {
        nativeTextareaValueSetter.call(textEl, value);
      } else {
        textEl.value = value;
      }
    } else if (tagName === 'select') {
      const selectEl = element as HTMLSelectElement;
      let matchedIndex = -1;
      const valLower = value.toLowerCase().trim();

      // Pass 1: Exact match on value or visible text
      for (let i = 0; i < selectEl.options.length; i++) {
        const opt = selectEl.options[i];
        const optVal = opt.value.toLowerCase().trim();
        const optText = opt.text.toLowerCase().trim();
        if (optVal === valLower || optText === valLower) {
          matchedIndex = i;
          break;
        }
      }

      // Pass 2: StartsWith or substring match (ignoring empty/placeholder options)
      if (matchedIndex === -1) {
        for (let i = 0; i < selectEl.options.length; i++) {
          const opt = selectEl.options[i];
          const optText = opt.text.toLowerCase().trim();
          if (optText.length > 2 && (optText.includes(valLower) || valLower.includes(optText))) {
            matchedIndex = i;
            break;
          }
        }
      }

      // Pass 3: Token matching for composite phrases (e.g., degree or major names)
      if (matchedIndex === -1) {
        const tokens = valLower.split(/\s+/).filter((t) => t.length > 3);
        if (tokens.length > 0) {
          for (let i = 0; i < selectEl.options.length; i++) {
            const optText = selectEl.options[i].text.toLowerCase().trim();
            if (tokens.some((token) => optText.includes(token))) {
              matchedIndex = i;
              break;
            }
          }
        }
      }

      if (matchedIndex !== -1) {
        selectEl.selectedIndex = matchedIndex;
      } else {
        selectEl.value = value;
      }

      const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        'value'
      )?.set;
      if (nativeSelectValueSetter && matchedIndex === -1) {
        nativeSelectValueSetter.call(selectEl, value);
      }
    }

    // Dispatch DOM events in standard sequence
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

    return true;
  } catch (err) {
    console.error('[ApplyKit Autofill] Failed setting value on element:', err);
    return false;
  }
}

export async function executeAutofill(
  fieldIdsToFill: string[],
  detectedFields: DetectedField[],
  profile: UserProfile,
  forceOverwrite: boolean = false
): Promise<AutofillResult[]> {
  const results: AutofillResult[] = [];

  for (const fieldId of fieldIdsToFill) {
    const meta = detectedFields.find((f) => f.id === fieldId);
    if (!meta) {
      results.push({
        fieldId,
        type: 'unknown',
        label: 'Unknown',
        status: 'failed',
        error: 'Field metadata not found',
      });
      continue;
    }

    // Locate element in DOM by applykit id
    const element = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      `[data-applykit-id="${safeCssEscape(fieldId)}"]`
    );

    if (!element) {
      results.push({
        fieldId,
        type: meta.type,
        label: meta.label,
        status: 'failed',
        error: 'Element no longer present in DOM',
      });
      continue;
    }

    // Double check safety guard
    const safety = evaluateSafety(element, `${meta.label} ${element.name || ''} ${element.id || ''}`);
    if (!safety.safe) {
      results.push({
        fieldId,
        type: meta.type,
        label: meta.label,
        status: 'denied_by_safety',
        error: safety.detail,
      });
      continue;
    }

    // Check if field is non-empty
    const currentVal = element.value ? element.value.trim() : '';
    if (currentVal.length > 0 && !forceOverwrite) {
      results.push({
        fieldId,
        type: meta.type,
        label: meta.label,
        status: 'skipped_non_empty',
        filledValue: currentVal,
      });
      continue;
    }

    // Determine value to insert
    const valToInsert = getProfileValueForField(meta.type, profile);
    if (!valToInsert || valToInsert.trim().length === 0) {
      results.push({
        fieldId,
        type: meta.type,
        label: meta.label,
        status: 'skipped_non_empty',
        error: `No stored profile value for ${meta.label}`,
      });
      continue;
    }

    // Perform set
    const success = setElementValue(element, valToInsert);
    if (success) {
      results.push({
        fieldId,
        type: meta.type,
        label: meta.label,
        status: 'filled',
        filledValue: valToInsert,
      });

      // Visual feedback highlight on the page (brief subtle flash)
      highlightElementBriefly(element);
    } else {
      results.push({
        fieldId,
        type: meta.type,
        label: meta.label,
        status: 'failed',
        error: 'Failed setting value through DOM events',
      });
    }
  }

  return results;
}

function highlightElementBriefly(el: HTMLElement) {
  try {
    const origOutline = el.style.outline;
    const origTransition = el.style.transition;
    el.style.transition = 'outline 0.2s ease';
    el.style.outline = '2px solid #6366f1';
    setTimeout(() => {
      el.style.outline = origOutline;
      el.style.transition = origTransition;
    }, 1200);
  } catch {
    // Non-critical visual highlight
  }
}
