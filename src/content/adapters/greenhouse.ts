import { ApplicationAdapter } from './base-adapter';
import { DetectedField, DetectionSummary, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';
import { detectFormFields } from '../detector';
import { executeAutofill } from '../autofill';

export class GreenhouseAdapter implements ApplicationAdapter {
  readonly id = 'greenhouse';
  readonly name = 'Greenhouse Job Board Adapter';

  matches(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return (
      host.includes('greenhouse.io') ||
      host.includes('gh-hire') ||
      Boolean(
        document.querySelector(
          '#application_form, form#application, form[action*="greenhouse.io"], .greenhouse-job-application'
        )
      )
    );
  }

  detectFields(profile?: UserProfile): DetectionSummary {
    return detectFormFields(document, profile, (el) => {
      const idAttr = (el.id || '').toLowerCase();
      const nameAttr = (el.getAttribute('name') || '').toLowerCase();
      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
      const combined = `${idAttr} ${nameAttr} ${placeholder} ${ariaLabel}`;

      // Explicit Greenhouse ID/Name mappings
      if (idAttr === 'first_name' || nameAttr === 'first_name' || idAttr.includes('first_name')) {
        return { type: 'firstName', confidence: 1.0 };
      }
      if (idAttr === 'last_name' || nameAttr === 'last_name' || idAttr.includes('last_name')) {
        return { type: 'lastName', confidence: 1.0 };
      }
      if (idAttr === 'email' || nameAttr === 'email') {
        return { type: 'email', confidence: 1.0 };
      }
      if (idAttr === 'phone' || nameAttr === 'phone') {
        return { type: 'phone', confidence: 1.0 };
      }
      if (combined.includes('linkedin')) {
        return { type: 'linkedin', confidence: 1.0 };
      }
      if (combined.includes('github')) {
        return { type: 'github', confidence: 1.0 };
      }
      if (
        combined.includes('website') ||
        combined.includes('portfolio') ||
        combined.includes('other_website')
      ) {
        return { type: 'portfolio', confidence: 1.0 };
      }
      if (
        idAttr === 'cover_letter_text' ||
        combined.includes('cover_letter') ||
        combined.includes('cover letter')
      ) {
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

export const greenhouseAdapter = new GreenhouseAdapter();
