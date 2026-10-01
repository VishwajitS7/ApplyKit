import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { AuthUser, FirebaseConfig } from './sync-types';

const STORAGE_KEY_CONFIG = 'applykit_firebase_config_v1';
const STORAGE_KEY_USER = 'applykit_auth_user_v1';

class FirebaseAuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private currentUser: AuthUser | null = null;
  private listeners: Set<(user: AuthUser | null) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.loadCachedUser();
  }

  private async getStorageItem(key: string): Promise<string | null> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] || null);
        });
      });
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }

  private async setStorageItem(key: string, value: string | null): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        if (value === null) {
          chrome.storage.local.remove([key], () => resolve());
        } else {
          chrome.storage.local.set({ [key]: value }, () => resolve());
        }
      });
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    }
  }

  private async loadCachedUser(): Promise<void> {
    try {
      const cached = await this.getStorageItem(STORAGE_KEY_USER);
      if (cached) {
        this.currentUser = JSON.parse(cached);
        this.notifyListeners();
      }
    } catch (e) {
      console.warn('[ApplyKit Auth] Failed to load cached user:', e);
    }
  }

  async getStoredConfig(): Promise<FirebaseConfig | null> {
    // 1. Check local storage
    try {
      const raw = await this.getStorageItem(STORAGE_KEY_CONFIG);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[ApplyKit Auth] Error reading config from storage:', e);
    }

    // 2. Check import.meta.env
    const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
    const envDomain = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN;
    const envProject = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;

    if (envKey && envProject) {
      return {
        apiKey: envKey,
        authDomain: envDomain || `${envProject}.firebaseapp.com`,
        projectId: envProject,
        storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID,
      };
    }

    return null;
  }

  async saveStoredConfig(config: FirebaseConfig | null): Promise<void> {
    if (config) {
      await this.setStorageItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      await this.init(config);
    } else {
      await this.setStorageItem(STORAGE_KEY_CONFIG, null);
      this.app = null;
      this.auth = null;
      this.isInitialized = false;
    }
  }

  async init(overrideConfig?: FirebaseConfig): Promise<boolean> {
    const config = overrideConfig || (await this.getStoredConfig());
    if (!config || !config.apiKey || !config.projectId) {
      this.isInitialized = false;
      return false;
    }

    try {
      if (getApps().length === 0) {
        this.app = initializeApp(config);
      } else {
        this.app = getApp();
      }

      this.auth = getAuth(this.app);

      fbOnAuthStateChanged(this.auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          this.currentUser = {
            uid: fbUser.uid,
            displayName: fbUser.displayName,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            providerId: 'google.com',
          };
          this.setStorageItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
        } else if (this.currentUser?.providerId === 'google.com') {
          this.currentUser = null;
          this.setStorageItem(STORAGE_KEY_USER, null);
        }
        this.notifyListeners();
      });

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('[ApplyKit Auth] Firebase initialization notice:', err);
      this.isInitialized = false;
      return false;
    }
  }

  getFirebaseApp(): FirebaseApp | null {
    return this.app;
  }

  getFirebaseAuth(): Auth | null {
    return this.auth;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isConfigured(): boolean {
    return this.isInitialized && this.auth !== null;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const isReady = await this.init();

    if (!isReady || !this.auth) {
      throw new Error(
        'FIREBASE_NOT_CONFIGURED: Please provide your Firebase project API Key & Project ID in Cloud Settings to use live Google OAuth, or use Demo Sign-In.'
      );
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const cred = await signInWithPopup(this.auth, provider);
      const user = cred.user;
      const authUser: AuthUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        providerId: 'google.com',
      };
      this.currentUser = authUser;
      await this.setStorageItem(STORAGE_KEY_USER, JSON.stringify(authUser));
      this.notifyListeners();
      return authUser;
    } catch (error: any) {
      console.error('[ApplyKit Auth] Google sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Demo Google OAuth sign-in simulator.
   * Useful when users or reviewers want to evaluate the authenticated cloud experience
   * without creating a Google Cloud Console project immediately.
   */
  async signInWithDemoGoogle(customEmail?: string): Promise<AuthUser> {
    const email = customEmail || 'developer@applykit.io';
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const demoUser: AuthUser = {
      uid: `google-oauth-${Date.now().toString(36)}`,
      displayName: formattedName || 'Verified Candidate',
      email: email,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      providerId: 'demo',
    };

    this.currentUser = demoUser;
    await this.setStorageItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
    this.notifyListeners();
    return demoUser;
  }

  async signOut(): Promise<void> {
    if (this.auth && this.currentUser?.providerId === 'google.com') {
      try {
        await fbSignOut(this.auth);
      } catch (e) {
        console.warn('[ApplyKit Auth] Firebase signOut error:', e);
      }
    }
    this.currentUser = null;
    await this.setStorageItem(STORAGE_KEY_USER, null);
    this.notifyListeners();
  }
}

export const firebaseAuth = new FirebaseAuthService();
