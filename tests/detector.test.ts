/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { detectFormFields } from '../src/content/detector';
import { DEFAULT_USER_PROFILE } from '../src/storage/schema-validator';

describe('Form Field Detector', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <div class="form-group">
          <label for="name-input">Full Name</label>
          <input id="name-input" type="text" name="candidate_name" />
        </div>

        <div class="form-group">
          <label for="email-input">Email Address</label>
          <input id="email-input" type="email" autocomplete="email" />
        </div>

        <div class="form-group">
          <label for="phone-input">Phone Number</label>
          <input id="phone-input" type="tel" autocomplete="tel" />
        </div>

        <div class="form-group">
          <label for="linkedin-input">LinkedIn Profile URL</label>
          <input id="linkedin-input" type="url" placeholder="https://linkedin.com/in/..." />
        </div>

        <div class="form-group">
          <label for="github-input">GitHub Profile</label>
          <input id="github-input" type="url" placeholder="https://github.com/..." />
        </div>

        <!-- Sensitive field (Must be excluded) -->
        <div class="form-group">
          <label for="auth-input">Are you legally authorized to work in the US?</label>
          <select id="auth-input">
            <option value="yes">Yes</option>
          </select>
        </div>

        <!-- Submit button (Must be excluded) -->
        <button type="submit" id="submit-btn">Submit Application</button>
      </form>
    `;

    // In JSDOM, getBoundingClientRect() returns 0 by default, so we mock it for inputs to simulate visible elements
    document.querySelectorAll('input, select, textarea').forEach((el) => {
      el.getBoundingClientRect = () => ({
        width: 200,
        height: 35,
        top: 10,
        left: 10,
        bottom: 45,
        right: 210,
        x: 10,
        y: 10,
        toJSON: () => {},
      });
    });
  });

  it('detects candidate job application fields and skips submit button', () => {
    const summary = detectFormFields(document, DEFAULT_USER_PROFILE);

    expect(summary.formDetected).toBe(true);
    // 5 valid fields (name, email, phone, linkedin, github)
    expect(summary.detectedFields.length).toBe(5);

    const types = summary.detectedFields.map((f) => f.type);
    expect(types).toContain('fullName');
    expect(types).toContain('email');
    expect(types).toContain('phone');
    expect(types).toContain('linkedin');
    expect(types).toContain('github');

    // Make sure button is never in detectedFields
    const tags = summary.detectedFields.map((f) => f.elementTag);
    expect(tags).not.toContain('button');
  });

  it('excludes work authorization and visa questions from autofillable fields', () => {
    const summary = detectFormFields(document, DEFAULT_USER_PROFILE);
    const fieldIds = summary.detectedFields.map((f) => f.id);

    const authEl = document.getElementById('auth-input');
    const authApplyKitId = authEl?.getAttribute('data-applykit-id');
    if (authApplyKitId) {
      expect(fieldIds).not.toContain(authApplyKitId);
    }
  });

  it('identifies non-empty fields accurately', () => {
    const emailEl = document.getElementById('email-input') as HTMLInputElement;
    emailEl.value = 'prefilled@test.com';

    const summary = detectFormFields(document, DEFAULT_USER_PROFILE);
    const emailField = summary.detectedFields.find((f) => f.type === 'email');

    expect(emailField).toBeDefined();
    expect(emailField?.isNonEmpty).toBe(true);
    expect(emailField?.currentValue).toBe('prefilled@test.com');
  });
});
