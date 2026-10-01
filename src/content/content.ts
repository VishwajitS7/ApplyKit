import React from 'react';
import ReactDOM from 'react-dom/client';
import { getActiveAdapter } from './adapters/adapter-registry';
import { DetectionSummary } from '../types/detection';
import { ExtensionMessage } from '../types/messages';
import { safeCssEscape } from '../utils/dom-helpers';
import { extractJobDescriptionFromPage } from './job-parser';
import { FloatingApp } from './floating/FloatingApp';
import { FLOATING_STYLES } from './floating/floating-styles';

let cachedDetection: DetectionSummary | null = null;
let toastContainer: HTMLDivElement | null = null;
let floatingRoot: ReactDOM.Root | null = null;

function injectFloatingOverlay() {
  if (typeof window === 'undefined' || !document) return;
  // Prevent duplicating inside nested iframes
  if (window.top !== window.self) return;
  if (document.getElementById('applykit-floating-host')) return;

  const target = document.body || document.documentElement;
  if (!target) return;

  try {
    const host = document.createElement('div');
    host.id = 'applykit-floating-host';
    host.style.cssText = 'all: initial; position: absolute; top: 0; left: 0; z-index: 2147483647;';

    const shadow = host.attachShadow({ mode: 'open' });

    const styleTag = document.createElement('style');
    styleTag.textContent = FLOATING_STYLES;
    shadow.appendChild(styleTag);

    const mountPoint = document.createElement('div');
    mountPoint.id = 'applykit-root';
    shadow.appendChild(mountPoint);

    target.appendChild(host);

    floatingRoot = ReactDOM.createRoot(mountPoint);
    floatingRoot.render(React.createElement(FloatingApp));
  } catch (err) {
    console.error('[ApplyKit] Failed to inject floating overlay:', err);
  }
}

// Initialize floating overlay
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFloatingOverlay);
} else {
  injectFloatingOverlay();
}

function showInPageToast(message: string, toastType: 'success' | 'info' | 'error' = 'success') {
  try {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'applykit-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColor = toastType === 'error' ? '#ef4444' : '#18181b';
    const borderColor = toastType === 'error' ? '#f87171' : '#3f3f46';

    toast.style.cssText = `
      background: ${bgColor};
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px ${borderColor};
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: auto;
      animation: akFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      transition: opacity 0.2s ease, transform 0.2s ease;
    `;

    toast.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#6366f1;"></span>
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      setTimeout(() => {
        toast.remove();
      }, 250);
    }, 2500);
  } catch {
    // Graceful fallback if DOM is not ready
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function copyToClipboardInPage(text: string, label: string) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    showInPageToast(`Copied ${label} to clipboard`, 'success');
  } catch (err) {
    console.error('[ApplyKit] Failed to copy in content script:', err);
    showInPageToast(`Failed to copy ${label}`, 'error');
  }
}

// Runtime message listener
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    switch (message.type) {
      case 'PING': {
        sendResponse({ success: true, data: { status: 'ready' } });
        return false;
      }

      case 'DETECT_FIELDS': {
        try {
          const profile = message.payload?.profile;
          const adapter = getActiveAdapter();
          const detection = adapter.detectFields(profile);
          cachedDetection = detection;
          sendResponse({ success: true, data: detection });
        } catch (err) {
          sendResponse({ success: false, error: (err as Error).message });
        }
        return false;
      }

      case 'AUTOFILL_FIELDS': {
        const { fieldIds, profile, forceOverwrite } = message.payload;
        const adapter = getActiveAdapter();
        // Use cached detected fields or re-detect if needed
        const fieldsToUse = cachedDetection ? cachedDetection.detectedFields : adapter.detectFields(profile).detectedFields;

        adapter
          .autofill(fieldIds, fieldsToUse, profile, forceOverwrite)
          .then((results) => {
            const filledCount = results.filter((r) => r.status === 'filled').length;
            const skippedCount = results.filter((r) => r.status === 'skipped_non_empty').length;

            if (filledCount > 0) {
              const adapterName = adapter.id !== 'generic' ? ` (${adapter.name})` : '';
              showInPageToast(`ApplyKit${adapterName}: Autofilled ${filledCount} field${filledCount > 1 ? 's' : ''}`, 'success');
            }

            sendResponse({
              success: true,
              data: { results, filledCount, skippedCount },
            });
          })
          .catch((err) => {
            sendResponse({ success: false, error: (err as Error).message });
          });

        return true; // Asynchronous response
      }

      case 'HIGHLIGHT_FIELD': {
        const { fieldId, highlight } = message.payload;
        const el = document.querySelector<HTMLElement>(`[data-applykit-id="${safeCssEscape(fieldId)}"]`);
        if (el) {
          if (highlight) {
            el.style.outline = '2px solid #6366f1';
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            el.style.outline = '';
          }
        }
        sendResponse({ success: true });
        return false;
      }

      case 'TRIGGER_QUICK_COPY': {
        const { text, label } = message.payload;
        copyToClipboardInPage(text, label);
        sendResponse({ success: true });
        return false;
      }

      case 'SHOW_TOAST': {
        showInPageToast(message.payload.message, message.payload.toastType);
        sendResponse({ success: true });
        return false;
      }

      case 'EXTRACT_JOB_DESCRIPTION': {
        try {
          const parsed = extractJobDescriptionFromPage();
          sendResponse({ success: true, data: parsed });
        } catch (err) {
          sendResponse({ success: false, error: (err as Error).message });
        }
        return false;
      }

      case 'TOGGLE_FLOATING_PANEL': {
        window.dispatchEvent(new CustomEvent('applykit:toggle-floating'));
        sendResponse({ success: true });
        return false;
      }

      case 'OPEN_FLOATING_PANEL': {
        window.dispatchEvent(new CustomEvent('applykit:open-floating'));
        sendResponse({ success: true });
        return false;
      }

      case 'CLOSE_FLOATING_PANEL': {
        window.dispatchEvent(new CustomEvent('applykit:close-floating'));
        sendResponse({ success: true });
        return false;
      }

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
        return false;
    }
  });
}

// Debounced mutation observer for dynamic forms
let mutationTimer: ReturnType<typeof setTimeout> | null = null;
const observer = new MutationObserver(() => {
  if (mutationTimer) clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => {
    // Invalidate cached detection on significant DOM changes
    cachedDetection = null;
  }, 500);
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}

console.log('[ApplyKit] Content script initialized.');
