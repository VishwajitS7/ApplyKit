/**
 * ApplyKit Safety Guard
 *
 * CRITICAL SAFETY RULES:
 * ApplyKit must NEVER:
 * - Submit forms automatically
 * - Click "Submit Application", "Apply", or similar buttons
 * - Autofill legal declarations, consent agreements, or terms of service
 * - Autofill demographic questions (gender, race, ethnicity, veteran, disability)
 * - Autofill work authorization / visa sponsorship questions
 * - Autofill salary expectations or compensation questions
 * - Touch password, credit card, or payment fields
 */

// Patterns indicating elements that MUST NOT be touched
const EXCLUDED_PATTERNS = {
  // Submit / action buttons or inputs
  submit: [
    /submit/i,
    /apply/i,
    /send application/i,
    /complete application/i,
    /finish/i,
    /review and submit/i,
  ],

  // Legal / consent / terms
  legal: [
    /agree/i,
    /consent/i,
    /declaration/i,
    /terms/i,
    /condition/i,
    /policy/i,
    /privacy/i,
    /certify/i,
    /acknowledge/i,
    /signature/i,
    /electronic signature/i,
    /under penalty/i,
    /truthful/i,
    /accurate/i,
  ],

  // Demographics / EEO / Diversity
  demographic: [
    /gender/i,
    /sex\b/i,
    /pronoun/i,
    /race/i,
    /ethnicity/i,
    /hispanic/i,
    /latino/i,
    /veteran/i,
    /military/i,
    /disability/i,
    /handicap/i,
    /orientation/i,
    /marital/i,
    /equal opportunity/i,
    /eeo/i,
  ],

  // Work Authorization / Visa sponsorship
  workAuth: [
    /authorized to work/i,
    /work authorization/i,
    /require sponsorship/i,
    /visa/i,
    /sponsorship/i,
    /h1b/i,
    /opt\b/i,
    /cpt\b/i,
    /citizen/i,
    /green card/i,
    /work permit/i,
    /legally eligible/i,
    /immigration/i,
  ],

  // Salary / Compensation
  salary: [
    /salary/i,
    /compensation/i,
    /expected pay/i,
    /desired pay/i,
    /hourly rate/i,
    /wage/i,
    /target comp/i,
    /expected remuneration/i,
  ],

  // Security / Credentials
  sensitive: [
    /password/i,
    /ssn/i,
    /social security/i,
    /credit card/i,
    /cvv/i,
    /security code/i,
    /pin\b/i,
    /bank account/i,
  ],
};

export interface SafetyCheckResult {
  safe: boolean;
  reason?: 'submit_action' | 'legal_declaration' | 'demographic' | 'work_authorization' | 'salary_expectation' | 'sensitive_credential';
  detail?: string;
}

export function evaluateSafety(element: HTMLElement, combinedContextText: string): SafetyCheckResult {
  // Check tag and input type
  const tagName = element.tagName.toLowerCase();
  const inputType = (element.getAttribute('type') || '').toLowerCase();

  // 1. Never touch submit or button elements
  if (
    tagName === 'button' ||
    inputType === 'submit' ||
    inputType === 'button' ||
    element.getAttribute('role') === 'button'
  ) {
    return {
      safe: false,
      reason: 'submit_action',
      detail: 'Buttons and submit actions are strictly excluded from autofill',
    };
  }

  // 2. Never touch password or sensitive credential inputs
  if (inputType === 'password') {
    return {
      safe: false,
      reason: 'sensitive_credential',
      detail: 'Password fields are never touched',
    };
  }

  const text = combinedContextText.toLowerCase();

  // Check sensitive credentials
  for (const pattern of EXCLUDED_PATTERNS.sensitive) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'sensitive_credential',
        detail: 'Sensitive security or financial field excluded',
      };
    }
  }

  // Check submit-like text in inputs
  for (const pattern of EXCLUDED_PATTERNS.submit) {
    if (pattern.test(text) && (inputType === 'submit' || tagName === 'button')) {
      return {
        safe: false,
        reason: 'submit_action',
        detail: 'Form submission controls must be executed manually by the user',
      };
    }
  }

  // Check legal declarations & consent
  for (const pattern of EXCLUDED_PATTERNS.legal) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'legal_declaration',
        detail: 'Legal declarations and consent agreements require manual user review',
      };
    }
  }

  // Check demographic questions
  for (const pattern of EXCLUDED_PATTERNS.demographic) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'demographic',
        detail: 'Diversity and demographic questions are excluded from autofill',
      };
    }
  }

  // Check work authorization / visa
  for (const pattern of EXCLUDED_PATTERNS.workAuth) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'work_authorization',
        detail: 'Work authorization and visa sponsorship questions require manual confirmation',
      };
    }
  }

  // Check salary expectations
  for (const pattern of EXCLUDED_PATTERNS.salary) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: 'salary_expectation',
        detail: 'Salary expectations and compensation fields are excluded from autofill',
      };
    }
  }

  return { safe: true };
}
