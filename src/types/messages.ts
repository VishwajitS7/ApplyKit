import { DetectionSummary, AutofillResult } from './detection';
import { UserProfile } from './profile';

export type ExtensionMessage =
  | { type: 'PING' }
  | { type: 'DETECT_FIELDS'; payload?: { profile?: UserProfile } }
  | { type: 'AUTOFILL_FIELDS'; payload: { fieldIds: string[]; profile: UserProfile; forceOverwrite?: boolean } }
  | { type: 'HIGHLIGHT_FIELD'; payload: { fieldId: string; highlight: boolean } }
  | { type: 'TRIGGER_QUICK_COPY'; payload: { key: string; label: string; text: string } }
  | { type: 'SHOW_TOAST'; payload: { message: string; toastType?: 'success' | 'info' | 'error' } }
  | { type: 'EXTRACT_JOB_DESCRIPTION' }
  | { type: 'TOGGLE_FLOATING_PANEL' }
  | { type: 'OPEN_FLOATING_PANEL' }
  | { type: 'CLOSE_FLOATING_PANEL' };

export type ExtensionResponse =
  | { success: true; data: DetectionSummary }
  | { success: true; data: { results: AutofillResult[]; filledCount: number; skippedCount: number } }
  | { success: true; data?: unknown }
  | { success: false; error: string };
