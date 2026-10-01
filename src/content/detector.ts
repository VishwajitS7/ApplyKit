import { DetectedField, DetectionSummary, FieldSignal } from '../types/detection';
import { UserProfile } from '../types/profile';
import { evaluateSafety } from './safety-guard';
import {
  mapSignalsToFieldType,
  getProfileValueForField,
  getHumanReadableLabelForType,
} from './field-mapper';
import { safeCssEscape } from '../utils/dom-helpers';

let fieldCounter = 0;

export function getOrCreateFieldId(element: HTMLElement): string {
  let id = element.getAttribute('data-applykit-id');
  if (!id) {
    id = `ak-field-${++fieldCounter}-${Date.now().toString(36)}`;
    element.setAttribute('data-applykit-id', id);
  }
  return id;
}

function isElementVisible(el: HTMLElement): boolean {
  if (!el.isConnected) return false;
  if (el.tagName.toLowerCase() === 'input' && (el as HTMLInputElement).type === 'hidden') {
    return false;
  }
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  // Check client rects
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getAssociatedLabelText(element: HTMLElement): string[] {
  const texts: string[] = [];

  // 1. Explicit label via 'id' & 'for'
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${safeCssEscape(id)}"]`);
    if (label && label.textContent) {
      texts.push(label.textContent.trim());
    }
  }

  // 2. Enclosing parent label
  const parentLabel = element.closest('label');
  if (parentLabel && parentLabel.textContent) {
    // Clone to remove element's own text if needed
    texts.push(parentLabel.textContent.trim());
  }

  // 3. aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/);
    for (const labelId of ids) {
      const el = document.getElementById(labelId);
      if (el && el.textContent) {
        texts.push(el.textContent.trim());
      }
    }
  }

  return texts;
}

function getNearbyText(element: HTMLElement): string[] {
  const texts: string[] = [];

  // Preceding sibling
  let prev = element.previousElementSibling;
  while (prev && texts.length < 2) {
    if (prev.textContent && prev.textContent.trim().length > 0) {
      texts.push(prev.textContent.trim());
    }
    prev = prev.previousElementSibling;
  }

  // Form container / field group wrapper
  const wrapper = element.closest('.form-group, .field, .form-field, .input-group, div, fieldset');
  if (wrapper) {
    // Find headings, spans, or legends inside wrapper
    const heading = wrapper.querySelector('h1, h2, h3, h4, h5, h6, legend, .label, strong');
    if (heading && heading.textContent) {
      texts.push(heading.textContent.trim());
    }
  }

  return texts;
}

function extractSignals(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldSignal[] {
  const signals: FieldSignal[] = [];

  // Type attribute
  const inputType = element.getAttribute('type') || (element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text');
  signals.push({ source: 'type', text: inputType, weight: 3 });

  // Autocomplete
  const autocomplete = element.getAttribute('autocomplete');
  if (autocomplete && autocomplete !== 'off' && autocomplete !== 'on') {
    signals.push({ source: 'autocomplete', text: autocomplete, weight: 3 });
  }

  // Label text (highest natural language weight: 3)
  const labels = getAssociatedLabelText(element);
  for (const label of labels) {
    signals.push({ source: 'label', text: label, weight: 3 });
  }

  // Aria label (weight: 2.5)
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    signals.push({ source: 'aria', text: ariaLabel, weight: 2.5 });
  }

  // Placeholder (weight: 2)
  const placeholder = element.getAttribute('placeholder');
  if (placeholder) {
    signals.push({ source: 'placeholder', text: placeholder, weight: 2 });
  }

  // Name attribute (weight: 2)
  const name = element.getAttribute('name');
  if (name) {
    signals.push({ source: 'name', text: name, weight: 2 });
  }

  // ID attribute (weight: 2)
  const id = element.getAttribute('id');
  if (id) {
    signals.push({ source: 'id', text: id, weight: 2 });
  }

  // Automation ID (Workday, custom ATS portals) (weight: 2.5)
  const automationId =
    element.getAttribute('data-automation-id') ||
    element.closest('[data-automation-id]')?.getAttribute('data-automation-id');
  if (automationId) {
    signals.push({ source: 'id', text: automationId, weight: 2.5 });
  }

  // Nearby text (weight: 1)
  const nearby = getNearbyText(element);
  for (const near of nearby) {
    signals.push({ source: 'nearbyText', text: near, weight: 1 });
  }

  return signals;
}

export function detectFormFields(
  root: Document | HTMLElement = document,
  profile?: UserProfile,
  classifier?: (el: HTMLElement, signals: FieldSignal[]) => { type: import('../types/detection').FieldType; confidence: number } | null
): DetectionSummary {
  const candidateElements = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input, textarea, select'
    )
  );

  const detectedFields: DetectedField[] = [];
  let totalInputsOnPage = candidateElements.length;

  for (const el of candidateElements) {
    // 1. Visibility check
    if (!isElementVisible(el)) continue;

    // 2. Build combined text for safety evaluation
    const labels = getAssociatedLabelText(el);
    const nearby = getNearbyText(el);
    const combinedText = [
      el.getAttribute('name') || '',
      el.getAttribute('id') || '',
      el.getAttribute('placeholder') || '',
      el.getAttribute('aria-label') || '',
      ...labels,
      ...nearby,
    ].join(' ');

    // 3. Safety Guard Evaluation
    const safety = evaluateSafety(el, combinedText);
    if (!safety.safe) {
      // Excluded for safety (submit buttons, demographics, visa, salary, passwords)
      continue;
    }

    // 4. Extract signals & map to FieldType
    const signals = extractSignals(el);
    let mapping = classifier ? classifier(el, signals) : null;
    if (!mapping) {
      mapping = mapSignalsToFieldType(signals);
    }

    // Skip fields we couldn't classify or with very low confidence
    if (mapping.type === 'unknown' || mapping.confidence < 0.45) {
      continue;
    }

    const fieldId = getOrCreateFieldId(el);
    const currentValue = el.value ? el.value.trim() : '';
    const isNonEmpty = currentValue.length > 0;

    // Derive human label
    const explicitLabel = labels[0] || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '';
    const displayLabel = explicitLabel
      ? explicitLabel.replace(/[*:]/g, '').trim()
      : getHumanReadableLabelForType(mapping.type);

    const matchedValue = profile ? getProfileValueForField(mapping.type, profile) : '';

    detectedFields.push({
      id: fieldId,
      type: mapping.type,
      confidence: mapping.confidence,
      label: displayLabel,
      matchedValue,
      currentValue,
      isNonEmpty,
      elementTag: el.tagName.toLowerCase() as 'input' | 'textarea' | 'select',
      inputType: el.getAttribute('type') || undefined,
      signals,
    });
  }

  const highConfidenceCount = detectedFields.filter((f) => f.confidence >= 0.70).length;
  const ambiguousCount = detectedFields.filter((f) => f.confidence < 0.70).length;

  return {
    formDetected: detectedFields.length > 0,
    totalInputsOnPage,
    detectedFields,
    highConfidenceCount,
    ambiguousCount,
  };
}
