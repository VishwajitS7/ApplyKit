/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { AdapterRegistry } from '../src/content/adapters/adapter-registry';
import { GreenhouseAdapter } from '../src/content/adapters/greenhouse';
import { LeverAdapter } from '../src/content/adapters/lever';
import { WorkdayAdapter } from '../src/content/adapters/workday';
import { AshbyAdapter } from '../src/content/adapters/ashby';
import { setElementValue } from '../src/content/autofill';
import { DEFAULT_USER_PROFILE } from '../src/storage/schema-validator';
import { UserProfile } from '../src/types/profile';

describe('ATS Adapters & Combobox Engine', () => {
  const mockProfile: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    personal: {
      ...DEFAULT_USER_PROFILE.personal,
      fullName: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '+1 555 123 4567',
    },
    education: {
      ...DEFAULT_USER_PROFILE.education,
      college: 'Stanford University',
      degree: 'Bachelor of Science',
      branch: 'Computer Science',
      graduationYear: '2025',
      cgpa: '3.9',
    },
    profiles: {
      ...DEFAULT_USER_PROFILE.profiles,
      linkedin: 'https://linkedin.com/in/janedoe',
      github: 'https://github.com/janedoe',
      portfolio: 'https://janedoe.me',
    },
    professional: {
      ...DEFAULT_USER_PROFILE.professional,
      skills: ['TypeScript', 'React', 'Node.js'],
      summary: 'Passionate software engineer experienced in cloud systems.',
    },
  };

  function mockElementsVisible() {
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
  }

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Adapter Registry', () => {
    it('registers all specialized adapters and falls back to generic', () => {
      const registry = new AdapterRegistry();
      const all = registry.getAll();
      expect(all.some((a) => a.id === 'greenhouse')).toBe(true);
      expect(all.some((a) => a.id === 'lever')).toBe(true);
      expect(all.some((a) => a.id === 'workday')).toBe(true);
      expect(all.some((a) => a.id === 'ashby')).toBe(true);
      expect(all.some((a) => a.id === 'generic')).toBe(true);

      // On empty page, fallback adapter is chosen
      const active = registry.getActiveAdapter();
      expect(active.id).toBe('generic');
    });

    it('identifies Greenhouse by form selector', () => {
      document.body.innerHTML = '<form id="application_form"></form>';
      const greenhouse = new GreenhouseAdapter();
      expect(greenhouse.matches()).toBe(true);
    });

    it('identifies Lever by form selector', () => {
      document.body.innerHTML = '<form id="application-form" class="lever-form"></form>';
      const lever = new LeverAdapter();
      expect(lever.matches()).toBe(true);
    });

    it('identifies Workday by data-automation-id selector', () => {
      document.body.innerHTML = '<div data-automation-id="applicationPage"></div>';
      const workday = new WorkdayAdapter();
      expect(workday.matches()).toBe(true);
    });

    it('identifies Ashby by selector', () => {
      document.body.innerHTML = '<div class="_ashby_form_wrapper"><input data-ashby-input="true" /></div>';
      const ashby = new AshbyAdapter();
      expect(ashby.matches()).toBe(true);
    });
  });

  describe('Greenhouse Field Detection', () => {
    it('maps Greenhouse field IDs with 1.0 confidence', () => {
      document.body.innerHTML = `
        <form id="application_form">
          <input id="first_name" name="first_name" type="text" />
          <input id="last_name" name="last_name" type="text" />
          <input id="email" name="email" type="email" />
          <input id="phone" name="phone" type="tel" />
          <input id="job_application_answers_attributes_0_text_value" name="job_application[answers_attributes][0][text_value]" placeholder="LinkedIn Profile" />
          <textarea id="cover_letter_text" name="cover_letter_text"></textarea>
        </form>
      `;
      mockElementsVisible();

      const adapter = new GreenhouseAdapter();
      const summary = adapter.detectFields(mockProfile);

      const firstName = summary.detectedFields.find((f) => f.type === 'firstName');
      const lastName = summary.detectedFields.find((f) => f.type === 'lastName');
      const email = summary.detectedFields.find((f) => f.type === 'email');
      const phone = summary.detectedFields.find((f) => f.type === 'phone');
      const summaryField = summary.detectedFields.find((f) => f.type === 'summary');

      expect(firstName).toBeDefined();
      expect(firstName?.confidence).toBe(1.0);
      expect(firstName?.matchedValue).toBe('Jane');

      expect(lastName).toBeDefined();
      expect(lastName?.confidence).toBe(1.0);
      expect(lastName?.matchedValue).toBe('Doe');

      expect(email?.confidence).toBe(1.0);
      expect(phone?.confidence).toBe(1.0);
      expect(summaryField?.confidence).toBe(1.0);
      expect(summaryField?.matchedValue).toBe(mockProfile.professional.summary);
    });
  });

  describe('Lever Field Detection', () => {
    it('maps Lever single name and urls with 1.0 confidence', () => {
      document.body.innerHTML = `
        <form class="lever-form">
          <input name="name" type="text" />
          <input name="email" type="email" />
          <input name="phone" type="tel" />
          <input name="urls[LinkedIn]" type="url" />
          <input name="urls[GitHub]" type="url" />
          <input name="urls[Portfolio]" type="url" />
          <textarea name="comments"></textarea>
        </form>
      `;
      mockElementsVisible();

      const adapter = new LeverAdapter();
      const summary = adapter.detectFields(mockProfile);

      const fullName = summary.detectedFields.find((f) => f.type === 'fullName');
      const linkedin = summary.detectedFields.find((f) => f.type === 'linkedin');
      const github = summary.detectedFields.find((f) => f.type === 'github');
      const portfolio = summary.detectedFields.find((f) => f.type === 'portfolio');
      const comments = summary.detectedFields.find((f) => f.type === 'summary');

      expect(fullName?.confidence).toBe(1.0);
      expect(fullName?.matchedValue).toBe('Jane Doe');

      expect(linkedin?.confidence).toBe(1.0);
      expect(linkedin?.matchedValue).toBe('https://linkedin.com/in/janedoe');

      expect(github?.confidence).toBe(1.0);
      expect(portfolio?.confidence).toBe(1.0);
      expect(comments?.confidence).toBe(1.0);
    });
  });

  describe('Workday Field Detection', () => {
    it('maps data-automation-id attributes with 1.0 confidence', () => {
      document.body.innerHTML = `
        <div data-automation-id="applicationPage">
          <input data-automation-id="legalNameSection_firstName" type="text" />
          <input data-automation-id="legalNameSection_lastName" type="text" />
          <input data-automation-id="email" type="email" />
          <input data-automation-id="phone-number" type="tel" />
          <input data-automation-id="school" type="text" />
          <input data-automation-id="degree" type="text" />
          <input data-automation-id="gpa" type="text" />
        </div>
      `;
      mockElementsVisible();

      const adapter = new WorkdayAdapter();
      const summary = adapter.detectFields(mockProfile);

      const firstName = summary.detectedFields.find((f) => f.type === 'firstName');
      const lastName = summary.detectedFields.find((f) => f.type === 'lastName');
      const college = summary.detectedFields.find((f) => f.type === 'college');
      const degree = summary.detectedFields.find((f) => f.type === 'degree');
      const cgpa = summary.detectedFields.find((f) => f.type === 'cgpa');

      expect(firstName?.confidence).toBe(1.0);
      expect(lastName?.confidence).toBe(1.0);
      expect(college?.confidence).toBe(1.0);
      expect(college?.matchedValue).toBe('Stanford University');
      expect(degree?.confidence).toBe(1.0);
      expect(cgpa?.confidence).toBe(1.0);
    });
  });

  describe('Combobox and Dropdown Autofill Engine', () => {
    it('matches select options by exact value and visible text', () => {
      document.body.innerHTML = `
        <select id="degree-select">
          <option value="">Select degree</option>
          <option value="assoc">Associate Degree</option>
          <option value="bs">Bachelor of Science</option>
          <option value="ms">Master of Science</option>
        </select>
      `;

      const select = document.getElementById('degree-select') as HTMLSelectElement;
      const success = setElementValue(select, 'Bachelor of Science');
      expect(success).toBe(true);
      expect(select.value).toBe('bs');
    });

    it('matches select options with fuzzy / substring matching', () => {
      document.body.innerHTML = `
        <select id="degree-select">
          <option value="">Please choose</option>
          <option value="bachelor">Bachelor's Degree or equivalent</option>
          <option value="master">Master's Degree</option>
        </select>
      `;

      const select = document.getElementById('degree-select') as HTMLSelectElement;
      const success = setElementValue(select, 'Bachelor of Science');
      expect(success).toBe(true);
      expect(select.value).toBe('bachelor');
    });

    it('autofills inner input when target is a combobox wrapper', () => {
      document.body.innerHTML = `
        <div id="custom-combobox" role="combobox">
          <input type="text" class="search-input" />
        </div>
      `;

      const wrapper = document.getElementById('custom-combobox') as HTMLElement;
      const input = wrapper.querySelector('input') as HTMLInputElement;

      const success = setElementValue(wrapper, 'Stanford University');
      expect(success).toBe(true);
      expect(input.value).toBe('Stanford University');
    });
  });
});
