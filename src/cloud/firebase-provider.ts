import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { ICloudProvider } from './cloud-provider';
import { JobApplication, CloudConfig, CloudSyncStatus } from './sync-types';
import { UserProfile } from '../types/profile';
import { firebaseAuth } from './firebase-auth';
import { localCloudGateway } from './local-cloud-gateway';

export class FirebaseCloudProvider implements ICloudProvider {
  readonly id = 'firebase';
  readonly name = 'Google Firebase Cloud Sync';

  private db: Firestore | null = null;
  private status: CloudSyncStatus = 'offline';
  private listeners: Set<() => void> = new Set();
  private authUnsub: (() => void) | null = null;

  async init(config: CloudConfig): Promise<void> {
    const isReady = await firebaseAuth.init(config.firebaseConfig);
    const app = firebaseAuth.getFirebaseApp();

    if (isReady && app) {
      try {
        this.db = getFirestore(app);
        this.status = firebaseAuth.getCurrentUser() ? 'synced' : 'offline';
      } catch (e) {
        console.warn('[ApplyKit Firebase Provider] Firestore init error, using local-scoped fallback:', e);
        this.db = null;
        this.status = 'offline';
      }
    } else {
      this.db = null;
      this.status = firebaseAuth.getCurrentUser() ? 'synced' : 'offline';
    }

    if (this.authUnsub) {
      this.authUnsub();
      this.authUnsub = null;
    }

    this.authUnsub = firebaseAuth.onAuthStateChanged((user) => {
      this.status = user ? 'synced' : 'offline';
      this.notifyListeners();
    });
  }

  getStatus(): CloudSyncStatus {
    return this.status;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private getScopedKey(suffix: string): string {
    const user = firebaseAuth.getCurrentUser();
    const uid = user ? user.uid : 'anonymous';
    return `applykit_cloud_${uid}_${suffix}`;
  }

  private async getLocalScoped<T>(key: string, fallback: T): Promise<T> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (res) => {
          resolve(res[key] ? JSON.parse(res[key]) : fallback);
        });
      });
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    }
    return fallback;
  }

  private async setLocalScoped<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: serialized }, () => resolve());
      });
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, serialized);
    }
  }

  // --- Applications ---

  async fetchApplications(): Promise<JobApplication[]> {
    const user = firebaseAuth.getCurrentUser();
    if (!user) {
      return localCloudGateway.fetchApplications();
    }

    this.status = 'synced';

    // 1. Try Live Firestore if available and user is authenticated via Google
    if (this.db && user.providerId === 'google.com') {
      try {
        const appsCol = collection(this.db, 'users', user.uid, 'applications');
        const snap = await getDocs(appsCol);
        const apps: JobApplication[] = [];
        snap.forEach((d) => {
          apps.push(d.data() as JobApplication);
        });

        if (apps.length > 0) {
          await this.setLocalScoped(this.getScopedKey('apps'), apps);
          return apps;
        }
      } catch (err) {
        console.warn('[ApplyKit Firebase] Firestore fetch notice, using cached local:', err);
      }
    }

    // 2. Demo mode or offline cached
    const cached = await this.getLocalScoped<JobApplication[]>(this.getScopedKey('apps'), []);
    if (cached.length === 0) {
      const defaultApps = await localCloudGateway.fetchApplications();
      await this.setLocalScoped(this.getScopedKey('apps'), defaultApps);
      return defaultApps;
    }

    return cached;
  }

  async saveApplication(app: JobApplication): Promise<JobApplication> {
    const user = firebaseAuth.getCurrentUser();
    if (!user) {
      return localCloudGateway.saveApplication(app);
    }

    this.status = 'syncing';
    this.notifyListeners();

    // 1. Save in Firestore if live
    if (this.db && user.providerId === 'google.com') {
      try {
        const docRef = doc(this.db, 'users', user.uid, 'applications', app.id);
        await setDoc(docRef, app);
      } catch (err) {
        console.warn('[ApplyKit Firebase] Firestore save error:', err);
      }
    }

    // 2. Save in scoped local cache
    const current = await this.getLocalScoped<JobApplication[]>(this.getScopedKey('apps'), []);
    const idx = current.findIndex((a) => a.id === app.id);
    let updated: JobApplication[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = app;
    } else {
      updated = [app, ...current];
    }
    await this.setLocalScoped(this.getScopedKey('apps'), updated);

    this.status = 'synced';
    this.notifyListeners();
    return app;
  }

  async deleteApplication(id: string): Promise<boolean> {
    const user = firebaseAuth.getCurrentUser();
    if (!user) {
      return localCloudGateway.deleteApplication(id);
    }

    this.status = 'syncing';
    this.notifyListeners();

    // 1. Delete from Firestore if live
    if (this.db && user.providerId === 'google.com') {
      try {
        const docRef = doc(this.db, 'users', user.uid, 'applications', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[ApplyKit Firebase] Firestore delete error:', err);
      }
    }

    // 2. Delete from scoped local cache
    const current = await this.getLocalScoped<JobApplication[]>(this.getScopedKey('apps'), []);
    const filtered = current.filter((a) => a.id !== id);
    await this.setLocalScoped(this.getScopedKey('apps'), filtered);

    this.status = 'synced';
    this.notifyListeners();
    return true;
  }

  // --- Profile Sync ---

  async fetchProfile(): Promise<UserProfile | null> {
    const user = firebaseAuth.getCurrentUser();
    if (!user) return null;

    if (this.db && user.providerId === 'google.com') {
      try {
        const docRef = doc(this.db, 'users', user.uid, 'profile', 'master');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          await this.setLocalScoped(this.getScopedKey('profile'), profile);
          return profile;
        }
      } catch (err) {
        console.warn('[ApplyKit Firebase] Firestore profile fetch error:', err);
      }
    }

    return this.getLocalScoped<UserProfile | null>(this.getScopedKey('profile'), null);
  }

  async saveProfile(profile: UserProfile): Promise<boolean> {
    const user = firebaseAuth.getCurrentUser();
    if (!user) return false;

    if (this.db && user.providerId === 'google.com') {
      try {
        const docRef = doc(this.db, 'users', user.uid, 'profile', 'master');
        await setDoc(docRef, profile);
      } catch (err) {
        console.warn('[ApplyKit Firebase] Firestore profile save error:', err);
      }
    }

    await this.setLocalScoped(this.getScopedKey('profile'), profile);
    return true;
  }

  async pushAll(applications: JobApplication[], profile?: UserProfile): Promise<boolean> {
    for (const app of applications) {
      await this.saveApplication(app);
    }
    if (profile) {
      await this.saveProfile(profile);
    }
    return true;
  }
}

export const firebaseCloudProvider = new FirebaseCloudProvider();
