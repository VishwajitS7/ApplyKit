import { ApplicationAdapter } from './base-adapter';
import { DetectedField, DetectionSummary, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';
import { detectFormFields } from '../detector';
import { executeAutofill } from '../autofill';

export class LeverAdapter implements ApplicationAdapter {
  readonly id = 'lever';
  readonly name = 'Lever Application Adapter';

  matches(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return (
      host.includes('lever.co') ||
      Boolean(
        document.querySelector(
          '.lever-form, form#application-form, form[action*="lever.co"], .application-form, [data-qa="btn-apply"]'
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

      // Lever uses a single input for Full Name
      if (nameAttr === 'name' || idAttr === 'name' || combined.includes('full name') || combined.includes('your name')) {
        return { type: 'fullName', confidence: 1.0 };
      }
      if (nameAttr === 'email' || idAttr === 'email' || combined.includes('email')) {
        return { type: 'email', confidence: 1.0 };
      }
      if (nameAttr === 'phone' || idAttr === 'phone' || combined.includes('phone')) {
        return { type: 'phone', confidence: 1.0 };
      }
      if (nameAttr.includes('urls[linkedin]') || combined.includes('linkedin')) {
        return { type: 'linkedin', confidence: 1.0 };
      }
      if (nameAttr.includes('urls[github]') || combined.includes('github')) {
        return { type: 'github', confidence: 1.0 };
      }
      if (
        nameAttr.includes('urls[portfolio]') ||
        nameAttr.includes('urls[other]') ||
        nameAttr.includes('urls[website]') ||
        combined.includes('portfolio') ||
        combined.includes('website')
      ) {
        return { type: 'portfolio', confidence: 1.0 };
      }
      if (
        nameAttr === 'comments' ||
        idAttr === 'comments' ||
        combined.includes('comments') ||
        combined.includes('additional')
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

export const leverAdapter = new LeverAdapter();
