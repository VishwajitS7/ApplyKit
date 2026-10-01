import React from 'react';
import { Sparkles, RefreshCw, Wand2, AlertCircle, FileQuestion } from 'lucide-react';
import { DetectionSummary } from '../../types/detection';

interface DetectionCardProps {
  summary: DetectionSummary | null;
  loading: boolean;
  onRescan: () => void;
  onOpenPreview: () => void;
  isRestrictedPage: boolean;
}

export const DetectionCard: React.FC<DetectionCardProps> = ({
  summary,
  loading,
  onRescan,
  onOpenPreview,
  isRestrictedPage,
}) => {
  if (isRestrictedPage) {
    return (
      <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            Internal Browser Page
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            ApplyKit autofill works on web pages (Greenhouse, Lever, LinkedIn, etc.). Quick Copy is ready below.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/10 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-brand-500 animate-spin" />
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
              Scanning page for application fields...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const hasForm = summary && summary.formDetected && summary.detectedFields.length > 0;

  if (hasForm) {
    return (
      <div className="p-3.5 rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-transparent dark:border-brand-500/30 dark:from-brand-950/40 dark:via-zinc-900/40">
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 text-white flex items-center justify-center shadow-sm shadow-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                  Application detected
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-700 dark:text-brand-300">
                  {summary.detectedFields.length} fields
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {summary.highConfidenceCount} high confidence · {summary.ambiguousCount} review suggested
              </p>
            </div>
          </div>

          <button
            onClick={onRescan}
            title="Rescan current page"
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onOpenPreview}
          className="w-full py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm shadow-brand-600/30 transition-all subtle-interactive"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Review & Autofill Form</span>
        </button>
      </div>
    );
  }

  // Empty state: no form fields detected
  return (
    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-zinc-400" />
          <div>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              No application form detected
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Use Quick Copy below, or rescan if dynamic form just loaded.
            </p>
          </div>
        </div>

        <button
          onClick={onRescan}
          title="Rescan page"
          className="px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Rescan</span>
        </button>
      </div>
    </div>
  );
};
