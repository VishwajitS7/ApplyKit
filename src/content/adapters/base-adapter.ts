import { DetectedField, DetectionSummary, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';

export interface ApplicationAdapter {
  readonly id: string;
  readonly name: string;

  /**
   * Evaluates whether this adapter should handle the current page.
   */
  matches(): boolean;

  /**
   * Detects and classifies form fields on the page.
   */
  detectFields(profile?: UserProfile): DetectionSummary;

  /**
   * Safely fills the selected fields with user profile data.
   */
  autofill(
    fieldIds: string[],
    detectedFields: DetectedField[],
    profile: UserProfile,
    forceOverwrite?: boolean
  ): Promise<AutofillResult[]>;
}
