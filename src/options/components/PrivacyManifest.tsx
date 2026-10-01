import React from 'react';
import { ShieldCheck, Lock, EyeOff, Cpu, Key } from 'lucide-react';

export const PrivacyManifest: React.FC = () => {
  const principles = [
    {
      icon: <Lock className="w-4 h-4 text-emerald-500" />,
      title: '100% Local Storage',
      desc: 'All your profile values and resume data are stored exclusively in chrome.storage.local on your personal machine.',
    },
    {
      icon: <EyeOff className="w-4 h-4 text-emerald-500" />,
      title: 'Zero Analytics & Tracking',
      desc: 'ApplyKit contains zero telemetry, analytics scripts, trackers, or cookies. We have no backend servers and collect no data.',
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      title: 'Never Auto-Submits',
      desc: 'ApplyKit never clicks "Submit Application" or "Apply". The user always reviews and manually submits every application.',
    },
    {
      icon: <Key className="w-4 h-4 text-emerald-500" />,
      title: 'No Credential Storage',
      desc: 'ApplyKit never requests or stores account passwords, banking details, or sensitive government credentials.',
    },
  ];

  const permissions = [
    {
      name: 'storage',
      why: 'Required to persist your profile fields and user settings locally inside the browser.',
    },
    {
      name: 'clipboardWrite',
      why: 'Allows 1-click Quick Copy of profile values and keyboard shortcut copying directly to your clipboard.',
    },
    {
      name: 'activeTab',
      why: 'Grants temporary access to detect form inputs only on the specific tab you actively open ApplyKit on.',
    },
    {
      name: 'scripting',
      why: 'Enables safe inspection and autofilling of detected form fields without broad permanent site access.',
    },
    {
      name: 'commands',
      why: 'Enables customizable global keyboard shortcuts (e.g. Ctrl+Shift+L) for quick URL copying.',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Privacy & Permissions
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          ApplyKit was built with privacy-by-design. Your data never leaves your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {principles.map((p) => (
          <div
            key={p.title}
            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-1.5"
          >
            <div className="flex items-center gap-2 font-semibold text-xs text-zinc-900 dark:text-white">
              {p.icon}
              <span>{p.title}</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-brand-500" />
          <span>Chrome Permissions Rationale</span>
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          ApplyKit asks for the minimum set of permissions necessary to function as a local utility:
        </p>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-surface-800 border-b border-zinc-200 dark:border-zinc-750 text-zinc-600 dark:text-zinc-300 font-semibold">
                <th className="py-2.5 px-3">Permission</th>
                <th className="py-2.5 px-3">Why it is needed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
              {permissions.map((perm) => (
                <tr key={perm.name} className="hover:bg-zinc-50/50 dark:hover:bg-surface-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-brand-600 dark:text-brand-400">
                    {perm.name}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {perm.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
