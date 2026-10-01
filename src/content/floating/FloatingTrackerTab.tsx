import React, { useState } from 'react';
import { Cloud, CheckCircle2, ExternalLink, Plus } from 'lucide-react';
import { syncManager } from '../../cloud/sync-manager';
import { JobApplication } from '../../cloud/sync-types';

interface FloatingTrackerTabProps {
  company: string;
  role: string;
  url: string;
  matchedSkills?: string[];
  tailoredSummary?: string;
  showToast: (msg: string) => void;
}

export const FloatingTrackerTab: React.FC<FloatingTrackerTabProps> = ({
  company: initialCompany,
  role: initialRole,
  url,
  matchedSkills,
  tailoredSummary,
  showToast,
}) => {
  const [company, setCompany] = useState(initialCompany || 'Target Company');
  const [role, setRole] = useState(initialRole || 'Software Engineer');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        company: company.trim() || 'Target Company',
        role: role.trim() || 'Software Engineer',
        url: url || (typeof window !== 'undefined' ? window.location.href : ''),
        status: 'applied',
        appliedDate: new Date().toISOString(),
        notes: 'Autofilled and submitted via ApplyKit In-Page Window.',
        matchedSkills: matchedSkills || [],
        tailoredSummary: tailoredSummary || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await syncManager.saveApplication(newApp);
      setIsSaved(true);
      showToast('Application logged to Cloud Tracker!');
    } catch (err) {
      console.error('Failed to log application:', err);
      showToast('Failed to log application');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDashboard = () => {
    window.open('http://localhost:5173/', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="ak-card ak-card-highlight">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Cloud size={16} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            ApplyKit Cloud Application Tracker
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#a1a1aa', lineHeight: 1.4 }}>
          Log this job application directly into your Kanban board and tracking metrics on the unified dashboard.
        </p>
      </div>

      {isSaved ? (
        <div
          className="ak-card"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#34d399' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>
              Logged to Tracker as Applied!
            </span>
          </div>
          <button className="ak-btn-secondary" onClick={handleOpenDashboard} style={{ fontSize: '11px' }}>
            <span>View Dashboard</span>
            <ExternalLink size={11} />
          </button>
        </div>
      ) : (
        <div className="ak-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#a1a1aa', fontWeight: 600, marginBottom: '4px' }}>
              COMPANY NAME
            </label>
            <input
              type="text"
              className="ak-search-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', color: '#a1a1aa', fontWeight: 600, marginBottom: '4px' }}>
              POSITION / ROLE
            </label>
            <input
              type="text"
              className="ak-search-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span style={{ fontSize: '10px', color: '#71717a' }}>Status: Applied</span>
            <button
              className="ak-btn-primary"
              style={{ width: 'auto', padding: '7px 14px' }}
              onClick={handleSave}
              disabled={isSaving}
            >
              <Plus size={13} />
              <span>{isSaving ? 'Logging...' : 'Log Application'}</span>
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <button
          onClick={handleOpenDashboard}
          style={{
            background: 'none',
            border: 'none',
            color: '#818cf8',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline',
          }}
        >
          <span>Open Full Cloud Tracker Dashboard</span>
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
};
