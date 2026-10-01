import React from 'react';
import {
  Sparkles,
  Cloud,
  Kanban,
  User,
  Users2,
  Cpu,
  Moon,
  Sun,
  Settings,
  Plus,
  Compass,
} from 'lucide-react';
import { CloudSyncStatus, AuthUser } from '../../cloud/sync-types';

export type WebTabKey = 'landing' | 'tracker' | 'profile' | 'personas' | 'studio';

interface NavbarProps {
  activeTab: WebTabKey;
  onSelectTab: (tab: WebTabKey) => void;
  syncStatus: CloudSyncStatus;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCloudSettings: () => void;
  onNewApplication: () => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  syncStatus,
  theme,
  onToggleTheme,
  onOpenCloudSettings,
  onNewApplication,
  currentUser,
  onOpenAuthModal,
}) => {
  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Brand & Tabs */}
      <div className="flex items-center gap-8">
        <div
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to ApplyKit Home & User Guide"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                ApplyKit
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold">
                Cloud
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - ONLY visible after logging in */}
        {currentUser && (
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-xl text-xs font-medium animate-fade-in">
            <button
              onClick={() => onSelectTab('landing')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'landing'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Guide &amp; Overview</span>
            </button>

            <button
              onClick={() => onSelectTab('tracker')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'tracker'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Applications Tracker</span>
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Candidate Profile</span>
            </button>

            <button
              onClick={() => onSelectTab('personas')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'personas'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Work Personas</span>
            </button>

            <button
              onClick={() => onSelectTab('studio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'studio'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>ATS Resume Studio</span>
            </button>
          </nav>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Actions only visible after logging in */}
        {currentUser && (
          <>
            <button
              onClick={onNewApplication}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-brand-600/30 transition-all subtle-interactive"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Application</span>
            </button>

            {/* Cloud Sync Status Badge */}
            <button
              onClick={onOpenCloudSettings}
              title="Cloud sync settings"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3.5 h-3.5 text-zinc-500" />
              <span>{syncStatus === 'synced' ? 'Cloud Synced' : 'Syncing...'}</span>
            </button>

            {/* Cloud Settings Gear */}
            <button
              onClick={onOpenCloudSettings}
              title="Configure Cloud Provider (Firebase / Local)"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Google OAuth Account Action */}
        {currentUser ? (
          <button
            onClick={onOpenAuthModal}
            title={`Signed in as ${currentUser.displayName || currentUser.email}`}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-all text-xs"
          >
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px]">
                {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
              </div>
            )}
            <span className="max-w-[100px] truncate font-medium text-zinc-800 dark:text-zinc-200 text-xs">
              {currentUser.displayName || currentUser.email?.split('@')[0]}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            title="Sign in with Google for cloud backup & sync"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-surface-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-xs font-semibold text-zinc-900 dark:text-white transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle Theme"
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
