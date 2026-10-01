import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  FileText,
  Clipboard,
  Check,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  Wand2,
} from 'lucide-react';
import { ResumeDocument } from '../../types/profile';
import {
  extractSkillsAndSummaryFromResumeText,
  extractTextFromFile,
  extractTextFromDataUrl,
  ResumeExtractionResult,
  inferCandidateTitle,
  inferYearsOfExperience,
} from '../../analyzer/resume-extractor';

interface ResumeExtractModalProps {
  storedResume?: ResumeDocument;
  existingSkills: string[];
  existingSummary: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: (extracted: { skills: string[]; summary: string; mergeSkills: boolean }) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Skills',
  languages: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  cloud_devops: 'Cloud & DevOps',
  databases: 'Databases',
  testing: 'Testing',
  ai_data: 'AI & Data',
  architecture: 'Architecture',
  other: 'Other Tools',
};

export const ResumeExtractModal: React.FC<ResumeExtractModalProps> = ({
  storedResume,
  existingSkills,
  existingSummary,
  isOpen,
  onClose,
  onApply,
}) => {
  const [activeSource, setActiveSource] = useState<'stored' | 'upload' | 'paste'>(
    storedResume ? 'stored' : 'paste'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<ResumeExtractionResult | null>(null);

  // Extracted state for user review
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [reviewedSummary, setReviewedSummary] = useState('');
  const [mergeSkills, setMergeSkills] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  if (!isOpen) return null;

  const handleExtractFromText = (rawText: string) => {
    if (!rawText || rawText.trim().length < 40) {
      setErrorMessage('Please provide sufficient resume text (at least 40 characters).');
      return;
    }
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const extracted = extractSkillsAndSummaryFromResumeText(rawText);
      setResult(extracted);
      setSelectedSkills(extracted.skills);
      setReviewedSummary(extracted.summary || existingSummary);
      setSelectedCategory('all');
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to extract data from resume.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStoredResumeExtract = async () => {
    if (!storedResume) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      if (storedResume.data) {
        const text = await extractTextFromDataUrl(storedResume.data);
        if (text && text.trim().length >= 30) {
          handleExtractFromText(text);
          return;
        }
      }
      setErrorMessage(
        storedResume.data
          ? 'Could not extract readable text from stored resume. Please upload your file or paste text below.'
          : 'No local resume file data found in storage. Please upload your resume file or paste text below.'
      );
      setActiveSource('paste');
    } catch {
      setErrorMessage('Failed to read stored resume. Please paste text directly.');
      setActiveSource('paste');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 30) {
        setErrorMessage('Could not extract readable text from this file. Please paste text directly.');
        setActiveSource('paste');
      } else {
        handleExtractFromText(text);
      }
    } catch (err) {
      setErrorMessage('Error reading file. Please paste text directly.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
    }
    if (result && !result.skills.includes(trimmed)) {
      setResult({
        ...result,
        skills: [...result.skills, trimmed],
        categorizedSkills: {
          ...result.categorizedSkills,
          other: [...result.categorizedSkills.other, trimmed],
        },
      });
    }
    setCustomSkillInput('');
  };

  const handleSynthesizeBio = () => {
    if (!result) return;
    const title = inferCandidateTitle(result.rawTextPreview || '');
    const yearsExp = inferYearsOfExperience(result.rawTextPreview || '');
    const topSkills = selectedSkills.slice(0, 5).join(', ');
    const expPrefix = yearsExp ? ` with ${yearsExp}` : '';

    const synth = selectedSkills.length > 0
      ? `Accomplished ${title}${expPrefix} specializing in ${topSkills}. Proven track record designing resilient systems, architecting scalable applications, and delivering high-impact technical solutions.`
      : `Dedicated ${title} with a passion for software development, robust system design, and continuous technical growth.`;

    setReviewedSummary(synth);
  };

  const handleApply = () => {
    onApply({
      skills: selectedSkills,
      summary: reviewedSummary,
      mergeSkills,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Extract Skills & Summary from Resume
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                100% private, local processing — zero external APIs or costs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!result ? (
            /* Input Step */
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl">
                {storedResume && (
                  <button
                    type="button"
                    onClick={() => setActiveSource('stored')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      activeSource === 'stored'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Stored Resume</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveSource('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeSource === 'upload'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSource('paste')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeSource === 'paste'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste Text</span>
                </button>
              </div>

              {/* Source View: Stored */}
              {activeSource === 'stored' && storedResume && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">
                        {storedResume.name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {storedResume.sizeBytes
                          ? `${(storedResume.sizeBytes / 1024).toFixed(1)} KB`
                          : 'Local Document'}{' '}
                        · Stored in ApplyKit
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStoredResumeExtract}
                    disabled={isProcessing}
                    className="w-full py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting Skills & Summary...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extract From Stored Resume</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Source View: Upload */}
              {activeSource === 'upload' && (
                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl p-8 text-center space-y-3 transition-colors bg-zinc-50/30 dark:bg-zinc-900/20">
                  <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Upload Resume File
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Supports .pdf, .txt, .md, or .docx
                    </p>
                  </div>

                  <label className="inline-block">
                    <span className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.txt,.md,.docx,text/plain,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Source View: Paste */}
              {activeSource === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Paste Resume Text
                    </label>
                    <span className="text-[11px] text-zinc-400">
                      {pastedText.length} characters
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the full text of your resume here (Summary, Skills, Work Experience)..."
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-sans placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-500 focus:outline-hidden resize-y"
                  />

                  <button
                    type="button"
                    onClick={() => handleExtractFromText(pastedText)}
                    disabled={isProcessing || pastedText.trim().length < 40}
                    className="w-full py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Text...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extract Skills & Summary</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          ) : (
            /* Results Step */
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Found <strong>{selectedSkills.length} skills</strong> and a tailored professional summary.
                  </span>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-[11px] underline hover:text-emerald-950 dark:hover:text-emerald-100 cursor-pointer"
                >
                  Start Over
                </button>
              </div>

              {/* Skills Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-zinc-900 dark:text-white">
                      Extracted Skills ({selectedSkills.length}/{result.skills.length})
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSkills(result.skills)}
                      className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSkills([])}
                      className="text-zinc-500 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-0.5 rounded-full font-medium shrink-0 transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-brand-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    All ({result.skills.length})
                  </button>

                  {Object.entries(result.categorizedSkills).map(([catKey, catSkills]) => {
                    if (!catSkills || catSkills.length === 0) return null;
                    const isCatActive = selectedCategory === catKey;
                    const catLabel = CATEGORY_LABELS[catKey] || catKey;
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setSelectedCategory(catKey)}
                        className={`px-2.5 py-0.5 rounded-full font-medium shrink-0 transition-colors cursor-pointer ${
                          isCatActive
                            ? 'bg-brand-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {catLabel} ({catSkills.length})
                      </button>
                    );
                  })}
                </div>

                {/* Skill Pills Box */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 max-h-44 overflow-y-auto flex flex-wrap gap-1.5">
                  {result.skills.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">No skills detected.</span>
                  ) : (
                    (selectedCategory === 'all'
                      ? result.skills
                      : result.categorizedSkills[
                          selectedCategory as keyof typeof result.categorizedSkills
                        ] || []
                    ).map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-brand-500 text-white shadow-xs'
                              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{skill}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Add Custom Skill Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    placeholder="Add custom skill (e.g. Solidity, Tailwind CSS, PyTorch)..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    disabled={!customSkillInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Summary Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900 dark:text-white">
                    Extracted Professional Summary
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSynthesizeBio}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Synthesize an executive summary from top skills"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Synthesize Bio</span>
                    </button>
                    <span className="text-[11px] text-zinc-400">
                      {reviewedSummary.length} characters
                    </span>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={reviewedSummary}
                  onChange={(e) => setReviewedSummary(e.target.value)}
                  placeholder="Review or edit your professional summary..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-hidden resize-y"
                />
              </div>

              {/* Merge vs Replace Toggle */}
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Merge with existing skills ({existingSkills.length})
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {mergeSkills
                      ? 'Keep current skills and append newly selected skills without duplicates.'
                      : 'Replace current skills entirely with the selected list.'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeSkills}
                    onChange={(e) => setMergeSkills(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-surface-850/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          {result && (
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span>Apply to Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
