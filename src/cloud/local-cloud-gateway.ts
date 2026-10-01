import { ICloudProvider } from './cloud-provider';
import { JobApplication, CloudConfig, CloudSyncStatus } from './sync-types';
import { UserProfile } from '../types/profile';
import { profileStore } from '../storage/profile-store';

const STORAGE_KEY_APPS = 'applykit_cloud_applications_v1';

export const INITIAL_DEMO_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-acme-1',
    company: 'Acme Corporation',
    role: 'Senior Full-Stack Engineer',
    url: 'https://careers.acme.com/engineering/senior-fullstack',
    status: 'interviewing',
    appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    salary: '$160,000 - $185,000',
    location: 'San Francisco, CA (Hybrid)',
    notes: 'Recruiter screen went great. Technical system design scheduled for Thursday.',
    matchedSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
    tailoredSummary: 'Senior Full-Stack Engineer with proven experience designing and delivering scalable systems using TypeScript, React, Node.js, and PostgreSQL.',
    interviewRounds: [
      { id: 'r1', title: 'Recruiter Screen', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), completed: true, notes: 'Discussed past projects and compensation expectations.' },
      { id: 'r2', title: 'System Design Interview', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), completed: false, notes: 'Focus on distributed data ingestion and caching architecture.' },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'app-linear-2',
    company: 'Linear',
    role: 'Product Engineer',
    url: 'https://linear.app/careers/product-engineer',
    status: 'applied',
    appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    salary: '$170,000 - $190,000',
    location: 'Remote (US/EU)',
    notes: 'Autofilled with ApplyKit extension. Highlighted performance and keyboard-first UX.',
    matchedSkills: ['TypeScript', 'React', 'GraphQL', 'Tailwind CSS', 'WebSockets'],
    tailoredSummary: 'Product Engineer specializing in crafting keyboard-centric, high-performance web applications with TypeScript and React.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'app-stripe-3',
    company: 'Stripe',
    role: 'Infrastructure & Cloud Engineer',
    url: 'https://stripe.com/jobs/infrastructure-engineer',
    status: 'offer',
    appliedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    salary: '$195,000 + Equity',
    location: 'Seattle, WA / Remote',
    notes: 'Formal written offer received! Reviewing benefits and equity vest schedule.',
    matchedSkills: ['Python', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    tailoredSummary: 'Cloud & Infrastructure Engineer focused on high-availability cloud architecture, automated CI/CD pipelines, and multi-region resilience.',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'app-vercel-4',
    company: 'Vercel',
    role: 'Frontend Systems Engineer',
    url: 'https://vercel.com/careers/frontend-systems',
    status: 'wishlist',
    appliedDate: new Date().toISOString(),
    salary: '$165,000 - $185,000',
    location: 'Remote',
    notes: 'Drafting application cover note highlighting Next.js internals and edge rendering.',
    matchedSkills: ['Next.js', 'React', 'TypeScript', 'Web Performance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class LocalCloudGateway implements ICloudProvider {
  readonly id = 'local_gateway';
  readonly name = 'ApplyKit Cloud Sync (Local Gateway)';

  private status: CloudSyncStatus = 'synced';
  private broadcastChannel: BroadcastChannel | null = null;
  private changeListeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('applykit_cloud_sync_events');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'SYNC_EVENT') {
            this.notifyListeners();
          }
        };
      } catch {
        // Fallback for restricted environments
      }
    }

    try {
      profileStore.subscribe(() => {
        this.notifyListeners();
      });
    } catch {
      // Ignore if not initialized
    }
  }

  async init(_config: CloudConfig): Promise<void> {
    this.status = 'synced';
    // Ensure initial demo apps exist if storage is empty
    const current = await this.fetchApplications();
    if (current.length === 0) {
      await this.saveAll(INITIAL_DEMO_APPLICATIONS);
    }
  }

  getStatus(): CloudSyncStatus {
    return this.status;
  }

  subscribe(listener: () => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.changeListeners) {
      try {
        listener();
      } catch (err) {
        console.error('[Cloud Gateway] Error notifying listener:', err);
      }
    }
  }

  private broadcastChange() {
    this.notifyListeners();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'SYNC_EVENT', timestamp: Date.now() });
      } catch {
        // Channel closed or ignored
      }
    }
  }

  async fetchApplications(): Promise<JobApplication[]> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return [];
      }
      const raw = window.localStorage.getItem(STORAGE_KEY_APPS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('[Cloud Gateway] Failed to read applications:', err);
      return [];
    }
  }

  async saveApplication(app: JobApplication): Promise<JobApplication> {
    const list = await this.fetchApplications();
    const existingIndex = list.findIndex((item) => item.id === app.id);
    const now = new Date().toISOString();

    const updatedApp: JobApplication = {
      ...app,
      updatedAt: now,
      createdAt: app.createdAt || now,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedApp;
    } else {
      list.unshift(updatedApp);
    }

    await this.saveAll(list);
    this.broadcastChange();
    return updatedApp;
  }

  async deleteApplication(id: string): Promise<boolean> {
    const list = await this.fetchApplications();
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length !== list.length) {
      await this.saveAll(filtered);
      this.broadcastChange();
      return true;
    }
    return false;
  }

  async fetchProfile(): Promise<UserProfile | null> {
    try {
      const profile = await profileStore.get();
      return profile;
    } catch {
      return null;
    }
  }

  async saveProfile(profile: UserProfile): Promise<boolean> {
    try {
      await profileStore.update(profile);
      this.broadcastChange();
      return true;
    } catch {
      return false;
    }
  }

  async pushAll(applications: JobApplication[], profile?: UserProfile): Promise<boolean> {
    await this.saveAll(applications);
    if (profile) {
      await this.saveProfile(profile);
    }
    this.broadcastChange();
    return true;
  }

  private async saveAll(apps: JobApplication[]): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    }
  }
}

export const localCloudGateway = new LocalCloudGateway();
