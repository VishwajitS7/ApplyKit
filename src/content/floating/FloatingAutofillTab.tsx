import React, { useState } from 'react';
import { Zap, Check, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { DetectionSummary, AutofillResult } from '../../types/detection';
import { UserProfile } from '../../types/profile';

interface FloatingAutofillTabProps {
  detection: DetectionSummary | null;
  profile?: UserProfile | null;
  isScanning: boolean;
  onRescan: () => void;
  onAutofillAll: (forceOverwrite: boolean) => Promise<AutofillResult[]>;
  onAutofillSingle: (fieldId: string, forceOverwrite: boolean) => Promise<void>;
  onHighlightField: (fieldId: string, highlight: boolean) => void;
  showToast: (msg: string) => void;
}

export const FloatingAutofillTab: React.FC<FloatingAutofillTabProps> = ({
  detection,
  profile: _profile,
  isScanning,
  onRescan,
  onAutofillAll,
  onAutofillSingle,
  onHighlightField,
  showToast,
}) => {
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [filledFieldIds, setFilledFieldIds] = useState<Set<string>>(new Set());

  const fields = detection?.detectedFields || [];
  const fieldCount = fields.length;

  const handleFillAll = async () => {
    if (fieldCount === 0) return;
    setIsFilling(true);
    try {
      const results = await onAutofillAll(forceOverwrite);
      const newlyFilled = results.filter((r) => r.status === 'filled').map((r) => r.fieldId);
      setFilledFieldIds(new Set(newlyFilled));
    } finally {
      setIsFilling(false);
    }
  };

  const handleFillOne = async (fieldId: string) => {
    try {
      await onAutofillSingle(fieldId, forceOverwrite);
      setFilledFieldIds((prev) => new Set([...prev, fieldId]));
      showToast('Field autofilled!');
    } catch {
      showToast('Failed to fill field');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Overview Card */}
      <div className="ak-card ak-card-highlight">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
              {fieldCount > 0 ? `${fieldCount} Application Fields Detected` : 'No Application Form Detected'}
            </div>
            <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
              {fieldCount > 0
                ? `${detection?.highConfidenceCount || 0} high confidence matches ready to fill`
                : 'Navigate to any job application or test-form.html'}
            </div>
          </div>
          <button
            className="ak-btn-secondary"
            onClick={onRescan}
            disabled={isScanning}
            title="Rescan Page"
            style={{ padding: '5px 8px' }}
          >
            <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
          </button>
        </div>

        {fieldCount > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 10px 0' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#d4d4d8',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={forceOverwrite}
                  onChange={(e) => setForceOverwrite(e.target.checked)}
                  style={{ accentColor: '#6366f1' }}
                />
                <span>Overwrite non-empty inputs</span>
              </label>
            </div>

            <button
              className="ak-btn-primary"
              onClick={handleFillAll}
              disabled={isFilling || fieldCount === 0}
            >
              <Zap size={14} fill="currentColor" />
              <span>{isFilling ? 'Filling form fields...' : `Autofill All ${fieldCount} Fields (1-Click)`}</span>
            </button>
          </>
        )}
      </div>

      {/* Field Checklist */}
      {fieldCount > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Detected Form Fields ({fieldCount})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '310px', overflowY: 'auto' }}>
            {fields.map((field) => {
              const isFilled = filledFieldIds.has(field.id);
              const confidenceClass =
                field.confidence >= 0.85
                  ? 'ak-badge-green'
                  : field.confidence >= 0.65
                  ? 'ak-badge-blue'
                  : 'ak-badge-amber';

              return (
                <div
                  key={field.id}
                  className="ak-field-item"
                  onMouseEnter={() => onHighlightField(field.id, true)}
                  onMouseLeave={() => onHighlightField(field.id, false)}
                >
                  <div className="ak-field-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="ak-field-label">{field.label || field.type}</span>
                      <span className={`ak-badge ${confidenceClass}`}>
                        {Math.round(field.confidence * 100)}%
                      </span>
                    </div>
                    <span className="ak-field-value">
                      {field.matchedValue ? String(field.matchedValue) : <em style={{ color: '#71717a' }}>Empty in profile</em>}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="ak-btn-secondary"
                      style={{ padding: '4px 7px', fontSize: '10px' }}
                      title="Inspect field on page"
                      onClick={() => onHighlightField(field.id, true)}
                    >
                      <Eye size={11} />
                    </button>

                    <button
                      className="ak-btn-secondary"
                      style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        background: isFilled ? 'rgba(16, 185, 129, 0.2)' : undefined,
                        borderColor: isFilled ? 'rgba(16, 185, 129, 0.4)' : undefined,
                        color: isFilled ? '#34d399' : undefined,
                      }}
                      onClick={() => handleFillOne(field.id)}
                    >
                      {isFilled ? <Check size={11} /> : 'Fill'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="ak-card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <AlertCircle size={28} style={{ color: '#71717a', margin: '0 auto 8px auto' }} />
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#e4e4e7', marginBottom: '4px' }}>
            No Form Inputs Found
          </div>
          <div style={{ fontSize: '11px', color: '#a1a1aa', maxWidth: '280px', margin: '0 auto' }}>
            ApplyKit scans for job application fields (Name, Email, Phone, Resume, Experience, URLs). Open an application form or click Rescan.
          </div>
        </div>
      )}
    </div>
  );
};
