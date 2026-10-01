import { describe, it, expect } from 'vitest';
import { generateTailoredProfile } from '../src/analyzer/tailor-engine';
import { extractJobRequirements } from '../src/analyzer/keyword-extractor';
import { analyzeResumeMatch } from '../src/analyzer/resume-matcher';
import { DEFAULT_USER_PROFILE } from '../src/storage/schema-validator';
import { UserProfile } from '../src/types/profile';

describe('Profile Tailor Engine', () => {
  const sampleJdText = `
    Job Title: Senior Cloud Architect
    Key Requirements:
    - AWS and Terraform expertise.
    - Docker containerization.
    - Python scripting.
  `;

  const jobReqs = extractJobRequirements(sampleJdText);

  const candidateProfile: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    professional: {
      // User has skills in different order: HTML, CSS, Python, JavaScript, Docker, AWS
      skills: ['HTML5', 'CSS3', 'JavaScript', 'Python', 'Docker', 'AWS'],
      summary: 'Software engineer building web apps.',
    },
  };

  it('reorders candidate skills so matching skills appear first in tech stack', () => {
    const matchReport = analyzeResumeMatch(candidateProfile, jobReqs);
    const tailored = generateTailoredProfile(candidateProfile, jobReqs, matchReport);

    const firstThreeSkills = tailored.prioritizedSkills.slice(0, 3);
    // AWS, Docker, Python should be moved to the beginning of prioritizedSkills
    expect(firstThreeSkills).toContain('AWS');
    expect(firstThreeSkills).toContain('Docker');
    expect(firstThreeSkills).toContain('Python');

    // Remaining skills (HTML5, CSS3, JavaScript) should be placed after
    expect(tailored.prioritizedSkills.length).toBe(candidateProfile.professional.skills!.length);
  });

  it('generates role-aligned professional summaries across impact, specialist, and adaptable tones', () => {
    const matchReport = analyzeResumeMatch(candidateProfile, jobReqs);
    const tailored = generateTailoredProfile(candidateProfile, jobReqs, matchReport);

    expect(tailored.tailoredSummaries.impact).toContain('Senior Cloud Architect');
    expect(tailored.tailoredSummaries.specialist).toContain('Senior Cloud Architect');
    expect(tailored.tailoredSummaries.adaptable).toContain('Senior Cloud Architect');

    // Summaries should include the matched tech stack
    expect(tailored.tailoredSummaries.impact).toMatch(/AWS|Docker|Python/i);
    expect(tailored.tailoredSummaries.specialist).toMatch(/AWS|Docker|Python/i);
  });

  it('generates structured 3-paragraph standard and modern short cover letters', () => {
    const matchReport = analyzeResumeMatch(candidateProfile, jobReqs);
    const tailored = generateTailoredProfile(candidateProfile, jobReqs, matchReport);

    expect(tailored.coverLetters).toBeDefined();
    expect(tailored.coverLetters.standard).toContain('Senior Cloud Architect');
    expect(tailored.coverLetters.standard).toMatch(/AWS|Docker|Python/i);
    expect(tailored.coverLetters.standard).toContain('Sincerely,');

    expect(tailored.coverLetters.short).toContain('Senior Cloud Architect');
    expect(tailored.coverLetters.short).toContain('Best regards,');
  });

  it('generates cold outreach messages including recruiter InMail, email subject/body, and elevator pitch', () => {
    const matchReport = analyzeResumeMatch(candidateProfile, jobReqs);
    const tailored = generateTailoredProfile(candidateProfile, jobReqs, matchReport);

    expect(tailored.coldOutreach).toBeDefined();
    // LinkedIn InMail
    expect(tailored.coldOutreach.recruiterInMail).toContain('Senior Cloud Architect');
    expect(tailored.coldOutreach.recruiterInMail).toMatch(/AWS|Docker|Python/i);

    // Hiring manager cold email
    expect(tailored.coldOutreach.hiringManagerEmail.subject).toContain('Senior Cloud Architect');
    expect(tailored.coldOutreach.hiringManagerEmail.body).toContain('Senior Cloud Architect');
    expect(tailored.coldOutreach.hiringManagerEmail.body).toContain('Best regards,');

    // Elevator pitch
    expect(tailored.coldOutreach.elevatorPitch).toContain('Senior Cloud Architect');
  });
});
