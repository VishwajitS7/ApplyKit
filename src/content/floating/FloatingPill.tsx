import React from 'react';
import { Zap } from 'lucide-react';

interface FloatingPillProps {
  fieldCount: number;
  onOpen: () => void;
}

export const FloatingPill: React.FC<FloatingPillProps> = ({ fieldCount, onOpen }) => {
  return (
    <div
      className="ak-launcher-pill"
      onClick={onOpen}
      title="Open ApplyKit Autofill Window (Alt+A)"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpen();
        }
      }}
    >
      <div className="ak-pill-icon">
        <Zap size={13} fill="currentColor" />
      </div>

      <div className="ak-pill-badge">
        <span>ApplyKit</span>
        {fieldCount > 0 && (
          <>
            <span className="ak-pulse-dot" />
            <span style={{ color: '#34d399', fontWeight: 700 }}>{fieldCount}</span>
          </>
        )}
      </div>

      <span className="ak-pill-shortcut">Alt+A</span>
    </div>
  );
};
