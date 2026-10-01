import { describe, it, expect } from 'vitest';
import { analyzeResumeMatch } from '../src/analyzer/resume-matcher';
import { extractJobRequirements } from '../src/analyzer/keyword-extractor';
import { DEFAULT_USER_PROFILE } from '../src/storage/schema-validator';
import { UserProfile } from '../src/types/profile';

describe('Resume Matcher & ATS Suggestion Engine', () => {
  const sampleJdText = `
    Role: Frontend Specialist
    Requirements:
    - Proficiency in TypeScript, React, and Tailwind CSS.
    - Deep knowledge of Next.js and GraphQL.
    - Experience with Jest or Vitest for testing.
    - Nice to have: Docker.
  `;

  const jobReqs = extractJobRequirements(sampleJdText);

  it('calculates high match when user has matching skills', () => {
    const candidateProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      professional: {
        skills: ['TypeScript', 'React', 'Tailwind CSS', 'Next.js', 'GraphQL', 'Jest'],
        summary: 'Frontend developer passionate about React, TypeScript and responsive interfaces.',
      },
    };

    const report = analyzeResumeMatch(candidateProfile, jobReqs);
    expect(report.matchPercentage).toBeGreaterThanOrEqual(70);
    expect(report.matchedSkills.map((s) => s.canonical)).toContain('TypeScript');
    expect(report.matchedSkills.map((s) => s.canonical)).toContain('React');
    expect(report.matchedSkills.map((s) => s.canonical)).toContain('Next.js');
  });

  it('identifies missing skills and provides actionable resume advice', () => {
    const candidateProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      professional: {
        skills: ['JavaScript', 'HTML5', 'CSS3'], // Missing TypeScript, React, Next.js, GraphQL
        summary: 'Web designer building static websites.',
      },
    };

    const report = analyzeResumeMatch(candidateProfile, jobReqs);
    expect(report.matchPercentage).toBeLessThan(50);
    const missingNames = report.missingSkills.map((s) => s.canonical);

    expect(missingNames).toContain('TypeScript');
    expect(missingNames).toContain('React');
    expect(missingNames).toContain('Next.js');

    // Suggestions should recommend adding missing required skills
    const adviceText = report.suggestions.join(' ');
    expect(adviceText).toMatch(/High priority|Add/i);
  });
});
