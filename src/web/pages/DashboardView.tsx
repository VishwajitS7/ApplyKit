import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, WebTabKey } from '../components/Navbar';
import { MetricsBar } from '../components/MetricsBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { ApplicationTable } from '../components/ApplicationTable';
import { ApplicationModal } from '../components/ApplicationModal';
import { CloudSettingsModal } from '../components/CloudSettingsModal';
import { AuthModal } from '../../cloud/AuthModal';
import { WebProfileManager, ProfileTabKey } from '../components/WebProfileManager';
import { WebJdStudio } from '../components/WebJdStudio';
import { WebLandingPage } from '../components/WebLandingPage';
import { syncManager } from '../../cloud/sync-manager';
import {
  JobApplication,
  ApplicationStatus,
  TrackerMetrics,
  CloudSyncStatus,
  AuthUser,
} from '../../cloud/sync-types';
import { UserProfile } from '../../types/profile';
import { DEFAULT_PERSONAS, DEFAULT_ANSWER_SNIPPETS } from '../../storage/schema-validator';
import { profileStore } from '../../storage/profile-store';
import { Kanban, Table, Plus, RefreshCw } from 'lucide-react';

const RICH_DEFAULT_PROFILE: UserProfile = {
  personal: {
    fullName: 'Alex Rivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
  },
  profiles: {
    linkedin: 'https://linkedin.com/in/alexrivera-dev',
    github: 'https://github.com/alexrivera-io',
    leetcode: 'https://leetcode.com/alexrivera',
    portfolio: 'https://alexrivera.dev',
    other: [],
  },
  education: {
    college: 'University of California, Berkeley',
    degree: 'Bachelor of Science',
    branch: 'Computer Science',
    graduationYear: '2024',
    cgpa: '3.88',
  },
  professional: {
    skills: [
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'Docker',
      'Tailwind CSS',
      'AWS',
      'GraphQL',
      'Python',
      'Git',
    ],
    summary:
      'High-impact Full-Stack Software Engineer with 4+ years of experience building modern, accessible web applications and distributed backend microservices. Passionate about developer tooling, performance engineering, and keyboard-centric UX.',
  },
  documents: {
    resume: undefined,
  },
  settings: {
    theme: 'dark',
    overwriteNonEmpty: false,
    hasCompletedOnboarding: true,
  },
  snippets: DEFAULT_ANSWER_SNIPPETS,
  personas: DEFAULT_PERSONAS,
  activePersonaId: 'fullstack',
};

const getTabFromLocation = (): { tab: WebTabKey; subTab?: ProfileTabKey } => {
  if (typeof window === 'undefined') return { tab: 'landing' };

  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab')?.toLowerCase();
  const subTabParam = (searchParams.get('subtab') || searchParams.get('subTab'))?.toLowerCase() as ProfileTabKey;

  // Landing & Guide routes
  if (
    hash === 'landing' ||
    hash === 'guide' ||
    hash === 'overview' ||
    hash === 'home' ||
    hash === 'welcome' ||
    tabParam === 'landing' ||
    tabParam === 'guide'
  ) {
    return { tab: 'landing' };
  }

  // Direct personas routes
  if (hash === 'personas' || hash === 'work-personas' || tabParam === 'personas' || tabParam === 'work-personas') {
    return { tab: 'personas', subTab: 'personas' };
  }
  if (hash === 'studio' || hash === 'ats' || tabParam === 'studio') {
    return { tab: 'studio' };
  }
  if (hash.startsWith('profile') || tabParam === 'profile') {
    const parts = hash.split('/');
    const sub = (parts[1] || subTabParam) as ProfileTabKey;
    return { tab: 'profile', subTab: sub || 'personal' };
  }
  if (hash === 'tracker' || tabParam === 'tracker') {
    return { tab: 'tracker' };
  }

  const knownSubTabs: ProfileTabKey[] = [
    'personal',
    'profiles',
    'education',
    'professional',
    'personas',
    'vault',
    'documents',
    'shortcuts',
    'import-export',
    'privacy',
  ];
  if (knownSubTabs.includes(hash as ProfileTabKey)) {
    return { tab: hash === 'personas' ? 'personas' : 'profile', subTab: hash as ProfileTabKey };
  }

  // Default to landing page when visiting root
  return { tab: 'landing' };
};

