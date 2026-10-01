import React from 'react';
import {
  User,
  Globe,
  GraduationCap,
  Briefcase,
  FileText,
  Keyboard,
  Database,
  Shield,
  Sparkles,
  BookOpen,
  Users,
} from 'lucide-react';

export type TabKey =
  | 'personal'
  | 'profiles'
  | 'education'
  | 'professional'
  | 'personas'
  | 'vault'
  | 'documents'
  | 'shortcuts'
  | 'backup'
  | 'privacy';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  completeness: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  completeness,
}) => {
  const tabs = [
    { key: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
    { key: 'profiles', label: 'Online Profiles & Links', icon: <Globe className="w-4 h-4" /> },
    { key: 'education', label: 'Education & Academics', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'professional', label: 'Skills & Summary', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'personas', label: 'Personas & Roles', icon: <Users className="w-4 h-4" /> },
    { key: 'vault', label: 'Answer Vault & Snippets', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'documents', label: 'Resume & Documents', icon: <FileText className="w-4 h-4" /> },
    { key: 'shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard className="w-4 h-4" /> },
    { key: 'backup', label: 'Data & Backup', icon: <Database className="w-4 h-4" /> },
    { key: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between bg-zinc-50/50 dark:bg-surface-850/50">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
              ApplyKit
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Profile Dashboard
            </p>
          </div>
        </div>

        {/* Completeness Pill */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 shadow-subtle">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-zinc-600 dark:text-zinc-400">Completeness</span>
            <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
              {completeness}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key as TabKey)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="px-2 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
        <p>100% Local Storage</p>
        <p className="font-mono text-[10px] text-zinc-500">v1.0.0 · MV3</p>
      </div>
    </aside>
  );
};
