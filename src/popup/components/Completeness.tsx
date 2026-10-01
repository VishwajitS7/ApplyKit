import React from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { CompletenessResult } from '../../types/profile';

interface CompletenessProps {
  completeness: CompletenessResult;
  onOpenOptions: () => void;
}

export const Completeness: React.FC<CompletenessProps> = ({
  completeness,
  onOpenOptions,
}) => {
  const isComplete = completeness.percentage === 100;

  return (
    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Profile completeness
        </span>
        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
          {completeness.percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-emerald-500'
              : completeness.percentage > 60
              ? 'bg-brand-500'
              : 'bg-amber-500'
          }`}
          style={{ width: `${completeness.percentage}%` }}
        />
      </div>

      {/* Suggestion / Link */}
      <button
        onClick={onOpenOptions}
        className="w-full flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 py-1 transition-colors group"
      >
        <div className="flex items-center gap-1.5 truncate">
          {isComplete ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
          )}
          <span className="truncate group-hover:underline">
            {completeness.nextSuggestion}
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200">
          <span>Edit</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </button>
    </div>
  );
};