export const DashboardView: React.FC = () => {
  const initialRoute = getTabFromLocation();
  const [activeTab, setActiveTab] = useState<WebTabKey>(initialRoute.tab);
  const [profileSubTab, setProfileSubTab] = useState<ProfileTabKey>(initialRoute.subTab || 'personal');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [profile, setProfile] = useState<UserProfile>(RICH_DEFAULT_PROFILE);
  const [metrics, setMetrics] = useState<TrackerMetrics>({
    totalApplications: 0,
    appliedCount: 0,
    interviewingCount: 0,
    offerCount: 0,
    rejectedCount: 0,
    wishlistCount: 0,
    responseRatePercent: 0,
    topSkillsInDemand: [],
  });

  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(syncManager.getCurrentUser());
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('synced');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync tab with URL location / hash
  useEffect(() => {
    const handleLocationChange = () => {
      const { tab, subTab } = getTabFromLocation();
      if (!currentUser && tab !== 'landing') {
        setActiveTab('landing');
        return;
      }
      setActiveTab(tab);
      if (subTab) {
        setProfileSubTab(subTab);
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [currentUser]);

  const handleSelectTab = (tab: WebTabKey) => {
    if (!currentUser && tab !== 'landing') {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    if (tab === 'landing') {
      window.location.hash = '#guide';
    } else if (tab === 'personas') {
      setProfileSubTab('personas');
      window.location.hash = '#personas';
    } else if (tab === 'profile') {
      window.location.hash = profileSubTab && profileSubTab !== 'personal' ? `#profile/${profileSubTab}` : '#profile';
    } else {
      window.location.hash = `#${tab}`;
    }
  };

  // Load applications and profile
  const refreshData = useCallback(async () => {
    try {
      const apps = await syncManager.getApplications();
      const safeApps = Array.isArray(apps) ? apps : [];
      setApplications(safeApps);
      setMetrics(syncManager.calculateMetrics(safeApps));

      const currentProfile = await profileStore.get();
      if (
        currentProfile &&
        (currentProfile.personal?.fullName ||
          currentProfile.personal?.email ||
          currentProfile.settings.hasCompletedOnboarding)
      ) {
        setProfile(currentProfile);
      } else {
        // First run on blank storage: populate unified store with rich starter data
        await profileStore.update(RICH_DEFAULT_PROFILE);
        setProfile(RICH_DEFAULT_PROFILE);
      }
      setSyncStatus(syncManager.getStatus());
    } catch (err) {
      console.error('Error refreshing cloud data:', err);
    }
  }, []);

  useEffect(() => {
    // Initialize sync manager
    syncManager.init().then(() => {
      refreshData();
    });

    // Subscribe to cross-tab / extension sync events
    const unsubscribeSync = syncManager.subscribe(() => {
      refreshData();
    });

    // Subscribe to direct profile store modifications (from options.html or popup)
    const unsubscribeProfile = profileStore.subscribe((updated) => {
      setProfile(updated);
    });

    // Subscribe to Google OAuth / auth state changes
    const unsubscribeAuth = syncManager.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribeSync();
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, [refreshData]);

  // Sync theme with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleStatusUpdate = async (id: string, newStatus: ApplicationStatus) => {
    await syncManager.updateStatus(id, newStatus);
    await refreshData();
  };

  const handleEditApp = (app: JobApplication) => {
    setEditingApp(app);
    setIsAppModalOpen(true);
  };

  const handleCreateNewApp = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingApp(null);
    setIsAppModalOpen(true);
  };

  const handleSaveApp = async (app: JobApplication) => {
    await syncManager.saveApplication(app);
    setIsAppModalOpen(false);
    setEditingApp(null);
    await refreshData();
  };

  const handleDeleteApp = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this tracked job application?')) {
      await syncManager.deleteApplication(id);
      await refreshData();
    }
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await syncManager.saveProfile(updated);
  };

  const handleAddSkillToProfile = async (skill: string) => {
    const currentSkills = profile.professional?.skills || [];
    if (!currentSkills.includes(skill)) {
      const updated: UserProfile = {
        ...profile,
        professional: {
          ...profile.professional,
          skills: [...currentSkills, skill],
        },
      };
      setProfile(updated);
      await syncManager.saveProfile(updated);
    }
  };

  const handleAuthChange = useCallback(
    (user: AuthUser | null) => {
      setCurrentUser(user);
      if (user) {
        setActiveTab('tracker');
        window.location.hash = '#tracker';
      } else {
        setActiveTab('landing');
        window.location.hash = '#guide';
      }
      refreshData();
    },
    [refreshData]
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        syncStatus={syncStatus}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenCloudSettings={() => setIsCloudModalOpen(true)}
        onNewApplication={handleCreateNewApp}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {activeTab === 'landing' && (
          <WebLandingPage
            onNavigateTab={handleSelectTab}
            profile={profile}
            metrics={metrics}
          />
        )}

        {activeTab === 'tracker' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Sub-Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  Application Pipeline &amp; Analytics
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Real-time synchronization with ApplyKit Chrome Extension and Cloud Gateway
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                {/* View switcher: Kanban vs Table */}
                <div className="flex items-center bg-zinc-200/80 dark:bg-surface-850 p-1 rounded-xl border border-zinc-300/50 dark:border-zinc-800 text-xs">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      viewMode === 'kanban'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>Board</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>

                <button
                  onClick={refreshData}
                  title="Refresh Cloud Data"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCreateNewApp}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-brand-600/30 transition-all subtle-interactive"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Application</span>
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <MetricsBar metrics={metrics} />

            {/* Applications View */}
            {viewMode === 'kanban' ? (
              <KanbanBoard
                applications={applications}
                onUpdateStatus={handleStatusUpdate}
                onEditApplication={handleEditApp}
                onDeleteApplication={handleDeleteApp}
              />
            ) : (
              <ApplicationTable
                applications={applications}
                onUpdateStatus={handleStatusUpdate}
                onEditApplication={handleEditApp}
                onDeleteApplication={handleDeleteApp}
              />
            )}
          </div>
        )}

        {(activeTab === 'profile' || activeTab === 'personas') && (
          <div className="animate-fade-in">
            <WebProfileManager
              profile={profile}
              onSaveProfile={handleSaveProfile}
              activeSubTab={activeTab === 'personas' ? 'personas' : profileSubTab}
              onSelectSubTab={(sub) => {
                setProfileSubTab(sub);
                if (sub === 'personas') {
                  setActiveTab('personas');
                  window.location.hash = '#personas';
                } else {
                  setActiveTab('profile');
                  window.location.hash = `#profile/${sub}`;
                }
              }}
            />
          </div>
        )}

        {activeTab === 'studio' && (
          <div className="animate-fade-in">
            <WebJdStudio profile={profile} onAddSkill={handleAddSkillToProfile} />
          </div>
        )}
      </main>

      {/* Application Create / Edit Modal */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApp}
        editingApp={editingApp}
      />

      {/* Cloud Settings & Sync Modal */}
      <CloudSettingsModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        syncManager={syncManager}
        onSyncCompleted={refreshData}
      />

      {/* Google OAuth & Security Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthChange={handleAuthChange}
      />
    </div>
  );
};
