import { UserProfile } from './profile';

export type FieldType =
  | 'fullName'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'linkedin'
  | 'github'
  | 'leetcode'
  | 'portfolio'
  | 'college'
  | 'degree'
  | 'branch'
  | 'graduationYear'
  | 'cgpa'
  | 'skills'
  | 'summary'
  | 'unknown';

export interface FieldSignal {
  source: 'label' | 'placeholder' | 'name' | 'id' | 'aria' | 'autocomplete' | 'nearbyText' | 'type';
  text: string;
  weight: number;
}

export interface DetectedField {
  id: string; // DOM-specific unique ID (data-applykit-id)
  type: FieldType;
  confidence: number; // 0.0 to 1.0
  label: string;
  matchedValue: string;
  currentValue: string;
  isNonEmpty: boolean;
  elementTag: 'input' | 'textarea' | 'select';
  inputType?: string;
  selector?: string;
  signals: FieldSignal[];
}

export type AutofillStatus = 'filled' | 'skipped_non_empty' | 'failed' | 'not_selected' | 'denied_by_safety';

export interface AutofillResult {
  fieldId: string;
  type: FieldType;
  label: string;
  status: AutofillStatus;
  filledValue?: string;
  error?: string;
}

export interface DetectionSummary {
  formDetected: boolean;
  totalInputsOnPage: number;
  detectedFields: DetectedField[];
  highConfidenceCount: number;
  ambiguousCount: number;
}

export interface ApplicationAdapter {
  name: string;
  matches(): boolean;
  detectFields(profile?: UserProfile): DetectedField[];
  autofill(fieldIds: string[], profile: UserProfile, forceOverwrite?: boolean): Promise<AutofillResult[]>;
}
