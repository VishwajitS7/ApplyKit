import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

export const ShortcutsGuide: React.FC = () => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const modKey = isMac ? 'Command' : 'Ctrl';

  const shortcuts = [
    {
      action: 'Copy LinkedIn URL',
      keys: `${modKey} + Shift + L`,
      description: 'Copies stored LinkedIn profile URL to clipboard and displays an in-page toast',
    },
    {
      action: 'Copy GitHub URL',
      keys: `${modKey} + Shift + G`,
      description: 'Copies stored GitHub profile URL to clipboard',
    },
    {
      action: 'Copy LeetCode URL',
      keys: `${modKey} + Shift + C`,
      description: 'Copies stored LeetCode profile URL to clipboard',
    },
    {
      action: 'Copy Portfolio URL',
      keys: `${modKey} + Shift + P`,
      description: 'Copies stored Portfolio / Website URL to clipboard',
    },
  ];

  const handleOpenChromeShortcuts = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    } else {
      window.open('chrome://extensions/shortcuts', '_blank');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Keyboard Shortcuts
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Instant quick-copy shortcuts to paste frequently requested URLs into job forms.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 overflow-hidden shadow-subtle">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-surface-800 border-b border-zinc-200 dark:border-zinc-750 text-zinc-600 dark:text-zinc-300 font-semibold">
              <th className="py-2.5 px-3.5">Action</th>
              <th className="py-2.5 px-3.5">Default Shortcut</th>
              <th className="py-2.5 px-3.5">Behavior</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
            {shortcuts.map((sc) => (
              <tr key={sc.action} className="hover:bg-zinc-50/50 dark:hover:bg-surface-800/40 transition-colors">
                <td className="py-2.5 px-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {sc.action}
                </td>
                <td className="py-2.5 px-3.5">
                  <kbd className="kbd-shortcut text-[11px] font-mono">
                    {sc.keys}
                  </kbd>
                </td>
                <td className="py-2.5 px-3.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {sc.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-50/50 dark:bg-brand-950/20 space-y-2.5">
        <div className="flex items-start gap-2 text-xs text-brand-800 dark:text-brand-300">
          <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">How to customize keyboard shortcuts:</p>
            <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              Chromium browser extensions manage global keyboard shortcuts through Chrome's native manager. You can customize, reassign, or remove any shortcut to prevent conflicts with other apps.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenChromeShortcuts}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-surface-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-surface-750 shadow-subtle transition-colors"
        >
          <span>Open chrome://extensions/shortcuts</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
    </div>
  );
};
