/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { evaluateSafety } from '../src/content/safety-guard';

describe('Safety Guard Verification', () => {
  it('strictly blocks button and submit controls', () => {
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Submit Application';

    const check = evaluateSafety(btn, 'Submit Application');
    expect(check.safe).toBe(false);
    expect(check.reason).toBe('submit_action');
  });

  it('blocks submit inputs', () => {
    const input = document.createElement('input');
    input.type = 'submit';
    input.value = 'Apply Now';

    const check = evaluateSafety(input, 'Apply Now');
    expect(check.safe).toBe(false);
    expect(check.reason).toBe('submit_action');
  });

  it('blocks password and sensitive credential inputs', () => {
    const pwd = document.createElement('input');
    pwd.type = 'password';

    const check = evaluateSafety(pwd, 'Enter your password');
    expect(check.safe).toBe(false);
    expect(check.reason).toBe('sensitive_credential');
  });

  it('blocks legal declarations and consent checkboxes', () => {
    const chk = document.createElement('input');
    chk.type = 'checkbox';

    const legalTexts = [
      'I agree to the terms and conditions',
      'I certify that information is truthful under penalty of perjury',
      'Consent to background check',
      'Electronic signature agreement',
    ];

    for (const text of legalTexts) {
      const check = evaluateSafety(chk, text);
      expect(check.safe).toBe(false);
      expect(check.reason).toBe('legal_declaration');
    }
  });

  it('blocks diversity and demographic fields', () => {
    const select = document.createElement('select');

    const demoTexts = [
      'Equal Opportunity Gender Identity',
      'Race and Ethnicity Survey',
      'Veteran / Military Status',
      'Voluntary Disability Disclosure',
    ];

    for (const text of demoTexts) {
      const check = evaluateSafety(select, text);
      expect(check.safe).toBe(false);
      expect(check.reason).toBe('demographic');
    }
  });

  it('blocks work authorization and visa sponsorship questions', () => {
    const select = document.createElement('select');

    const visaTexts = [
      'Are you legally authorized to work in the United States?',
      'Will you now or in the future require visa sponsorship for employment?',
      'H1B / OPT work permit status',
    ];

    for (const text of visaTexts) {
      const check = evaluateSafety(select, text);
      expect(check.safe).toBe(false);
      expect(check.reason).toBe('work_authorization');
    }
  });

  it('blocks salary and compensation expectations', () => {
    const input = document.createElement('input');
    input.type = 'text';

    const salaryTexts = [
      'Desired Annual Salary',
      'Expected Compensation (USD)',
      'Hourly rate expectations',
      'Target salary',
    ];

    for (const text of salaryTexts) {
      const check = evaluateSafety(input, text);
      expect(check.safe).toBe(false);
      expect(check.reason).toBe('salary_expectation');
    }
  });

  it('allows benign candidate profile fields', () => {
    const input = document.createElement('input');
    input.type = 'text';

    const safeFields = [
      'Full Name',
      'LinkedIn Profile URL',
      'GitHub Profile',
      'Email Address',
      'Phone Number',
      'College / University',
      'Graduation Year',
      'Key Skills',
    ];

    for (const text of safeFields) {
      const check = evaluateSafety(input, text);
      expect(check.safe).toBe(true);
    }
  });
});
