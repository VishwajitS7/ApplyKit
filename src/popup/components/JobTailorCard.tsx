import React, { useState } from 'react';
import { Target, Sparkles, ChevronRight, FileText } from 'lucide-react';
import { ResumeMatchReport } from '../../analyzer/resume-matcher';
import { ExtractedJobRequirements } from '../../analyzer/keyword-extractor';

interface JobTailorCardProps {
  jobReqs: ExtractedJobRequirements | null;
  matchReport: ResumeMatchReport | null;
  onOpenTailorModal: () => void;
  onManualJdSubmit: (jdText: string) => void;
}

export const JobTailorCard: React.FC<JobTailorCardProps> = ({
  jobReqs,
  matchReport,
  onOpenTailorModal,
  onManualJdSubmit,
}) => {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualText, setManualText] = useState('');

  if (jobReqs && matchReport) {
    const isHighMatch = matchReport.matchPercentage >= 75;

    return (
      <div className="p-3 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-brand-500/5 to-transparent dark:border-indigo-500/30 dark:from-indigo-950/40 dark:via-zinc-900/40 space-y-2.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {jobReqs.jobTitle}
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {jobReqs.seniority}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {matchReport.matchedSkills.length} matching skills · {matchReport.missingSkills.length} missing
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full flex-shrink-0 ${
              isHighMatch
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
            }`}
          >
            {matchReport.matchPercentage}% Match
          </span>
        </div>

        <button
          onClick={onOpenTailorModal}
          className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition-all subtle-interactive"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tailor Resume & Tech Stack</span>
          <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
        </button>
      </div>
    );
  }

  // Fallback / manual input
  return (
    <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/40 text-xs">
      {!isManualOpen ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px]">Tailor for a custom Job Description?</span>
          </div>
          <button
            onClick={() => setIsManualOpen(true)}
            className="text-[11px] text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            Paste JD
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={3}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste job description requirements here to get ATS suggestions and tailor your profile..."
            className="w-full p-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-brand-500"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsManualOpen(false)}
              className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (manualText.trim().length > 30) {
                  onManualJdSubmit(manualText);
                  setIsManualOpen(false);
                }
              }}
              disabled={manualText.trim().length < 30}
              className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-[11px] font-medium"
            >
              Analyze & Tailor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
