import { ApplicationAdapter } from './base-adapter';
import { DetectedField, DetectionSummary, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';
import { detectFormFields } from '../detector';
import { executeAutofill } from '../autofill';

export class AshbyAdapter implements ApplicationAdapter {
  readonly id = 'ashby';
  readonly name = 'Ashby Application Adapter';

  matches(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return (
      host.includes('ashbyhq.com') ||
      host.includes('ashby') ||
      Boolean(
        document.querySelector(
          'form[action*="ashbyhq.com"], [data-ashby-input], [class*="_ashby"], .ashby-application-form'
        )
      )
    );
  }

  detectFields(profile?: UserProfile): DetectionSummary {
    return detectFormFields(document, profile, (el) => {
      const nameAttr = (el.getAttribute('name') || '').toLowerCase();
      const idAttr = (el.id || '').toLowerCase();
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

      const combined = `${nameAttr} ${idAttr} ${placeholder} ${ariaLabel}`;

      if (combined.includes('firstname') || combined.includes('first name') || combined.includes('givenname')) {
        return { type: 'firstName', confidence: 1.0 };
      }
      if (combined.includes('lastname') || combined.includes('last name') || combined.includes('familyname')) {
        return { type: 'lastName', confidence: 1.0 };
      }
      if (nameAttr === 'name' || nameAttr === '_name' || nameAttr === 'fullname' || combined.includes('full name')) {
        return { type: 'fullName', confidence: 1.0 };
      }
      if (combined.includes('email')) {
        return { type: 'email', confidence: 1.0 };
      }
      if (combined.includes('phone') || combined.includes('mobile')) {
        return { type: 'phone', confidence: 1.0 };
      }
      if (combined.includes('linkedin')) {
        return { type: 'linkedin', confidence: 1.0 };
      }
      if (combined.includes('github')) {
        return { type: 'github', confidence: 1.0 };
      }
      if (combined.includes('portfolio') || combined.includes('website') || combined.includes('urls.other')) {
        return { type: 'portfolio', confidence: 1.0 };
      }
      if (combined.includes('coverletter') || combined.includes('cover letter') || combined.includes('summary')) {
        return { type: 'summary', confidence: 1.0 };
      }

      return null;
    });
  }

  async autofill(
    fieldIds: string[],
    detectedFields: DetectedField[],
    profile: UserProfile,
    forceOverwrite: boolean = false
  ): Promise<AutofillResult[]> {
    return executeAutofill(fieldIds, detectedFields, profile, forceOverwrite);
  }
}

export const ashbyAdapter = new AshbyAdapter();
