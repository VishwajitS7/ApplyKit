/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalCloudGateway, INITIAL_DEMO_APPLICATIONS } from '../src/cloud/local-cloud-gateway';
import { SyncManager } from '../src/cloud/sync-manager';
import { JobApplication, CloudSyncPayload } from '../src/cloud/sync-types';
import { UserProfile } from '../src/types/profile';

describe('Cloud Sync & Storage Layer', () => {
  let gateway: LocalCloudGateway;
  let manager: SyncManager;

  beforeEach(() => {
    // Clear localStorage mock
    window.localStorage.clear();
    gateway = new LocalCloudGateway();
    manager = new SyncManager();
  });

  it('should initialize with demo applications if local storage is empty', async () => {
    await gateway.init({ provider: 'local_gateway', autoSync: true });
    const apps = await gateway.fetchApplications();

    expect(apps.length).toBe(INITIAL_DEMO_APPLICATIONS.length);
    expect(apps[0].company).toBe('Acme Corporation');
  });

  it('should save a new application and retrieve it', async () => {
    await gateway.init({ provider: 'local_gateway', autoSync: true });
    
    const newApp: JobApplication = {
      id: 'app-test-99',
      company: 'Datadog',
      role: 'Full-Stack Software Engineer',
      url: 'https://datadoghq.com/careers/99',
      status: 'applied',
      appliedDate: '2026-09-16T12:00:00.000Z',
      matchedSkills: ['TypeScript', 'React', 'Go'],
      createdAt: '2026-09-16T12:00:00.000Z',
      updatedAt: '2026-09-16T12:00:00.000Z',
    };

    const saved = await gateway.saveApplication(newApp);
    expect(saved.id).toBe('app-test-99');

    const all = await gateway.fetchApplications();
    const found = all.find((a) => a.id === 'app-test-99');
    expect(found).toBeDefined();
    expect(found?.company).toBe('Datadog');
  });

  it('should update application status using SyncManager', async () => {
    manager.setProvider(gateway, { provider: 'local_gateway', autoSync: true });
    await manager.init();

    const apps = await manager.getApplications();
    const firstId = apps[0].id;

    const updated = await manager.updateStatus(firstId, 'offer');
    expect(updated?.status).toBe('offer');

    const reloaded = await manager.getApplications();
    const found = reloaded.find((a) => a.id === firstId);
    expect(found?.status).toBe('offer');
  });

  it('should add an interview round and transition status if applied', async () => {
    manager.setProvider(gateway, { provider: 'local_gateway', autoSync: true });
    await manager.init();

    // Create an applied application
    const app: JobApplication = {
      id: 'app-applied-1',
      company: 'Figma',
      role: 'Frontend Engineer',
      url: 'https://figma.com/careers/1',
      status: 'applied',
      appliedDate: '2026-09-16T10:00:00.000Z',
      createdAt: '2026-09-16T10:00:00.000Z',
      updatedAt: '2026-09-16T10:00:00.000Z',
    };
    await manager.saveApplication(app);

    const updated = await manager.addInterviewRound('app-applied-1', {
      title: 'Technical Coding Round',
      date: '2026-09-20T15:00:00.000Z',
      notes: 'Focus on Canvas API and performance',
    });

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('interviewing');
    expect(updated?.interviewRounds?.length).toBe(1);
    expect(updated?.interviewRounds?.[0].title).toBe('Technical Coding Round');
  });

  it('should delete an application cleanly', async () => {
    manager.setProvider(gateway, { provider: 'local_gateway', autoSync: true });
    await manager.init();

    const initial = await manager.getApplications();
    const idToDelete = initial[0].id;

    const success = await manager.deleteApplication(idToDelete);
    expect(success).toBe(true);

    const remaining = await manager.getApplications();
    expect(remaining.find((a) => a.id === idToDelete)).toBeUndefined();
    expect(remaining.length).toBe(initial.length - 1);
  });

  it('should export and import cloud backup JSON correctly', async () => {
    manager.setProvider(gateway, { provider: 'local_gateway', autoSync: true });
    await manager.init();

    const backup = await manager.exportCloudData();
    expect(backup.version).toBe(1);
    expect(Array.isArray(backup.applications)).toBe(true);
    expect(backup.applications.length).toBeGreaterThan(0);

    // Import payload with fresh custom app
    const customPayload: CloudSyncPayload = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      applications: [
        {
          id: 'app-imported-1',
          company: 'OpenAI',
          role: 'Research Engineer',
          url: 'https://openai.com/careers',
          status: 'applied',
          appliedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const importRes = await manager.importCloudData(JSON.stringify(customPayload));
    expect(importRes.success).toBe(true);
    expect(importRes.count).toBe(1);

    const afterImport = await manager.getApplications();
    expect(afterImport.length).toBe(1);
    expect(afterImport[0].company).toBe('OpenAI');
  });

  it('should save and retrieve profile from cloud storage', async () => {
    manager.setProvider(gateway, { provider: 'local_gateway', autoSync: true });
    await manager.init();

    const mockProfile: Partial<UserProfile> = {
      personal: {
        fullName: 'Jane Developer',
        firstName: 'Jane',
        lastName: 'Developer',
        email: 'jane@example.com',
        phone: '1234567890',
        location: 'New York, NY',
      },
    };

    await manager.saveProfile(mockProfile as UserProfile);
    const retrieved = await manager.getProfile();
    expect(retrieved?.personal.fullName).toBe('Jane Developer');
  });

  it('should authenticate with Demo Google OAuth and switch to cloud provider', async () => {
    let authUser: any = null;
    const unsub = manager.onAuthStateChanged((user) => {
      authUser = user;
    });

    expect(manager.isCloudAuthenticated()).toBe(false);

    const signedIn = await manager.signInWithDemoGoogle('candidate@example.com');
    expect(signedIn.email).toBe('candidate@example.com');
    expect(signedIn.providerId).toBe('demo');
    expect(manager.isCloudAuthenticated()).toBe(true);
    expect(authUser?.email).toBe('candidate@example.com');

    // Sign out
    await manager.signOut();
    expect(manager.isCloudAuthenticated()).toBe(false);
    expect(authUser).toBeNull();

    unsub();
  });

  it('should store and retrieve custom Firebase configuration', async () => {
    await manager.saveFirebaseConfig({
      apiKey: 'test-api-key-12345',
      authDomain: 'test-app.firebaseapp.com',
      projectId: 'test-project',
    });

    const config = await manager.getFirebaseConfig();
    expect(config?.apiKey).toBe('test-api-key-12345');
    expect(config?.projectId).toBe('test-project');

    // Clean up
    await manager.saveFirebaseConfig(null);
    const cleared = await manager.getFirebaseConfig();
    expect(cleared).toBeNull();
  });
});
