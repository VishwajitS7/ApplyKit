import { describe, it, expect } from 'vitest';
import { SyncManager } from '../src/cloud/sync-manager';
import { JobApplication } from '../src/cloud/sync-types';

describe('Application Tracker Metrics & Analytics', () => {
  const manager = new SyncManager();

  it('should calculate zero metrics for an empty application list', () => {
    const metrics = manager.calculateMetrics([]);
    expect(metrics.totalApplications).toBe(0);
    expect(metrics.appliedCount).toBe(0);
    expect(metrics.interviewingCount).toBe(0);
    expect(metrics.offerCount).toBe(0);
    expect(metrics.rejectedCount).toBe(0);
    expect(metrics.wishlistCount).toBe(0);
    expect(metrics.responseRatePercent).toBe(0);
    expect(metrics.topSkillsInDemand).toEqual([]);
  });

  it('should compute exact pipeline counts and response rate percentage', () => {
    const testApps: JobApplication[] = [
      {
        id: '1',
        company: 'CompA',
        role: 'Dev',
        url: 'https://compa.com/jobs/1',
        status: 'applied',
        appliedDate: '2026-09-01',
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
      {
        id: '2',
        company: 'CompB',
        role: 'Dev',
        url: 'https://compb.com/jobs/2',
        status: 'applied',
        appliedDate: '2026-09-02',
        createdAt: '2026-09-02',
        updatedAt: '2026-09-02',
      },
      {
        id: '3',
        company: 'CompC',
        role: 'Dev',
        url: 'https://compc.com/jobs/3',
        status: 'interviewing',
        appliedDate: '2026-09-03',
        createdAt: '2026-09-03',
        updatedAt: '2026-09-03',
      },
      {
        id: '4',
        company: 'CompD',
        role: 'Dev',
        url: 'https://compd.com/jobs/4',
        status: 'interviewing',
        appliedDate: '2026-09-04',
        createdAt: '2026-09-04',
        updatedAt: '2026-09-04',
      },
      {
        id: '5',
        company: 'CompE',
        role: 'Dev',
        url: 'https://compe.com/jobs/5',
        status: 'offer',
        appliedDate: '2026-09-05',
        createdAt: '2026-09-05',
        updatedAt: '2026-09-05',
      },
      {
        id: '6',
        company: 'CompF',
        role: 'Dev',
        url: 'https://compf.com/jobs/6',
        status: 'rejected',
        appliedDate: '2026-09-06',
        createdAt: '2026-09-06',
        updatedAt: '2026-09-06',
      },
      {
        id: '7',
        company: 'CompG',
        role: 'Dev',
        url: 'https://compg.com/jobs/7',
        status: 'wishlist',
        appliedDate: '2026-09-07',
        createdAt: '2026-09-07',
        updatedAt: '2026-09-07',
      },
    ];

    const metrics = manager.calculateMetrics(testApps);

    expect(metrics.totalApplications).toBe(7);
    expect(metrics.appliedCount).toBe(2);
    expect(metrics.interviewingCount).toBe(2);
    expect(metrics.offerCount).toBe(1);
    expect(metrics.rejectedCount).toBe(1);
    expect(metrics.wishlistCount).toBe(1);

    // Active decisions = applied (2) + interviewing (2) + offer (1) + rejected (1) = 6
    // Positive responses = interviewing (2) + offer (1) = 3
    // Rate = 3 / 6 = 50%
    expect(metrics.responseRatePercent).toBe(50);
  });

  it('should aggregate and rank top in-demand skills accurately', () => {
    const appsWithSkills: JobApplication[] = [
      {
        id: '1',
        company: 'Alpha',
        role: 'Role',
        url: 'https://alpha.com/jobs/1',
        status: 'applied',
        appliedDate: '2026-09-01',
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
      {
        id: '2',
        company: 'Beta',
        role: 'Role',
        url: 'https://beta.com/jobs/2',
        status: 'applied',
        appliedDate: '2026-09-01',
        matchedSkills: ['React', 'TypeScript', 'Docker'],
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
      {
        id: '3',
        company: 'Gamma',
        role: 'Role',
        url: 'https://gamma.com/jobs/3',
        status: 'applied',
        appliedDate: '2026-09-01',
        matchedSkills: ['React', 'Python', 'AWS'],
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
    ];

    const metrics = manager.calculateMetrics(appsWithSkills);
    expect(metrics.topSkillsInDemand.length).toBeGreaterThan(0);

    // React is in all 3
    expect(metrics.topSkillsInDemand[0].skill).toBe('React');
    expect(metrics.topSkillsInDemand[0].count).toBe(3);

    // TypeScript is in 2
    expect(metrics.topSkillsInDemand[1].skill).toBe('TypeScript');
    expect(metrics.topSkillsInDemand[1].count).toBe(2);
  });
});
