import React from 'react';
import { Zap, Minus, X, Settings, RotateCcw } from 'lucide-react';
import { UserProfile } from '../../types/profile';

interface FloatingHeaderProps {
  profile: UserProfile | null;
  onDragStart: (e: React.MouseEvent) => void;
  onMinimize: () => void;
  onResetPosition: () => void;
  onClose: () => void;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  profile,
  onDragStart,
  onMinimize,
  onResetPosition,
  onClose,
}) => {
  const candidateName = profile?.personal.fullName || 'Candidate';
  const activePersona = (profile?.personas || []).find((p) => p.id === profile?.activePersonaId);
  const personaLabel = activePersona?.name || 'Default';

  const handleOpenOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('http://localhost:5173/options.html', '_blank');
    }
  };

  const handleOpenPersonas = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html#personas') });
    } else {
      window.open('http://localhost:5173/options.html#personas', '_blank');
    }
  };

  return (
    <div className="ak-header" onMouseDown={onDragStart}>
      <div className="ak-header-left">
        <div className="ak-logo-badge">
          <Zap size={15} fill="currentColor" />
        </div>
        <div className="ak-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ak-title">ApplyKit</span>
            <span
              onClick={handleOpenPersonas}
              title="Click to manage Work Personas"
              style={{
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {personaLabel}
            </span>
          </div>
          <span className="ak-subtitle">{candidateName}</span>
        </div>
      </div>

      <div className="ak-controls" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="ak-control-btn"
          title="Open Profile Settings"
          onClick={handleOpenOptions}
        >
          <Settings size={14} />
        </button>

        <button
          className="ak-control-btn"
          title="Reset Window Position to Corner"
          onClick={onResetPosition}
        >
          <RotateCcw size={13} />
        </button>

        <button
          className="ak-control-btn"
          title="Minimize Window (Alt+A)"
          onClick={onMinimize}
        >
          <Minus size={14} />
        </button>

        <button
          className="ak-control-btn close"
          title="Close Window (Esc)"
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
