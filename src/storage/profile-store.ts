import {
  UserProfile,
  ProfileExportData,
  CompletenessResult,
} from '../types/profile';
import {
  DEFAULT_USER_PROFILE,
  CURRENT_SCHEMA_VERSION,
  validateAndSanitizeProfile,
  validateExportData,
} from './schema-validator';

const STORAGE_KEY = 'applykit_user_profile_v1';

class ProfileStore {
  private subscribers: Array<(profile: UserProfile) => void> = [];
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('applykit_profile_sync_events');
        this.broadcastChannel.onmessage = async (event) => {
          if (event.data?.type === 'PROFILE_CHANGED') {
            const p = await this.get();
            this.notifySubscribers(p);
          }
        };
      } catch {
        // Fallback if BroadcastChannel is restricted
      }
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', async (event) => {
        if (event.key === STORAGE_KEY) {
          const p = await this.get();
          this.notifySubscribers(p);
        }
      });
    }

    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.onChanged
    ) {
      chrome.storage.onChanged.addListener(async (changes, area) => {
        if (area === 'local' && changes[STORAGE_KEY]) {
          const p = await this.get();
          this.notifySubscribers(p);
        }
      });
    }
  }

  subscribe(listener: (profile: UserProfile) => void): () => void {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter((l) => l !== listener);
    };
  }

  private notifySubscribers(profile: UserProfile) {
    for (const sub of this.subscribers) {
      try {
        sub(profile);
      } catch (err) {
        console.error('[ProfileStore] Error in subscriber callback:', err);
      }
    }
  }

  private broadcastChange(profile: UserProfile) {
    this.notifySubscribers(profile);
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'PROFILE_CHANGED', timestamp: Date.now() });
      } catch {
        // Channel closed
      }
    }
  }

  private hasChromeStorage(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      Boolean(chrome.storage) &&
      Boolean(chrome.storage.local)
    );
  }

  async get(): Promise<UserProfile> {
    try {
      if (this.hasChromeStorage()) {
        return new Promise((resolve) => {
          chrome.storage.local.get([STORAGE_KEY], (result) => {
            if (chrome.runtime.lastError) {
              console.warn('[ApplyKit Store] chrome.storage error:', chrome.runtime.lastError);
              resolve(this.getFromLocalStorage());
              return;
            }
            if (result && result[STORAGE_KEY]) {
              const { valid, profile } = validateAndSanitizeProfile(result[STORAGE_KEY]);
              resolve(valid && profile ? profile : DEFAULT_USER_PROFILE);
            } else {
              resolve(DEFAULT_USER_PROFILE);
            }
          });
        });
      } else {
        return this.getFromLocalStorage();
      }
    } catch (err) {
      console.warn('[ApplyKit Store] Failed to read profile, returning default:', err);
      return DEFAULT_USER_PROFILE;
    }
  }

  private getFromLocalStorage(): UserProfile {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_USER_PROFILE;
      }
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_USER_PROFILE;
      const parsed = JSON.parse(raw);
      const { valid, profile } = validateAndSanitizeProfile(parsed);
      return valid && profile ? profile : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  }

  async update(patch: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.get();
    const merged: UserProfile = {
      personal: { ...current.personal, ...(patch.personal || {}) },
      profiles: { ...current.profiles, ...(patch.profiles || {}) },
      education: { ...current.education, ...(patch.education || {}) },
      professional: {
        skills: patch.professional?.skills !== undefined ? patch.professional.skills : current.professional.skills,
        summary: patch.professional?.summary !== undefined ? patch.professional.summary : current.professional.summary,
      },
      documents: { ...current.documents, ...(patch.documents || {}) },
      settings: { ...current.settings, ...(patch.settings || {}) },
      snippets: patch.snippets !== undefined ? patch.snippets : current.snippets,
      personas: patch.personas !== undefined ? patch.personas : current.personas,
      activePersonaId:
        patch.activePersonaId !== undefined ? patch.activePersonaId : current.activePersonaId,
    };

    const { valid, profile } = validateAndSanitizeProfile(merged);
    const finalProfile = valid && profile ? profile : current;

    await this.persist(finalProfile);
    return finalProfile;
  }

  async setActivePersona(personaId: string): Promise<UserProfile> {
    const current = await this.get();
    const persona = (current.personas || []).find((p) => p.id === personaId);
    if (!persona) return current;

    return this.update({ activePersonaId: personaId });
  }

  async addPersona(
    newPersona: Partial<import('../types/profile').ProfilePersona> & { name: string }
  ): Promise<UserProfile> {
    const current = await this.get();
    const id = newPersona.id || `persona-${Date.now().toString(36)}`;
    const persona: import('../types/profile').ProfilePersona = {
      skills: [],
      summary: '',
      isDefault: false,
      ...newPersona,
      id,
      createdAt: newPersona.createdAt || new Date().toISOString(),
    };

    const personas = [...(current.personas || []), persona];
    return this.update({ personas, activePersonaId: id });
  }

  async updatePersona(
    personaId: string,
    patch: Partial<import('../types/profile').ProfilePersona>
  ): Promise<UserProfile> {
    const current = await this.get();
    const personas = (current.personas || []).map((p) =>
      p.id === personaId ? { ...p, ...patch } : p
    );
    return this.update({ personas });
  }

  async deletePersona(personaId: string): Promise<UserProfile> {
    const current = await this.get();
    const personas = (current.personas || []).filter((p) => p.id !== personaId);
    if (personas.length === 0) {
      return current; // Don't delete last persona
    }

    const nextActiveId =
      current.activePersonaId === personaId ? personas[0].id : current.activePersonaId;
    return this.update({ personas, activePersonaId: nextActiveId });
  }

  async updateSection<K extends keyof UserProfile>(
    section: K,
    data: Partial<UserProfile[K]>
  ): Promise<UserProfile> {
    const current = await this.get();
    const currentVal = current[section];
    const updatedSection =
      typeof currentVal === 'object' && currentVal !== null && !Array.isArray(currentVal)
        ? { ...(currentVal as Record<string, unknown>), ...(data as Record<string, unknown>) }
        : data;
    return this.update({ [section]: updatedSection } as Partial<UserProfile>);
  }

  async clear(): Promise<void> {
    const resetProfile = JSON.parse(JSON.stringify(DEFAULT_USER_PROFILE));
    await this.persist(resetProfile);
  }

  private async persist(profile: UserProfile): Promise<void> {
    if (this.hasChromeStorage()) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [STORAGE_KEY]: profile }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            // Also mirror to localStorage for quick fallback
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
              }
            } catch {
              // Ignore localStorage quota errors
            }
            this.broadcastChange(profile);
            resolve();
          }
        });
      });
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
      this.broadcastChange(profile);
    }
  }

  async export(): Promise<ProfileExportData> {
    const profile = await this.get();
    return {
      version: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      profile,
    };
  }

  async import(jsonString: string): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
    const validation = validateExportData(jsonString);
    if (!validation.valid || !validation.data) {
      return { success: false, error: validation.error || 'Failed to validate imported file' };
    }

    const newProfile = validation.data.profile;
    await this.persist(newProfile);
    return { success: true, profile: newProfile };
  }

  calculateCompleteness(profile: UserProfile): CompletenessResult {
    const checks = [
      { key: 'fullName', label: 'Full Name', val: profile.personal.fullName, priority: 1 },
      { key: 'email', label: 'Email Address', val: profile.personal.email, priority: 1 },
      { key: 'phone', label: 'Phone Number', val: profile.personal.phone, priority: 1 },
      { key: 'linkedin', label: 'LinkedIn Profile', val: profile.profiles.linkedin, priority: 2 },
      { key: 'github', label: 'GitHub Profile', val: profile.profiles.github, priority: 2 },
      { key: 'portfolio', label: 'Portfolio Website', val: profile.profiles.portfolio, priority: 3 },
      { key: 'leetcode', label: 'LeetCode Profile', val: profile.profiles.leetcode, priority: 4 },
      { key: 'college', label: 'College / University', val: profile.education.college, priority: 2 },
      { key: 'degree', label: 'Degree', val: profile.education.degree, priority: 3 },
      { key: 'branch', label: 'Branch / Major', val: profile.education.branch, priority: 3 },
      { key: 'graduationYear', label: 'Graduation Year', val: profile.education.graduationYear, priority: 3 },
      { key: 'cgpa', label: 'CGPA / GPA', val: profile.education.cgpa, priority: 4 },
      { key: 'skills', label: 'Skills', val: profile.professional.skills && profile.professional.skills.length > 0 ? 'yes' : '', priority: 2 },
      { key: 'summary', label: 'Professional Summary', val: profile.professional.summary, priority: 4 },
    ];

    const totalFields = checks.length;
    let completedFields = 0;
    const missing: Array<{ key: string; label: string; priority: number }> = [];

    for (const check of checks) {
      if (check.val && String(check.val).trim().length > 0) {
        completedFields++;
      } else {
        missing.push({ key: check.key, label: check.label, priority: check.priority });
      }
    }

    // Sort missing by priority (1 = urgent, 4 = nice to have)
    missing.sort((a, b) => a.priority - b.priority);

    const percentage = Math.round((completedFields / totalFields) * 100);

    let nextSuggestion = 'Profile complete! Ready for any job application.';
    if (missing.length > 0) {
      const topMissing = missing[0];
      nextSuggestion = `Add your ${topMissing.label}`;
    }

    return {
      percentage,
      totalFields,
      completedFields,
      missingFields: missing,
      nextSuggestion,
    };
  }
}

export const profileStore = new ProfileStore();
