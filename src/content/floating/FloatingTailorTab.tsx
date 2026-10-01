import React, { useState } from 'react';
import { Target, Sparkles, Copy, Check } from 'lucide-react';
import { ResumeMatchReport } from '../../analyzer/resume-matcher';
import { TailoredProfileResult } from '../../analyzer/tailor-engine';
import { ExtractedJobRequirements } from '../../analyzer/keyword-extractor';

interface FloatingTailorTabProps {
  jobReqs: ExtractedJobRequirements | null;
  matchReport: ResumeMatchReport | null;
  tailoredResult: TailoredProfileResult | null;
  onCopy: (text: string, label: string) => void;
}

export const FloatingTailorTab: React.FC<FloatingTailorTabProps> = ({
  jobReqs,
  matchReport,
  tailoredResult,
  onCopy,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string, label: string) => {
    onCopy(text, label);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  if (!matchReport || !jobReqs) {
    return (
      <div className="ak-card" style={{ textAlign: 'center', padding: '24px 16px' }}>
        <Target size={28} style={{ color: '#71717a', margin: '0 auto 8px auto' }} />
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#e4e4e7', marginBottom: '4px' }}>
          No Job Description Detected
        </div>
        <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
          ApplyKit automatically parses job postings on pages like Greenhouse, Lever, Ashby, LinkedIn, or test-form.html.
        </div>
      </div>
    );
  }

  const score = matchReport.matchPercentage;
  const scoreColor = score >= 75 ? '#34d399' : score >= 50 ? '#818cf8' : '#fbbf24';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Match Score Card */}
      <div className="ak-card ak-card-highlight">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
              ATS Compatibility Match
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              {jobReqs.jobTitle || 'Target Position'}
            </div>
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: scoreColor,
              display: 'flex',
              alignItems: 'baseline',
              gap: '2px',
            }}
          >
            {score}
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#a1a1aa' }}>%</span>
          </div>
        </div>

        {/* Skills Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
          <div style={{ fontSize: '10px', color: '#71717a', fontWeight: 600 }}>MATCHED SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {matchReport.matchedSkills.slice(0, 8).map((skill) => (
              <span key={skill.canonical} className="ak-badge ak-badge-green">
                ✓ {skill.canonical}
              </span>
            ))}
            {matchReport.matchedSkills.length === 0 && (
              <span style={{ fontSize: '10px', color: '#71717a' }}>No direct keyword matches</span>
            )}
          </div>

          {matchReport.missingSkills.length > 0 && (
            <>
              <div style={{ fontSize: '10px', color: '#71717a', fontWeight: 600, marginTop: '4px' }}>
                MISSING KEYWORDS (RECOMMENDED TO ADD)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {matchReport.missingSkills.slice(0, 6).map((skill) => (
                  <span key={skill.canonical} className="ak-badge ak-badge-amber">
                    + {skill.canonical}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tailored Summary */}
      {tailoredResult?.tailoredSummaries?.impact && (
        <div className="ak-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#a5b4fc' }}>
              <Sparkles size={12} />
              <span>Tailored Summary</span>
            </div>
            <button
              className="ak-btn-secondary"
              style={{ padding: '3px 8px', fontSize: '10px' }}
              onClick={() => handleCopyText(tailoredResult.tailoredSummaries.impact, 'summary', 'Tailored Summary')}
            >
              {copiedKey === 'summary' ? <Check size={11} style={{ color: '#34d399' }} /> : <Copy size={11} />}
              <span>{copiedKey === 'summary' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#d4d4d8', lineHeight: 1.45 }}>
            {tailoredResult.tailoredSummaries.impact}
          </div>
        </div>
      )}

      {/* Prioritized Role Tech Stack */}
      {tailoredResult?.prioritizedSkills && tailoredResult.prioritizedSkills.length > 0 && (
        <div className="ak-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f4f4f5' }}>
              Prioritized Tech Stack for Role
            </span>
            <button
              className="ak-btn-secondary"
              style={{ padding: '3px 8px', fontSize: '10px' }}
              onClick={() =>
                handleCopyText(tailoredResult.prioritizedSkills.join(', '), 'all-skills', 'Prioritized Skills')
              }
            >
              {copiedKey === 'all-skills' ? <Check size={11} style={{ color: '#34d399' }} /> : <Copy size={11} />}
              <span>{copiedKey === 'all-skills' ? 'Copied All' : 'Copy All'}</span>
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tailoredResult.prioritizedSkills.slice(0, 10).map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: '10px',
                  color: '#a5b4fc',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
