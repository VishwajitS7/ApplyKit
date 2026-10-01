import { ApplicationAdapter } from './base-adapter';
import { DetectedField, DetectionSummary, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';
import { detectFormFields } from '../detector';
import { executeAutofill } from '../autofill';

export class WorkdayAdapter implements ApplicationAdapter {
  readonly id = 'workday';
  readonly name = 'Workday Application Adapter';

  matches(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return (
      host.includes('myworkdayjobs.com') ||
      host.includes('myworkday.com') ||
      host.includes('workday') ||
      Boolean(
        document.querySelector(
          '[data-automation-id="applicationPage"], [data-automation-id*="legalNameSection"], [data-automation-id*="workday"]'
        )
      )
    );
  }

  detectFields(profile?: UserProfile): DetectionSummary {
    return detectFormFields(document, profile, (el) => {
      const autoId = (el.getAttribute('data-automation-id') || '').toLowerCase();
      const parentAutoId = (el.closest('[data-automation-id]')?.getAttribute('data-automation-id') || '').toLowerCase();
      const idAttr = (el.id || '').toLowerCase();
      const nameAttr = (el.getAttribute('name') || '').toLowerCase();

      const combinedIds = `${autoId} ${parentAutoId} ${idAttr} ${nameAttr}`;

      if (combinedIds.includes('firstname') || combinedIds.includes('first-name') || combinedIds.includes('legalnamesection_firstname')) {
        return { type: 'firstName', confidence: 1.0 };
      }
      if (combinedIds.includes('lastname') || combinedIds.includes('last-name') || combinedIds.includes('legalnamesection_lastname')) {
        return { type: 'lastName', confidence: 1.0 };
      }
      if (combinedIds.includes('email')) {
        return { type: 'email', confidence: 1.0 };
      }
      if (combinedIds.includes('phone') || combinedIds.includes('mobile')) {
        return { type: 'phone', confidence: 1.0 };
      }
      if (combinedIds.includes('school') || combinedIds.includes('institution') || combinedIds.includes('university') || combinedIds.includes('college')) {
        return { type: 'college', confidence: 1.0 };
      }
      if (combinedIds.includes('degree')) {
        return { type: 'degree', confidence: 1.0 };
      }
      if (combinedIds.includes('fieldofstudy') || combinedIds.includes('field-of-study') || combinedIds.includes('major')) {
        return { type: 'branch', confidence: 1.0 };
      }
      if (combinedIds.includes('gpa') || combinedIds.includes('cgpa')) {
        return { type: 'cgpa', confidence: 1.0 };
      }
      if (combinedIds.includes('linkedin')) {
        return { type: 'linkedin', confidence: 1.0 };
      }
      if (combinedIds.includes('github')) {
        return { type: 'github', confidence: 1.0 };
      }
      if (combinedIds.includes('website') || combinedIds.includes('portfolio')) {
        return { type: 'portfolio', confidence: 1.0 };
      }
      if (combinedIds.includes('coverletter') || combinedIds.includes('cover-letter') || combinedIds.includes('summary')) {
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

export const workdayAdapter = new WorkdayAdapter();
