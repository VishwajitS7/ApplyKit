import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Sidebar, TabKey } from '../components/Sidebar';
import { PersonalSection } from '../components/PersonalSection';
import { ProfilesSection } from '../components/ProfilesSection';
import { EducationSection } from '../components/EducationSection';
import { ProfessionalSection } from '../components/ProfessionalSection';
import { PersonasSection } from '../components/PersonasSection';
import { SnippetVaultSection } from '../components/SnippetVaultSection';
import { DocumentsSection } from '../components/DocumentsSection';
import { ShortcutsGuide } from '../components/ShortcutsGuide';
import { ImportExport } from '../components/ImportExport';
import { PrivacyManifest } from '../components/PrivacyManifest';
import { profileStore } from '../../storage/profile-store';
import { UserProfile } from '../../types/profile';
import { applyTheme, ThemeMode } from '../../utils/theme';
import { Check, Sun, Moon, Monitor } from 'lucide-react';
import { AuthModal } from '../../cloud/AuthModal';
import { syncManager } from '../../cloud/sync-manager';
import { AuthUser } from '../../cloud/sync-types';

const getTabFromLocation = (): TabKey => {
  if (typeof window === 'undefined') return 'personal';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab')?.toLowerCase();

  const target = hash || tabParam;
  if (target === 'personas' || target === 'work-personas' || target === 'roles') {
    return 'personas';
  }
  const validTabs: TabKey[] = [
    'personal',
    'profiles',
    'education',
    'professional',
    'personas',
    'vault',
    'documents',
    'shortcuts',
    'backup',
    'privacy',
  ];
  if (validTabs.includes(target as TabKey)) {
    return target as TabKey;
  }
  return 'personal';
};

export const OptionsApp: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromLocation);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(syncManager.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromLocation());
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    const unsubAuth = syncManager.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      unsubAuth();
    };
  }, []);

  const handleSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
  };

  useEffect(() => {
    async function load() {
      const p = await profileStore.get();
      setProfile(p);
      applyTheme(p.settings.theme);
    }
    load();

    const unsubscribe = profileStore.subscribe((updated) => {
      setProfile(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleProfilePatch = useCallback(
    async (patch: Partial<UserProfile>) => {
      setSaveStatus('saving');
      const updated = await profileStore.update(patch);
      setProfile(updated);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('saved');
      }, 500);
    },
    []
  );

  const handleThemeChange = async (mode: ThemeMode) => {
    applyTheme(mode);
    await handleProfilePatch({ settings: { ...profile!.settings, theme: mode } });
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-900">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const completeness = profileStore.calculateCompleteness(profile);

  return (
    <div className="min-h-screen flex bg-white dark:bg-surface-900 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        completeness={completeness.percentage}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 px-8 flex items-center justify-between bg-white/80 dark:bg-surface-900/80 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Saving changes...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>All changes saved locally</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Google OAuth Account Action */}
            {currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                title={`Signed in as ${currentUser.displayName || currentUser.email}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-surface-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs"
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[9px]">
                    {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                  </div>
                )}
                <span className="max-w-[110px] truncate font-medium text-zinc-800 dark:text-zinc-200">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                title="Sign in with Google for cloud backup & sync"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-surface-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google Sign-In</span>
              </button>
            )}

            {/* Theme Selector */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
              <button
                onClick={() => handleThemeChange('light')}
                title="Light theme"
                className={`p-1.5 rounded-md transition-colors ${
                  profile.settings.theme === 'light'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                title="Dark theme"
                className={`p-1.5 rounded-md transition-colors ${
                  profile.settings.theme === 'dark'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                title="System theme"
                className={`p-1.5 rounded-md transition-colors ${
                  profile.settings.theme === 'system'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Tab views */}
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'personal' && (
            <PersonalSection
              data={profile.personal}
              onChange={(patch) =>
                handleProfilePatch({ personal: { ...profile.personal, ...patch } })
              }
            />
          )}

          {activeTab === 'profiles' && (
            <ProfilesSection
              data={profile.profiles}
              onChange={(patch) =>
                handleProfilePatch({ profiles: { ...profile.profiles, ...patch } })
              }
            />
          )}

          {activeTab === 'education' && (
            <EducationSection
              data={profile.education}
              onChange={(patch) =>
                handleProfilePatch({ education: { ...profile.education, ...patch } })
              }
            />
          )}

          {activeTab === 'professional' && (
            <ProfessionalSection
              data={profile.professional}
              resume={profile.documents?.resume}
              onChange={(patch) =>
                handleProfilePatch({ professional: { ...profile.professional, ...patch } })
              }
            />
          )}

          {activeTab === 'personas' && (
            <PersonasSection
              profile={profile}
              onChange={handleProfilePatch}
            />
          )}

          {activeTab === 'vault' && (
            <SnippetVaultSection
              snippets={profile.snippets || []}
              onChange={(updatedSnippets) =>
                handleProfilePatch({ snippets: updatedSnippets })
              }
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsSection
              data={profile.documents}
              onChange={(patch) =>
                handleProfilePatch({ documents: { ...profile.documents, ...patch } })
              }
            />
          )}

          {activeTab === 'shortcuts' && <ShortcutsGuide />}

          {activeTab === 'backup' && (
            <ImportExport
              onProfileUpdated={(newProfile) => setProfile(newProfile)}
            />
          )}

          {activeTab === 'privacy' && <PrivacyManifest />}
        </div>
      </main>

      {/* Google OAuth & Security Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthChange={setCurrentUser}
      />
    </div>
  );
};
