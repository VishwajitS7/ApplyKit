import { describe, it, expect } from 'vitest';
import { mapSignalsToFieldType, getProfileValueForField } from '../src/content/field-mapper';
import { FieldSignal } from '../src/types/detection';
import { UserProfile } from '../src/types/profile';
import { DEFAULT_USER_PROFILE } from '../src/storage/schema-validator';

describe('Field Mapper Engine', () => {
  const testMapping = (signals: Partial<FieldSignal>[]): ReturnType<typeof mapSignalsToFieldType> => {
    const fullSignals: FieldSignal[] = signals.map((s) => ({
      source: s.source || 'label',
      text: s.text || '',
      weight: s.weight || 3,
    }));
    return mapSignalsToFieldType(fullSignals);
  };

  it('maps LinkedIn variants with high confidence', () => {
    const variations = [
      'LinkedIn Profile URL',
      'Linkedin profile',
      'Professional LinkedIn',
      'LinkedIn',
      'linkedin_url',
    ];

    for (const text of variations) {
      const res = testMapping([{ text }]);
      expect(res.type).toBe('linkedin');
      expect(res.confidence).toBeGreaterThanOrEqual(0.70);
    }
  });

  it('maps GitHub variants with high confidence', () => {
    const variations = [
      'GitHub Profile',
      'GitHub URL',
      'git_hub_url',
      'GitHub Username',
      'github',
    ];

    for (const text of variations) {
      const res = testMapping([{ text }]);
      expect(res.type).toBe('github');
      expect(res.confidence).toBeGreaterThanOrEqual(0.70);
    }
  });

  it('maps LeetCode / competitive programming variants', () => {
    const variations = [
      'LeetCode Profile',
      'leetcode',
      'Coding Profile',
      'LeetCode URL',
    ];

    for (const text of variations) {
      const res = testMapping([{ text }]);
      expect(res.type).toBe('leetcode');
      expect(res.confidence).toBeGreaterThanOrEqual(0.70);
    }
  });

  it('maps Portfolio and Personal Website variants', () => {
    const variations = [
      'Personal website',
      'Portfolio Website',
      'Portfolio URL',
      'Personal site',
    ];

    for (const text of variations) {
      const res = testMapping([{ text }]);
      expect(res.type).toBe('portfolio');
      expect(res.confidence).toBeGreaterThanOrEqual(0.70);
    }
  });

  it('maps Email address variants with near-perfect confidence', () => {
    const variations = [
      'Email Address',
      'Email',
      'e-mail',
      'Contact Email',
    ];

    for (const text of variations) {
      const res = testMapping([{ text }]);
      expect(res.type).toBe('email');
      expect(res.confidence).toBeGreaterThanOrEqual(0.85);
    }
  });

  it('maps Phone and Mobile variants', () => {
    const variations = [
      'Phone Number',
      'Mobile',
      'Contact number',
      'Cell phone',
      'Telephone',
    ];

    for (const text of variations) {
      const res = testMapping([{ text }]);
      expect(res.type).toBe('phone');
      expect(res.confidence).toBeGreaterThanOrEqual(0.70);
    }
  });

  it('maps Education fields (College, Degree, Grad Year, CGPA)', () => {
    expect(testMapping([{ text: 'College / University' }]).type).toBe('college');
    expect(testMapping([{ text: 'Highest Degree' }]).type).toBe('degree');
    expect(testMapping([{ text: 'Year of Graduation' }]).type).toBe('graduationYear');
    expect(testMapping([{ text: 'CGPA / GPA' }]).type).toBe('cgpa');
  });

  it('maps Skills and Summary fields', () => {
    expect(testMapping([{ text: 'Key Skills & Technologies' }]).type).toBe('skills');
    expect(testMapping([{ text: 'Professional Summary' }]).type).toBe('summary');
    expect(testMapping([{ text: 'Brief Bio' }]).type).toBe('summary');
  });

  it('returns unknown for ambiguous or unclassifiable inputs', () => {
    const res = testMapping([{ text: 'random unrelated text 12345' }]);
    expect(res.type).toBe('unknown');
    expect(res.confidence).toBe(0);
  });

  it('extracts correct profile value for mapped field types', () => {
    const mockProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      personal: {
        fullName: 'Jane Developer',
        firstName: 'Jane',
        lastName: 'Developer',
        email: 'jane@example.com',
        phone: '+1 555-0199',
      },
      profiles: {
        linkedin: 'https://linkedin.com/in/janedev',
        github: 'https://github.com/janedev',
        leetcode: 'https://leetcode.com/janedev',
        portfolio: 'https://janedev.com',
      },
    };

    expect(getProfileValueForField('fullName', mockProfile)).toBe('Jane Developer');
    expect(getProfileValueForField('firstName', mockProfile)).toBe('Jane');
    expect(getProfileValueForField('email', mockProfile)).toBe('jane@example.com');
    expect(getProfileValueForField('linkedin', mockProfile)).toBe('https://linkedin.com/in/janedev');
    expect(getProfileValueForField('github', mockProfile)).toBe('https://github.com/janedev');
  });
});
