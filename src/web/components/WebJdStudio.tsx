import React, { useState } from 'react';
import {
  Check,
  Plus,
  Copy,
  Cpu,
  Lightbulb,
  Wand2,
  Download,
  Send,
  FileText,
} from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { extractJobRequirements, ExtractedJobRequirements } from '../../analyzer/keyword-extractor';
import { analyzeResumeMatch, ResumeMatchReport } from '../../analyzer/resume-matcher';
import { generateTailoredProfile, TailoredProfileResult } from '../../analyzer/tailor-engine';
import { copyTextToClipboard } from '../../utils/clipboard';

interface WebJdStudioProps {
  profile: UserProfile;
  onAddSkill: (skill: string) => Promise<void>;
}

export const WebJdStudio: React.FC<WebJdStudioProps> = ({
  profile,
  onAddSkill,
}) => {
  const [jdText, setJdText] = useState(`We are seeking an experienced Senior Full-Stack Engineer to lead the architecture and development of our web applications and distributed cloud services.

Key Requirements:
- 5+ years of experience with TypeScript and modern JavaScript (ES6+).
- Deep expertise in React, Next.js, and state management.
- Proficiency in Node.js backend services and PostgreSQL database design.
- Experience with Docker containerization and CI/CD pipelines.
- Familiarity with AWS cloud services (S3, Lambda, EC2).

Nice to Have:
- Experience with GraphQL and Apollo Client.
- Knowledge of Kubernetes and microservices architecture.
- Contributions to open-source software on GitHub.`);

  const [jobReqs, setJobReqs] = useState<ExtractedJobRequirements | null>(() => extractJobRequirements(jdText));
  const [matchReport, setMatchReport] = useState<ResumeMatchReport | null>(() => jobReqs ? analyzeResumeMatch(profile, jobReqs) : null);
  const [tailoredResult, setTailoredResult] = useState<TailoredProfileResult | null>(() => (jobReqs && matchReport) ? generateTailoredProfile(profile, jobReqs, matchReport) : null);
  const [activeTone, setActiveTone] = useState<'impact' | 'specialist' | 'adaptable'>('impact');
  const [activeCoverLetter, setActiveCoverLetter] = useState<'standard' | 'short'>('standard');
  const [activeOutreach, setActiveOutreach] = useState<'inmail' | 'email' | 'pitch'>('inmail');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleDownloadCoverLetter = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAnalyze = () => {
    if (!jdText.trim()) return;
    const reqs = extractJobRequirements(jdText);
    const rep = analyzeResumeMatch(profile, reqs);
    const tail = generateTailoredProfile(profile, reqs, rep);

    setJobReqs(reqs);
    setMatchReport(rep);
    setTailoredResult(tail);
  };

  const handleCopy = async (text: string, section: string) => {
    await copyTextToClipboard(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-500" />
          <span>ATS Resume Studio & Role Tailor</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Paste any job description to evaluate your resume match, surface missing ATS keywords, and synthesize tailored professional summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Description Input */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Job Description Input</span>
            <span className="text-zinc-400 font-mono text-[10px]">{jdText.length} chars</span>
          </div>

          <textarea
            rows={14}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste complete job description requirements, responsibilities, and qualifications..."
            className="w-full p-3 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />

          <button
            onClick={handleAnalyze}
            className="w-full py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-brand-600/30 transition-all subtle-interactive"
          >
            <Wand2 className="w-4 h-4" />
            <span>Analyze & Generate Tailored Profile</span>
          </button>
        </div>

        {/* Right Column: Analysis & Tailoring Results */}
        <div className="lg:col-span-7 space-y-4">
          {jobReqs && matchReport && tailoredResult ? (
            <>
              {/* Role Header Banner */}
              <div className="p-4 rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-transparent dark:border-brand-500/30 dark:from-brand-950/40 dark:via-zinc-900/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {jobReqs.jobTitle}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-brand-500/20 text-brand-700 dark:text-brand-300">
                      {jobReqs.seniority}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {matchReport.matchedSkills.length} matching skills · {matchReport.missingSkills.length} missing keywords
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {matchReport.matchPercentage}%
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    ATS Match Score
                  </span>
                </div>
              </div>

              {/* Skills Analysis Pill Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Matched */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Matched Skills ({matchReport.matchedSkills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {matchReport.matchedSkills.map((s) => (
                      <span key={s.canonical} className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        {s.canonical}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Missing Skills ({matchReport.missingSkills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {matchReport.missingSkills.map((s) => (
                      <button
                        key={s.canonical}
                        onClick={() => onAddSkill(s.canonical)}
                        title="Click to add to your profile"
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1 transition-colors"
                      >
                        <span>{s.canonical}</span>
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Advice */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-2 text-xs">
                <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>ATS Resume Optimization Advice</span>
                </span>
                <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                  {matchReport.suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-brand-500">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tailored Professional Summary Generator */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Tailored Professional Summary
                  </span>
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setActiveTone('impact')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                        activeTone === 'impact' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Impact-Driven
                    </button>
                    <button
                      onClick={() => setActiveTone('specialist')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                        activeTone === 'specialist' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Core Specialist
                    </button>
                    <button
                      onClick={() => setActiveTone('adaptable')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                        activeTone === 'adaptable' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Adaptable
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {tailoredResult.tailoredSummaries[activeTone]}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {tailoredResult.tailoredSummaries[activeTone].length} characters
                  </span>
                  <button
                    onClick={() => handleCopy(tailoredResult.tailoredSummaries[activeTone], 'summary')}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'summary' ? 'Copied to Clipboard' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>

              {/* Tailored Cover Letter Studio */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span>Tailored Cover Letter</span>
                  </span>
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setActiveCoverLetter('standard')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        activeCoverLetter === 'standard' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Standard (3-Paragraph)
                    </button>
                    <button
                      onClick={() => setActiveCoverLetter('short')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        activeCoverLetter === 'short' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Modern Pitch
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {tailoredResult.coverLetters?.[activeCoverLetter]}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {tailoredResult.coverLetters?.[activeCoverLetter]?.split(/\s+/).filter(Boolean).length || 0} words ·{' '}
                    {tailoredResult.coverLetters?.[activeCoverLetter]?.length || 0} chars
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleDownloadCoverLetter(
                          tailoredResult.coverLetters?.[activeCoverLetter] || '',
                          `cover-letter-${jobReqs.jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download as Markdown file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>
                    <button
                      onClick={() => handleCopy(tailoredResult.coverLetters?.[activeCoverLetter] || '', 'coverLetter')}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      {copiedSection === 'coverLetter' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'coverLetter' ? 'Copied' : 'Copy Cover Letter'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cold Outreach Hub */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-brand-500" />
                    <span>Cold Outreach & Recruiter DM Hub</span>
                  </span>
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setActiveOutreach('inmail')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        activeOutreach === 'inmail' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      LinkedIn InMail
                    </button>
                    <button
                      onClick={() => setActiveOutreach('email')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        activeOutreach === 'email' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Cold Email
                    </button>
                    <button
                      onClick={() => setActiveOutreach('pitch')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        activeOutreach === 'pitch' ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-zinc-500'
                      }`}
                    >
                      Quick DM
                    </button>
                  </div>
                </div>

                {activeOutreach === 'inmail' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                      {tailoredResult.coldOutreach?.recruiterInMail}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {tailoredResult.coldOutreach?.recruiterInMail?.split(/\s+/).filter(Boolean).length || 0} words
                      </span>
                      <button
                        onClick={() => handleCopy(tailoredResult.coldOutreach?.recruiterInMail || '', 'inmail')}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedSection === 'inmail' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSection === 'inmail' ? 'Copied' : 'Copy InMail Message'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeOutreach === 'email' && (
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        High-Open-Rate Subject Line:
                      </span>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                        <span className="font-medium text-zinc-900 dark:text-white">
                          {tailoredResult.coldOutreach?.hiringManagerEmail?.subject}
                        </span>
                        <button
                          onClick={() => handleCopy(tailoredResult.coldOutreach?.hiringManagerEmail?.subject || '', 'subject')}
                          className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer ml-2"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Subject</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                        Email Body:
                      </span>
                      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {tailoredResult.coldOutreach?.hiringManagerEmail?.body}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          handleCopy(
                            `Subject: ${tailoredResult.coldOutreach?.hiringManagerEmail?.subject}\n\n${tailoredResult.coldOutreach?.hiringManagerEmail?.body}`,
                            'fullEmail'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedSection === 'fullEmail' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSection === 'fullEmail' ? 'Copied' : 'Copy Subject + Body'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeOutreach === 'pitch' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                      {tailoredResult.coldOutreach?.elevatorPitch}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {tailoredResult.coldOutreach?.elevatorPitch?.length || 0} characters
                      </span>
                      <button
                        onClick={() => handleCopy(tailoredResult.coldOutreach?.elevatorPitch || '', 'pitch')}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedSection === 'pitch' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSection === 'pitch' ? 'Copied' : 'Copy Pitch'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-xs italic">
              Paste a job description and click "Analyze & Generate Tailored Profile" to see ATS breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
