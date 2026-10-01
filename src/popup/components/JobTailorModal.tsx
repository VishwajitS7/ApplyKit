import React, { useState } from 'react';
import {
  X,
  Check,
  Plus,
  Copy,
  Wand2,
  Lightbulb,
} from 'lucide-react';
import { ExtractedJobRequirements } from '../../analyzer/keyword-extractor';
import { ResumeMatchReport } from '../../analyzer/resume-matcher';
import { TailoredProfileResult } from '../../analyzer/tailor-engine';
import { copyTextToClipboard } from '../../utils/clipboard';

interface JobTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobReqs: ExtractedJobRequirements;
  matchReport: ResumeMatchReport;
  tailoredResult: TailoredProfileResult;
  onAddSkillToProfile: (skill: string) => Promise<void>;
  onApplyTailoredData: (tailoredSummary: string, tailoredSkills: string[], saveAsDefault: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const JobTailorModal: React.FC<JobTailorModalProps> = ({
  isOpen,
  onClose,
  jobReqs,
  matchReport,
  tailoredResult,
  onAddSkillToProfile,
  onApplyTailoredData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'summary' | 'coverLetter' | 'outreach' | 'skills'>('suggestions');
  const [summaryTone, setSummaryTone] = useState<'impact' | 'specialist' | 'adaptable'>('impact');
  const [customSummary, setCustomSummary] = useState(tailoredResult.tailoredSummaries.impact);
  const [coverLetterType, setCoverLetterType] = useState<'standard' | 'short'>('standard');
  const [customCoverLetter, setCustomCoverLetter] = useState(tailoredResult.coverLetters?.standard || '');
  const [outreachType, setOutreachType] = useState<'inmail' | 'email' | 'pitch'>('inmail');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToneChange = (tone: 'impact' | 'specialist' | 'adaptable') => {
    setSummaryTone(tone);
    setCustomSummary(tailoredResult.tailoredSummaries[tone]);
  };

  const handleCoverLetterTypeChange = (type: 'standard' | 'short') => {
    setCoverLetterType(type);
    setCustomCoverLetter(tailoredResult.coverLetters?.[type] || '');
  };

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedSection(label);
      onShowToast(`Copied ${label}`);
      setTimeout(() => setCopiedSection(null), 1500);
    }
  };

  const handleApply = (saveAsDefault: boolean) => {
    onApplyTailoredData(customSummary, tailoredResult.prioritizedSkills, saveAsDefault);
    onShowToast(saveAsDefault ? 'Saved tailored profile as default!' : 'Tailored profile applied to autofill session!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
      <div className="bg-white dark:bg-surface-850 rounded-t-2xl max-h-[94vh] flex flex-col shadow-2xl border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                {jobReqs.jobTitle}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                {matchReport.matchPercentage}% ATS Match
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Resume suggestions & targeted profile adaptation
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-2 text-center font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'suggestions'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            ATS Match ({matchReport.missingSkills.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 text-center font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'summary'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('coverLetter')}
            className={`px-3 py-2 text-center font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'coverLetter'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('outreach')}
            className={`px-3 py-2 text-center font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'outreach'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Cold Outreach
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-2 text-center font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'skills'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Tech Stack
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-3.5 overflow-y-auto space-y-3 max-h-[380px] text-xs">
          {/* 1. Suggestions Tab */}
          {activeTab === 'suggestions' && (
            <div className="space-y-3">
              {/* Missing Skills */}
              {matchReport.missingSkills.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                    <span>Missing Skills in Your Profile</span>
                    <span className="text-zinc-400 font-normal">Click + to add</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchReport.missingSkills.map((s) => (
                      <button
                        key={s.canonical}
                        onClick={() => {
                          onAddSkillToProfile(s.canonical);
                          onShowToast(`Added ${s.canonical} to profile`);
                        }}
                        className={`group inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition-colors ${
                          s.isRequired
                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-brand-500'
                        }`}
                        title={s.isRequired ? 'Required by job' : 'Preferred keyword'}
                      >
                        <span>{s.canonical}</span>
                        <Plus className="w-3 h-3 text-zinc-400 group-hover:text-brand-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Skills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                  Matched Skills ({matchReport.matchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {matchReport.matchedSkills.map((s) => (
                    <span
                      key={s.canonical}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      <Check className="w-3 h-3" />
                      <span>{s.canonical}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Advice Bullet Points */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>ATS Resume Advice</span>
                </span>
                <ul className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                  {matchReport.suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-brand-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 2. Tailored Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Choose Summary Tone:
                </span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => handleToneChange('impact')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      summaryTone === 'impact'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Impact
                  </button>
                  <button
                    onClick={() => handleToneChange('specialist')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      summaryTone === 'specialist'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Specialist
                  </button>
                  <button
                    onClick={() => handleToneChange('adaptable')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      summaryTone === 'adaptable'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Adaptable
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {customSummary.length} characters
                </span>
                <button
                  onClick={() => handleCopy(customSummary, 'Summary')}
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center gap-1"
                >
                  {copiedSection === 'Summary' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'Summary' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Cover Letter Tab */}
          {activeTab === 'coverLetter' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Format / Length:
                </span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => handleCoverLetterTypeChange('standard')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      coverLetterType === 'standard'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Standard (3-Para)
                  </button>
                  <button
                    onClick={() => handleCoverLetterTypeChange('short')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      coverLetterType === 'short'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Modern Pitch
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={customCoverLetter}
                onChange={(e) => setCustomCoverLetter(e.target.value)}
                placeholder="Synthesized cover letter..."
                className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-hidden font-sans"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {customCoverLetter.length} chars · {customCoverLetter.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  onClick={() => handleCopy(customCoverLetter, 'Cover Letter')}
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedSection === 'Cover Letter' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'Cover Letter' ? 'Copied' : 'Copy Cover Letter'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Cold Outreach Tab */}
          {activeTab === 'outreach' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Channel / Tone:
                </span>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => setOutreachType('inmail')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      outreachType === 'inmail'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    LinkedIn InMail
                  </button>
                  <button
                    onClick={() => setOutreachType('email')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      outreachType === 'email'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Cold Email
                  </button>
                  <button
                    onClick={() => setOutreachType('pitch')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      outreachType === 'pitch'
                        ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Quick DM
                  </button>
                </div>
              </div>

              {outreachType === 'inmail' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white leading-relaxed">
                    {tailoredResult.coldOutreach?.recruiterInMail}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {tailoredResult.coldOutreach?.recruiterInMail?.split(/\s+/).filter(Boolean).length || 0} words
                    </span>
                    <button
                      onClick={() => handleCopy(tailoredResult.coldOutreach?.recruiterInMail || '', 'InMail Message')}
                      className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSection === 'InMail Message' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'InMail Message' ? 'Copied' : 'Copy InMail'}</span>
                    </button>
                  </div>
                </div>
              )}

              {outreachType === 'email' && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Subject Line:</span>
                    <div className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-xs">
                      <span className="font-medium text-zinc-900 dark:text-white truncate">
                        {tailoredResult.coldOutreach?.hiringManagerEmail?.subject}
                      </span>
                      <button
                        onClick={() => handleCopy(tailoredResult.coldOutreach?.hiringManagerEmail?.subject || '', 'Subject')}
                        className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-0.5 ml-2 cursor-pointer"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Email Body:</span>
                    <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {tailoredResult.coldOutreach?.hiringManagerEmail?.body}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        handleCopy(
                          `Subject: ${tailoredResult.coldOutreach?.hiringManagerEmail?.subject}\n\n${tailoredResult.coldOutreach?.hiringManagerEmail?.body}`,
                          'Full Email'
                        )
                      }
                      className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSection === 'Full Email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'Full Email' ? 'Copied' : 'Copy Subject + Body'}</span>
                    </button>
                  </div>
                </div>
              )}

              {outreachType === 'pitch' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white leading-relaxed">
                    {tailoredResult.coldOutreach?.elevatorPitch}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {tailoredResult.coldOutreach?.elevatorPitch?.length || 0} characters
                    </span>
                    <button
                      onClick={() => handleCopy(tailoredResult.coldOutreach?.elevatorPitch || '', 'Pitch')}
                      className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSection === 'Pitch' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'Pitch' ? 'Copied' : 'Copy Pitch'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Tech Stack Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Prioritized Tech Stack Order
                </span>
                <p className="text-[10px] text-zinc-400">
                  Skills matching the job requirements are placed first to pass recruiter scans.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto">
                {tailoredResult.prioritizedSkills.map((skill, index) => {
                  const isMatching = matchReport.matchedSkills.some(
                    (s) => s.canonical.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <span
                      key={skill}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        isMatching
                          ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30'
                          : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="font-mono text-[9px] opacity-60">{index + 1}.</span>
                      <span>{skill}</span>
                    </span>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy(tailoredResult.prioritizedSkills.join(', '), 'Tech Stack')}
                  className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium flex items-center gap-1"
                >
                  {copiedSection === 'Tech Stack' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'Tech Stack' ? 'Copied' : 'Copy Comma-Separated'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-surface-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <button
            onClick={() => handleApply(false)}
            className="flex-1 py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-brand-600/30 transition-all subtle-interactive"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Apply to Autofill Preview</span>
          </button>

          <button
            onClick={() => handleApply(true)}
            title="Save tailored summary & skills as your default profile values"
            className="py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            Save to Profile
          </button>
        </div>
      </div>
    </div>
  );
};
