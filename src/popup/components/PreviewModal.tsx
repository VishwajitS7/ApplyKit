import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Wand2,
  RotateCcw,
} from 'lucide-react';
import { DetectedField, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';

interface PreviewModalProps {
  fields: DetectedField[];
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAutofill: (selectedFieldIds: string[], forceOverwrite: boolean) => Promise<AutofillResult[]>;
  onHoverField: (fieldId: string, highlight: boolean) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  fields,
  profile,
  isOpen,
  onClose,
  onAutofill,
  onHoverField,
}) => {
  // Pre-select high confidence fields that have profile values and are not blocked
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    fields.forEach((f) => {
      // Preselect if it has a matched value and confidence >= 0.65
      if (f.matchedValue && f.matchedValue.trim().length > 0 && f.confidence >= 0.65) {
        initial.add(f.id);
      }
    });
    return initial;
  });

  const [forceOverwrite, setForceOverwrite] = useState(profile.settings.overwriteNonEmpty || false);
  const [isFilling, setIsFilling] = useState(false);
  const [results, setResults] = useState<AutofillResult[] | null>(null);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.size === fields.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(fields.map((f) => f.id)));
    }
  };

  const toggleField = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExecuteAutofill = async () => {
    setIsFilling(true);
    try {
      const res = await onAutofill(Array.from(selectedIds), forceOverwrite);
      setResults(res);
    } catch (err) {
      console.error('[ApplyKit] Autofill execution error:', err);
    } finally {
      setIsFilling(false);
    }
  };

  const filledCount = results ? results.filter((r) => r.status === 'filled').length : 0;
  const skippedCount = results ? results.filter((r) => r.status === 'skipped_non_empty').length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end transition-opacity">
      <div className="bg-white dark:bg-surface-850 rounded-t-2xl max-h-[92vh] flex flex-col shadow-2xl border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Autofill Preview
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold">
                {selectedIds.size} / {fields.length} selected
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Review fields before filling. You remain in control.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Banner (if already filled) */}
        {results && (
          <div className="mx-3 mt-2.5 p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  ✓ {filledCount} field{filledCount !== 1 ? 's' : ''} filled successfully!
                </span>
              </div>
              <button
                onClick={() => setResults(null)}
                className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-0.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            {skippedCount > 0 && (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                {skippedCount} field{skippedCount !== 1 ? 's' : ''} skipped because they already had text (preserve existing is active).
              </p>
            )}
          </div>
        )}

        {/* Select All & Options Bar */}
        <div className="px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
          <button
            onClick={toggleSelectAll}
            className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            {selectedIds.size === fields.length ? 'Deselect All' : 'Select All'}
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={forceOverwrite}
              onChange={(e) => setForceOverwrite(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-3 h-3 cursor-pointer"
            />
            <span>Overwrite existing values</span>
          </label>
        </div>

        {/* Field List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1 max-h-[320px]">
          {fields.map((field) => {
            const isSelected = selectedIds.has(field.id);
            const isHighConfidence = field.confidence >= 0.70;
            const hasMatchedValue = Boolean(field.matchedValue && field.matchedValue.trim().length > 0);

            return (
              <div
                key={field.id}
                onMouseEnter={() => onHoverField(field.id, true)}
                onMouseLeave={() => onHoverField(field.id, false)}
                onClick={() => toggleField(field.id)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-brand-500/40 bg-brand-500/5 dark:bg-brand-500/10'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850/30 opacity-70'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by container click
                    className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {field.label}
                        </span>
                        {field.isNonEmpty && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium">
                            Has value
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 rounded font-semibold flex-shrink-0 ${
                          isHighConfidence
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        }`}
                        title={`Confidence: ${Math.round(field.confidence * 100)}%`}
                      >
                        {Math.round(field.confidence * 100)}%
                      </span>
                    </div>

                    {/* Matched Profile Value */}
                    <div className="mt-1 flex items-center gap-1 text-[11px]">
                      <span className="text-zinc-400">Fill:</span>
                      {hasMatchedValue ? (
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 rounded text-[10px]">
                          {field.matchedValue}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic text-[10px]">
                          (No value in profile)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Guarantee Footer */}
        <div className="px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>ApplyKit never submits forms, clicks apply, or touches legal questions.</span>
        </div>

        {/* Action Button */}
        <div className="p-3 bg-white dark:bg-surface-850 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-1/3 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteAutofill}
            disabled={isFilling || selectedIds.size === 0}
            className="w-2/3 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm shadow-brand-600/30 transition-all subtle-interactive"
          >
            {isFilling ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>
              {isFilling ? 'Autofilling...' : `Autofill Selected (${selectedIds.size})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
