export const FLOATING_STYLES = `
  :host {
    all: initial;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color-scheme: dark;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .ak-floating-container {
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    font-size: 13px;
    line-height: 1.4;
    color: #f4f4f5;
  }

  /* Floating Pill Button */
  .ak-launcher-pill {
    position: fixed;
    bottom: 24px;
    right: 24px;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(18, 18, 22, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(99, 102, 241, 0.35);
    padding: 8px 14px;
    border-radius: 9999px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 20px rgba(99, 102, 241, 0.2);
    cursor: pointer;
    user-select: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    animation: akPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ak-launcher-pill:hover {
    background: rgba(24, 24, 29, 0.96);
    border-color: rgba(99, 102, 241, 0.6);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55), 0 0 25px rgba(99, 102, 241, 0.35);
  }

  .ak-pill-icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: linear-gradient(135deg, #6366f1, #4338ca);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 700;
    font-size: 12px;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  }

  .ak-pill-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 12px;
    color: #e4e4e7;
  }

  .ak-pill-shortcut {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 2px 6px;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    color: #a1a1aa;
    letter-spacing: 0.02em;
  }

  .ak-pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
    animation: akPulse 2s infinite;
  }

  /* Floating Window Panel */
  .ak-window-panel {
    position: fixed;
    pointer-events: auto;
    width: 410px;
    max-width: calc(100vw - 32px);
    height: 600px;
    max-height: calc(100vh - 48px);
    background: #121215;
    background: linear-gradient(180deg, rgba(24, 24, 30, 0.95) 0%, rgba(15, 15, 18, 0.98) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    user-select: none;
    animation: akSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Header */
  .ak-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    cursor: grab;
  }

  .ak-header:active {
    cursor: grabbing;
  }

  .ak-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ak-logo-badge {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 13px;
    box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
  }

  .ak-title-wrap {
    display: flex;
    flex-direction: column;
  }

  .ak-title {
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  .ak-subtitle {
    font-size: 10px;
    color: #a1a1aa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 170px;
  }

  .ak-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ak-control-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: transparent;
    border: none;
    color: #a1a1aa;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .ak-control-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .ak-control-btn.close:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }

  /* Nav Tabs */
  .ak-nav-tabs {
    display: flex;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    gap: 4px;
  }

  .ak-tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 8px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .ak-tab-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
  }

  .ak-tab-btn.active {
    background: rgba(99, 102, 241, 0.18);
    color: #818cf8;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  /* Body Content */
  .ak-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px;
    user-select: text;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ak-body::-webkit-scrollbar {
    width: 5px;
  }
  .ak-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .ak-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 4px;
  }

  /* Card */
  .ak-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px;
    transition: all 0.15s ease;
  }

  .ak-card-highlight {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(79, 70, 229, 0.06) 100%);
    border: 1px solid rgba(99, 102, 241, 0.28);
  }

  /* Primary Button */
  .ak-btn-primary {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    transition: all 0.18s ease;
  }

  .ak-btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
  }

  .ak-btn-primary:active {
    transform: translateY(0);
  }

  .ak-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Secondary Button */
  .ak-btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e4e4e7;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .ak-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  /* Field Item */
  .ak-field-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.15s ease;
  }

  .ak-field-item:hover {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.25);
  }

  .ak-field-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ak-field-label {
    font-size: 11px;
    font-weight: 600;
    color: #f4f4f5;
  }

  .ak-field-value {
    font-size: 10px;
    color: #a1a1aa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  }

  .ak-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .ak-badge-green {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .ak-badge-blue {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .ak-badge-amber {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  /* Quick Copy Grid */
  .ak-quick-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .ak-copy-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 9px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .ak-copy-card:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.35);
    transform: translateY(-1px);
  }

  .ak-copy-card-title {
    font-size: 10px;
    font-weight: 600;
    color: #a1a1aa;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ak-copy-card-value {
    font-size: 11px;
    font-weight: 500;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Search Input */
  .ak-search-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 7px 10px;
    color: #ffffff;
    font-size: 11px;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .ak-search-input:focus {
    border-color: #6366f1;
  }

  /* Footer */
  .ak-footer {
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 10px;
    color: #71717a;
  }

  .ak-footer-link {
    color: #818cf8;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ak-footer-link:hover {
    text-decoration: underline;
  }

  /* Toast Notification */
  .ak-toast {
    position: absolute;
    bottom: 48px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(24, 24, 27, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(99, 102, 241, 0.4);
    color: #ffffff;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    gap: 6px;
    animation: akPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 100;
  }

  /* Animations */
  @keyframes akPopIn {
    0% { transform: scale(0.85); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes akSlideIn {
    0% { transform: scale(0.96) translateY(8px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }

  @keyframes akPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.15); }
  }
`;
