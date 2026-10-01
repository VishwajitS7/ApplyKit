/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { profileStore } from '../src/storage/profile-store';
import { getEffectiveProfile, UserProfile } from '../src/types/profile';
import { validateAndSanitizeProfile, DEFAULT_USER_PROFILE } from '../src/storage/schema-validator';

describe('Multi-Persona Profiles', () => {
  beforeEach(async () => {
    localStorage.clear();
    await profileStore.clear();
  });

  it('initializes profile with default personas', async () => {
    const profile = await profileStore.get();
    expect(profile.personas).toBeDefined();
    expect(profile.personas?.length).toBeGreaterThanOrEqual(3);

    const fullStack = profile.personas?.find((p) => p.id === 'fullstack');
    expect(fullStack).toBeDefined();
    expect(fullStack?.name).toBe('Full-Stack Engineer');
    expect(profile.activePersonaId).toBe('fullstack');
  });

  it('switches active persona via profileStore', async () => {
    await profileStore.setActivePersona('frontend');
    const profile = await profileStore.get();
    expect(profile.activePersonaId).toBe('frontend');
  });

  it('adds, updates, and deletes a custom persona', async () => {
    // Add custom persona
    const newPersona = {
      id: 'ai-ml-specialist',
      name: 'AI/ML Specialist',
      title: 'Machine Learning Engineer',
      skills: ['PyTorch', 'Transformers', 'Python', 'CUDA'],
      summary: 'Passionate about LLMs and distributed training.',
      portfolioUrl: 'https://ai.example.com',
      githubUrl: 'https://github.com/alex-ml',
      linkedinUrl: 'https://linkedin.com/in/alex-ai',
      isDefault: false,
    };

    await profileStore.addPersona(newPersona);
    let profile = await profileStore.get();
    expect(profile.personas?.some((p) => p.id === 'ai-ml-specialist')).toBe(true);

    // Update custom persona
    await profileStore.updatePersona('ai-ml-specialist', {
      skills: ['PyTorch', 'Transformers', 'Python', 'CUDA', 'vLLM'],
    });

    profile = await profileStore.get();
    const updated = profile.personas?.find((p) => p.id === 'ai-ml-specialist');
    expect(updated?.skills).toContain('vLLM');

    // Switch to custom persona
    await profileStore.setActivePersona('ai-ml-specialist');
    profile = await profileStore.get();
    expect(profile.activePersonaId).toBe('ai-ml-specialist');

    // Delete custom persona (should switch to first available if active)
    await profileStore.deletePersona('ai-ml-specialist');
    profile = await profileStore.get();
    expect(profile.personas?.some((p) => p.id === 'ai-ml-specialist')).toBe(false);
    expect(profile.activePersonaId).not.toBe('ai-ml-specialist');
  });

  it('getEffectiveProfile projects active persona skills and links onto profile', () => {
    const baseProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      personal: {
        ...DEFAULT_USER_PROFILE.personal,
        fullName: 'Alex Morgan',
        email: 'alex@example.com',
      },
      professional: {
        skills: ['General Tech', 'HTML'],
        summary: 'General developer summary',
      },
      profiles: {
        linkedin: 'https://linkedin.com/in/alex-base',
        github: 'https://github.com/alex-base',
        leetcode: 'https://leetcode.com/alex',
        portfolio: 'https://alex-base.com',
        other: [],
      },
      personas: [
        {
          id: 'frontend',
          name: 'Frontend Specialist',
          title: 'Senior Frontend Engineer',
          skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js'],
          summary: 'Tailored frontend specialist bio with focus on UX.',
          portfolioUrl: 'https://alex-frontend.dev',
          githubUrl: 'https://github.com/alex-fe',
          linkedinUrl: '',
        },
      ],
      activePersonaId: 'frontend',
    };

    const effective = getEffectiveProfile(baseProfile);

    // Personal details remain unchanged
    expect(effective.personal.fullName).toBe('Alex Morgan');
    expect(effective.personal.email).toBe('alex@example.com');

    // Skills and summary are projected from persona
    expect(effective.professional.skills).toEqual(['React', 'TypeScript', 'TailwindCSS', 'Next.js']);
    expect(effective.professional.summary).toBe('Tailored frontend specialist bio with focus on UX.');

    // Overridden URLs are projected
    expect(effective.profiles.portfolio).toBe('https://alex-frontend.dev');
    expect(effective.profiles.github).toBe('https://github.com/alex-fe');

    // Empty persona field falls back to base profile
    expect(effective.profiles.linkedin).toBe('https://linkedin.com/in/alex-base');
    expect(effective.profiles.leetcode).toBe('https://leetcode.com/alex');
  });

  it('getEffectiveProfile falls back to base profile when no active persona', () => {
    const baseProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      professional: {
        skills: ['Base Skills'],
        summary: 'Base summary',
      },
      personas: [],
      activePersonaId: undefined,
    };

    const effective = getEffectiveProfile(baseProfile);
    expect(effective.professional.skills).toEqual(['Base Skills']);
    expect(effective.professional.summary).toBe('Base summary');
  });

  it('validateAndSanitizeProfile preserves valid personas and adds defaults if missing', () => {
    const raw = {
      personal: { fullName: 'Sam' },
    };

    const sanitized = validateAndSanitizeProfile(raw);
    expect(sanitized.valid).toBe(true);
    expect(sanitized.profile?.personas).toBeDefined();
    expect(sanitized.profile!.personas!.length).toBeGreaterThan(0);
    expect(sanitized.profile!.activePersonaId).toBeDefined();
  });

  it('routes properly to personas tab when URL hash or search parameter is present', () => {
    // Test hash routing
    window.location.hash = '#personas';
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    expect(hash).toBe('personas');

    window.location.hash = '#work-personas';
    const workPersonasHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    expect(['personas', 'work-personas']).toContain(workPersonasHash);

    // Test search parameter routing
    const search = new URLSearchParams('?tab=personas');
    expect(search.get('tab')).toBe('personas');
  });
});
