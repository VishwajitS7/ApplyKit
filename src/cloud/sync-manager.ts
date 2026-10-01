import { localCloudGateway } from './local-cloud-gateway';
import { firebaseCloudProvider } from './firebase-provider';
import { firebaseAuth } from './firebase-auth';
import { ICloudProvider } from './cloud-provider';
import {
  JobApplication,
  ApplicationStatus,
  TrackerMetrics,
  CloudConfig,
  CloudSyncStatus,
  CloudSyncPayload,
  AuthUser,
  FirebaseConfig,
} from './sync-types';
import { UserProfile } from '../types/profile';

export class SyncManager {
  private provider: ICloudProvider = localCloudGateway;
  private config: CloudConfig = {
    provider: 'local_gateway',
    autoSync: true,
  };

  async init(): Promise<void> {
    // Check if Firebase is configured
    const fbConfig = await firebaseAuth.getStoredConfig();
    if (fbConfig) {
      this.config.firebaseConfig = fbConfig;
      this.config.provider = 'firebase';
      await firebaseCloudProvider.init(this.config);
    } else {
      await this.provider.init(this.config);
    }

    // Auto-switch provider on auth state change
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        this.provider = firebaseCloudProvider;
        this.config.provider = 'firebase';
      } else {
        this.provider = localCloudGateway;
        this.config.provider = 'local_gateway';
      }
    });
  }

  setProvider(provider: ICloudProvider, config: CloudConfig) {
    this.provider = provider;
    this.config = config;
    this.provider.init(config);
  }

  getCurrentUser(): AuthUser | null {
    return firebaseAuth.getCurrentUser();
  }

  isCloudAuthenticated(): boolean {
    return firebaseAuth.getCurrentUser() !== null;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        this.provider = firebaseCloudProvider;
        this.config.provider = 'firebase';
      } else {
        this.provider = localCloudGateway;
        this.config.provider = 'local_gateway';
      }
      callback(user);
    });
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const user = await firebaseAuth.signInWithGoogle();
    this.provider = firebaseCloudProvider;
    this.config.provider = 'firebase';
    return user;
  }

  async signInWithDemoGoogle(customEmail?: string): Promise<AuthUser> {
    const user = await firebaseAuth.signInWithDemoGoogle(customEmail);
    this.provider = firebaseCloudProvider;
    this.config.provider = 'firebase';
    return user;
  }

  async signOut(): Promise<void> {
    await firebaseAuth.signOut();
    this.provider = localCloudGateway;
    this.config.provider = 'local_gateway';
  }

  async getFirebaseConfig(): Promise<FirebaseConfig | null> {
    return firebaseAuth.getStoredConfig();
  }

  async saveFirebaseConfig(cfg: FirebaseConfig | null): Promise<void> {
    await firebaseAuth.saveStoredConfig(cfg);
    if (cfg) {
      this.config.firebaseConfig = cfg;
      this.config.provider = 'firebase';
      await firebaseCloudProvider.init(this.config);
    }
  }

  getProvider(): ICloudProvider {
    return this.provider;
  }

  getConfig(): CloudConfig {
    return this.config;
  }

  getStatus(): CloudSyncStatus {
    return this.provider.getStatus();
  }

  subscribe(listener: () => void): () => void {
    if ('subscribe' in this.provider && typeof (this.provider as any).subscribe === 'function') {
      return (this.provider as any).subscribe(listener);
    }
    return () => {};
  }

  async getApplications(): Promise<JobApplication[]> {
    return this.provider.fetchApplications();
  }

  async saveApplication(app: JobApplication): Promise<JobApplication> {
    return this.provider.saveApplication(app);
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<JobApplication | null> {
    const list = await this.provider.fetchApplications();
    const app = list.find((a) => a.id === id);
    if (!app) return null;

    const updated: JobApplication = {
      ...app,
      status,
      updatedAt: new Date().toISOString(),
    };
    return this.provider.saveApplication(updated);
  }

  async deleteApplication(id: string): Promise<boolean> {
    return this.provider.deleteApplication(id);
  }

  async addInterviewRound(
    appId: string,
    round: { title: string; date: string; notes?: string }
  ): Promise<JobApplication | null> {
    const list = await this.provider.fetchApplications();
    const app = list.find((a) => a.id === appId);
    if (!app) return null;

    const newRound = {
      id: `round-${Date.now()}`,
      title: round.title,
      date: round.date,
      notes: round.notes,
      completed: false,
    };

    const currentRounds = app.interviewRounds || [];
    const updated: JobApplication = {
      ...app,
      status: app.status === 'applied' || app.status === 'wishlist' ? 'interviewing' : app.status,
      interviewRounds: [...currentRounds, newRound],
      updatedAt: new Date().toISOString(),
    };

    return this.provider.saveApplication(updated);
  }

  calculateMetrics(apps: JobApplication[]): TrackerMetrics {
    const totalApplications = apps.length;
    let appliedCount = 0;
    let interviewingCount = 0;
    let offerCount = 0;
    let rejectedCount = 0;
    let wishlistCount = 0;

    const skillCounts = new Map<string, number>();

    for (const app of apps) {
      switch (app.status) {
        case 'wishlist':
          wishlistCount++;
          break;
        case 'applied':
          appliedCount++;
          break;
        case 'interviewing':
          interviewingCount++;
          break;
        case 'offer':
          offerCount++;
          break;
        case 'rejected':
          rejectedCount++;
          break;
      }

      if (app.matchedSkills) {
        for (const skill of app.matchedSkills) {
          skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
        }
      }
    }

    const activeDecisions = appliedCount + interviewingCount + offerCount + rejectedCount;
    const positiveResponses = interviewingCount + offerCount;
    const responseRatePercent =
      activeDecisions > 0 ? Math.round((positiveResponses / activeDecisions) * 100) : 0;

    const topSkillsInDemand = Array.from(skillCounts.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalApplications,
      appliedCount,
      interviewingCount,
      offerCount,
      rejectedCount,
      wishlistCount,
      responseRatePercent,
      topSkillsInDemand,
    };
  }

  async syncNow(): Promise<{ success: boolean; syncedApplicationsCount: number; timestamp: string; error?: string }> {
    try {
      const apps = await this.provider.fetchApplications();
      return {
        success: true,
        syncedApplicationsCount: apps.length,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        syncedApplicationsCount: 0,
        timestamp: new Date().toISOString(),
        error: err?.message || 'Sync failed',
      };
    }
  }

  async getProfile(): Promise<UserProfile | null> {
    return this.provider.fetchProfile();
  }

  async saveProfile(profile: UserProfile): Promise<boolean> {
    return this.provider.saveProfile(profile);
  }

  async exportCloudData(): Promise<CloudSyncPayload> {
    const applications = await this.provider.fetchApplications();
    const profile = await this.provider.fetchProfile();
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      applications,
      profile: profile || undefined,
    };
  }

  async exportBackupData(): Promise<CloudSyncPayload> {
    return this.exportCloudData();
  }

  async importCloudData(jsonString: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const parsed: CloudSyncPayload = JSON.parse(jsonString);
      return this.importBackupData(parsed);
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async importBackupData(parsed: CloudSyncPayload): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      if (!parsed || !Array.isArray(parsed.applications)) {
        return { success: false, error: 'Invalid cloud payload structure: missing applications array' };
      }
      await this.provider.pushAll(parsed.applications, parsed.profile);
      return { success: true, count: parsed.applications.length };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}

export const syncManager = new SyncManager();
