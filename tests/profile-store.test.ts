/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { profileStore } from '../src/storage/profile-store';
import { validateExportData, DEFAULT_USER_PROFILE } from '../src/storage/schema-validator';

describe('Profile Store & Schema Validator', () => {
  beforeEach(async () => {
    localStorage.clear();
    await profileStore.clear();
  });

  it('initializes with clean default profile', async () => {
    const profile = await profileStore.get();
    expect(profile.personal.fullName).toBe('');
    expect(profile.settings.hasCompletedOnboarding).toBe(false);
    expect(profile.settings.theme).toBe('system');
  });

  it('updates personal section and persists', async () => {
    await profileStore.updateSection('personal', {
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+1 555 4321',
    });

    const profile = await profileStore.get();
    expect(profile.personal.fullName).toBe('Alex Morgan');
    expect(profile.personal.email).toBe('alex.morgan@example.com');
  });

  it('calculates profile completeness with actionable suggestion', async () => {
    let completeness = profileStore.calculateCompleteness(DEFAULT_USER_PROFILE);
    expect(completeness.percentage).toBe(0);
    expect(completeness.nextSuggestion).toContain('Full Name');

    await profileStore.update({
      personal: {
        fullName: 'Alex Morgan',
        email: 'alex@example.com',
        phone: '1234567890',
      },
    });

    const updated = await profileStore.get();
    completeness = profileStore.calculateCompleteness(updated);
    expect(completeness.percentage).toBeGreaterThan(15);
    // Next suggestion should ask for LinkedIn or College
    expect(completeness.missingFields.length).toBeGreaterThan(0);
  });

  it('exports profile with valid version 1 schema', async () => {
    await profileStore.updateSection('profiles', {
      linkedin: 'https://linkedin.com/in/alex',
      github: 'https://github.com/alex',
    });

    const exportData = await profileStore.export();
    expect(exportData.version).toBe(1);
    expect(exportData.profile.profiles.linkedin).toBe('https://linkedin.com/in/alex');
    expect(exportData.exportedAt).toBeDefined();
  });

  it('validates and rejects invalid import JSON', () => {
    // Non-JSON
    expect(validateExportData('invalid string').valid).toBe(false);

    // Missing version
    expect(validateExportData(JSON.stringify({ profile: {} })).valid).toBe(false);

    // Future unsupported version
    expect(validateExportData(JSON.stringify({ version: 999, profile: {} })).valid).toBe(false);

    // Valid backup
    const validJson = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: {
        ...DEFAULT_USER_PROFILE,
        personal: {
          ...DEFAULT_USER_PROFILE.personal,
          fullName: 'Imported User',
        },
      },
    });
    const result = validateExportData(validJson);
    expect(result.valid).toBe(true);
    expect(result.data?.profile.personal.fullName).toBe('Imported User');
  });

  it('imports valid JSON and updates store', async () => {
    const importPayload = JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: {
        ...DEFAULT_USER_PROFILE,
        personal: {
          ...DEFAULT_USER_PROFILE.personal,
          fullName: 'Restored Candidate',
          email: 'restored@example.com',
        },
      },
    });

    const res = await profileStore.import(importPayload);
    expect(res.success).toBe(true);

    const active = await profileStore.get();
    expect(active.personal.fullName).toBe('Restored Candidate');
    expect(active.personal.email).toBe('restored@example.com');
  });

  it('persists and sanitizes answer snippets in user profile', async () => {
    const profile = await profileStore.get();
    expect(profile.snippets).toBeDefined();
    expect(profile.snippets!.length).toBeGreaterThanOrEqual(5);

    // Update with a custom snippet
    const customSnippet = {
      id: 'custom-snip-1',
      title: 'Custom Relocation Note',
      category: 'logistics' as const,
      content: 'Willing to relocate to SF or NYC immediately.',
      tags: ['relocation', 'travel'],
    };

    await profileStore.update({
      snippets: [...profile.snippets!, customSnippet],
    });

    const updated = await profileStore.get();
    const found = updated.snippets?.find((s) => s.id === 'custom-snip-1');
    expect(found).toBeDefined();
    expect(found?.title).toBe('Custom Relocation Note');
    expect(found?.content).toBe('Willing to relocate to SF or NYC immediately.');
  });
});
