import React, { useState } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { ProfessionalInfo, ResumeDocument } from '../../types/profile';
import { ResumeExtractModal } from './ResumeExtractModal';

interface ProfessionalSectionProps {
  data: ProfessionalInfo;
  resume?: ResumeDocument;
  onChange: (patch: Partial<ProfessionalInfo>) => void;
}

export const ProfessionalSection: React.FC<ProfessionalSectionProps> = ({
  data,
  resume,
  onChange,
}) => {
  const [skillInput, setSkillInput] = useState('');
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [extractSuccessToast, setExtractSuccessToast] = useState<string | null>(null);

  const skills = data.skills || [];

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange({ skills: [...skills, trimmed] });
    }
  };

  const handleRemoveSkill = (toRemove: string) => {
    onChange({ skills: skills.filter((s) => s !== toRemove) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillInput);
      setSkillInput('');
    }
  };

  const handleApplyExtracted = ({
    skills: newSkills,
    summary: newSummary,
    mergeSkills,
  }: {
    skills: string[];
    summary: string;
    mergeSkills: boolean;
  }) => {
    let finalSkills = newSkills;
    if (mergeSkills) {
      const combined = new Set([...(data.skills || []), ...newSkills]);
      finalSkills = Array.from(combined);
    }
    onChange({
      skills: finalSkills,
      summary: newSummary || data.summary,
    });

    setExtractSuccessToast(
      `Extracted and updated ${newSkills.length} skills${newSummary ? ' and summary' : ''}!`
    );
    setTimeout(() => setExtractSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header with Extract from Resume button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Skills & Summary
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Technical skills and short professional bio for application textareas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExtractModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Extract from Resume</span>
        </button>
      </div>

      {extractSuccessToast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{extractSuccessToast}</span>
        </div>
      )}

      {/* Skills */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Skills / Technologies
        </label>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Type a skill and press <kbd className="kbd-shortcut">Enter</kbd> or comma.
        </p>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. TypeScript, React, Python, PostgreSQL"
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => {
              handleAddSkill(skillInput);
              setSkillInput('');
            }}
            disabled={!skillInput.trim()}
            className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Skill badges */}
        <div className="flex flex-wrap gap-1.5 pt-2 min-h-[40px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
          {skills.length === 0 ? (
            <span className="text-[11px] text-zinc-400 italic">
              No skills added yet. Use "Extract from Resume" above to automatically pull your skills.
            </span>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Professional Summary / Bio
          </label>
          <span className="text-[10px] text-zinc-400 font-mono">
            {(data.summary || '').length} chars
          </span>
        </div>
        <textarea
          rows={5}
          value={data.summary || ''}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="A brief 2-4 sentence summary of your background, technical interests, and experience..."
          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden leading-relaxed"
        />
        <p className="text-[11px] text-zinc-400">
          Autofilled into "Tell us about yourself", "Professional Summary", or "Brief Introduction" fields.
        </p>
      </div>

      {/* Extract Modal */}
      <ResumeExtractModal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        storedResume={resume}
        existingSkills={skills}
        existingSummary={data.summary || ''}
        onApply={handleApplyExtracted}
      />
    </div>
  );
};
