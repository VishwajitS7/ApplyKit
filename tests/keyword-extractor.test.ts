import { describe, it, expect } from 'vitest';
import { extractJobRequirements } from '../src/analyzer/keyword-extractor';

describe('Job Description Keyword Extractor', () => {
  const sampleJd = `
    Job Title: Senior Backend Engineer
    Location: New York, NY

    About the Role:
    We are looking for a Senior Backend Engineer to join our core platform team.

    Key Requirements:
    - 5+ years of experience with Python and Django.
    - Strong database skills with PostgreSQL and Redis caching.
    - Hands-on experience with Docker and Kubernetes for container orchestration.
    - Experience building RESTful APIs and microservices.

    Nice to Have:
    - Experience with AWS (ECS, Lambda, S3).
    - Familiarity with GraphQL.
    - Knowledge of Go or Rust.
  `;

  it('infers job title and seniority level accurately', () => {
    const res = extractJobRequirements(sampleJd);
    expect(res.jobTitle).toContain('Senior Backend Engineer');
    expect(res.seniority).toBe('Senior');
  });

  it('extracts technical skills from requirements and preferred sections', () => {
    const res = extractJobRequirements(sampleJd);
    const skillNames = res.extractedSkills.map((s) => s.canonical);

    expect(skillNames).toContain('Python');
    expect(skillNames).toContain('Django');
    expect(skillNames).toContain('PostgreSQL');
    expect(skillNames).toContain('Redis');
    expect(skillNames).toContain('Docker');
    expect(skillNames).toContain('Kubernetes');
    expect(skillNames).toContain('RESTful APIs');
    expect(skillNames).toContain('AWS');
    expect(skillNames).toContain('GraphQL');
  });

  it('marks skills in requirements section as isRequired with higher weight', () => {
    const res = extractJobRequirements(sampleJd);
    const pythonSkill = res.extractedSkills.find((s) => s.canonical === 'Python');
    const graphqlSkill = res.extractedSkills.find((s) => s.canonical === 'GraphQL');

    expect(pythonSkill).toBeDefined();
    expect(pythonSkill?.isRequired).toBe(true);
    expect(pythonSkill?.score).toBeGreaterThan(graphqlSkill?.score || 0);
  });

  it('handles empty or brief text gracefully', () => {
    const res = extractJobRequirements('');
    expect(res.jobTitle).toBe('Software Engineer');
    expect(res.extractedSkills).toEqual([]);
    expect(res.totalSkillsFound).toBe(0);
  });
});
