import React, { useState, useCallback, useEffect } from 'react';
import {
  User,
  Globe,
  GraduationCap,
  Briefcase,
  Users2,
  BookOpen,
  FileText,
  Keyboard,
  Download,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { PersonalSection } from '../../options/components/PersonalSection';
import { ProfilesSection } from '../../options/components/ProfilesSection';
import { EducationSection } from '../../options/components/EducationSection';
import { ProfessionalSection } from '../../options/components/ProfessionalSection';
import { PersonasSection } from '../../options/components/PersonasSection';
import { SnippetVaultSection } from '../../options/components/SnippetVaultSection';
import { DocumentsSection } from '../../options/components/DocumentsSection';
import { ShortcutsGuide } from '../../options/components/ShortcutsGuide';
import { ImportExport } from '../../options/components/ImportExport';
import { PrivacyManifest } from '../../options/components/PrivacyManifest';
import { profileStore } from '../../storage/profile-store';

export type ProfileTabKey =
  | 'personal'
  | 'profiles'
  | 'education'
  | 'professional'
  | 'personas'
  | 'vault'
  | 'documents'
  | 'shortcuts'
  | 'import-export'
  | 'privacy';

interface WebProfileManagerProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => Promise<void>;
  activeSubTab?: ProfileTabKey;
  onSelectSubTab?: (tab: ProfileTabKey) => void;
}

export const WebProfileManager: React.FC<WebProfileManagerProps> = ({
  profile,
  onSaveProfile,
  activeSubTab: controlledSubTab,
  onSelectSubTab,
}) => {
  const [internalSubTab, setInternalSubTab] = useState<ProfileTabKey>(controlledSubTab || 'personal');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Synchronize internal tab if controlled prop changes
  useEffect(() => {
    if (controlledSubTab && controlledSubTab !== internalSubTab) {
      setInternalSubTab(controlledSubTab);
    }
  }, [controlledSubTab]);

  const currentSubTab = controlledSubTab || internalSubTab;

  const handleSubTabChange = (tab: ProfileTabKey) => {
    setInternalSubTab(tab);
    onSelectSubTab?.(tab);
  };

  const handleProfilePatch = useCallback(
    async (patch: Partial<UserProfile>) => {
      setSaveStatus('saving');
      const updated: UserProfile = {
        ...profile,
        ...patch,
      };
      await onSaveProfile(updated);
      setTimeout(() => {
        setSaveStatus('saved');
      }, 400);
    },
    [profile, onSaveProfile]
  );

  const completeness = profileStore.calculateCompleteness(profile);

  const subTabs: Array<{ id: ProfileTabKey; label: string; icon: React.ReactNode }> = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'profiles', label: 'Profiles & URLs', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'professional', label: 'Skills & Bio', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'personas', label: 'Work Personas', icon: <Users2 className="w-3.5 h-3.5" /> },
    { id: 'vault', label: 'Answer Vault', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'documents', label: 'Resume', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard className="w-3.5 h-3.5" /> },
    { id: 'import-export', label: 'Data & Backup', icon: <Download className="w-3.5 h-3.5" /> },
    { id: 'privacy', label: 'Privacy', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title & Completeness Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Candidate Profile &amp; Master Credentials
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Unified profile used by the ApplyKit browser extension for 1-click autofill and ATS resume tailoring.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status Indicator */}
          <div className="text-xs">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Saving changes...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Synced locally</span>
              </span>
            )}
          </div>

          {/* Profile Completeness Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Completeness:</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
              {completeness.percentage}%
            </span>
            <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${completeness.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sub-navigation and Content Area */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sub-Nav Sidebar */}
        <nav className="w-full md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 bg-zinc-100/70 dark:bg-surface-900/90 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {subTabs.map((tab) => {
            const isActive = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSubTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap text-left ${
                  isActive
                    ? 'bg-white dark:bg-surface-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-surface-800/50'
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

        {/* Content Pane */}
        <div className="flex-1 min-w-0 w-full p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle">
          {currentSubTab === 'personal' && (
            <PersonalSection
              data={profile.personal}
              onChange={(patch) =>
                handleProfilePatch({ personal: { ...profile.personal, ...patch } })
              }
            />
          )}

          {currentSubTab === 'profiles' && (
            <ProfilesSection
              data={profile.profiles}
              onChange={(patch) =>
                handleProfilePatch({ profiles: { ...profile.profiles, ...patch } })
              }
            />
          )}

          {currentSubTab === 'education' && (
            <EducationSection
              data={profile.education}
              onChange={(patch) =>
                handleProfilePatch({ education: { ...profile.education, ...patch } })
              }
            />
          )}

          {currentSubTab === 'professional' && (
            <ProfessionalSection
              data={profile.professional}
              onChange={(patch) =>
                handleProfilePatch({ professional: { ...profile.professional, ...patch } })
              }
            />
          )}

          {currentSubTab === 'personas' && (
            <PersonasSection
              profile={profile}
              onChange={handleProfilePatch}
            />
          )}

          {currentSubTab === 'vault' && (
            <SnippetVaultSection
              snippets={profile.snippets || []}
              onChange={(snippets) => handleProfilePatch({ snippets })}
            />
          )}

          {currentSubTab === 'documents' && (
            <DocumentsSection
              data={profile.documents || {}}
              onChange={(patch) =>
                handleProfilePatch({ documents: { ...profile.documents, ...patch } })
              }
            />
          )}

          {currentSubTab === 'shortcuts' && <ShortcutsGuide />}

          {currentSubTab === 'import-export' && (
            <ImportExport
              onProfileUpdated={(updated) => {
                onSaveProfile(updated);
              }}
            />
          )}

          {currentSubTab === 'privacy' && <PrivacyManifest />}
        </div>
      </div>
    </div>
  );
};
