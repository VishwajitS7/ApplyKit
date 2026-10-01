import { ApplicationAdapter } from './base-adapter';
import { DetectedField, DetectionSummary, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';
import { detectFormFields } from '../detector';
import { executeAutofill } from '../autofill';

export class GenericApplicationAdapter implements ApplicationAdapter {
  readonly id = 'generic';
  readonly name = 'Generic Application Adapter';

  matches(): boolean {
    // Default fallback matches any page
    return true;
  }

  detectFields(profile?: UserProfile): DetectionSummary {
    return detectFormFields(document, profile);
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

export const defaultAdapter = new GenericApplicationAdapter();
