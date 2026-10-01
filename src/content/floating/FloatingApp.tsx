import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FloatingPill } from './FloatingPill';
import { FloatingHeader } from './FloatingHeader';
import { FloatingAutofillTab } from './FloatingAutofillTab';
import { FloatingQuickCopyTab } from './FloatingQuickCopyTab';
import { FloatingTailorTab } from './FloatingTailorTab';
import { FloatingTrackerTab } from './FloatingTrackerTab';
import { profileStore } from '../../storage/profile-store';
import { UserProfile } from '../../types/profile';
import { DetectionSummary, AutofillResult } from '../../types/detection';
import { getActiveAdapter } from '../adapters/adapter-registry';
import { extractJobDescriptionFromPage } from '../job-parser';
import { extractJobRequirements, ExtractedJobRequirements } from '../../analyzer/keyword-extractor';
import { analyzeResumeMatch, ResumeMatchReport } from '../../analyzer/resume-matcher';
import { generateTailoredProfile, TailoredProfileResult } from '../../analyzer/tailor-engine';
import { safeCssEscape } from '../../utils/dom-helpers';
import { Zap, Copy, Target, Cloud, Check } from 'lucide-react';

type FloatingTabKey = 'autofill' | 'quickcopy' | 'tailor' | 'tracker';

export const FloatingApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FloatingTabKey>('autofill');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [detection, setDetection] = useState<DetectionSummary | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Position & Dragging
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 435) : 800;
    const defaultY = 32;
    return { x: defaultX, y: defaultY };
  });
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Job Description & Tailoring State
  const [jobReqs, setJobReqs] = useState<ExtractedJobRequirements | null>(null);
  const [matchReport, setMatchReport] = useState<ResumeMatchReport | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoredProfileResult | null>(null);

  // Page metadata
  const [pageMeta, setPageMeta] = useState<{ company: string; role: string; url: string }>({
    company: '',
    role: '',
    url: '',
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 1800);
  }, []);

  // Parse page metadata
  const extractPageMetadata = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = window.location.href;
      const host = window.location.hostname.replace(/^www\./, '');
      const parts = host.split('.');
      let comp = parts[0];
      if (['jobs', 'careers', 'boards'].includes(comp) && parts[1]) {
        comp = parts[1];
      }
      comp = comp.charAt(0).toUpperCase() + comp.slice(1);
      const title = document.title ? document.title.split(/[-–|]/)[0].trim() : 'Software Engineer';
      setPageMeta({ company: comp, role: title, url });
    } catch {}
  }, []);

  // Scan fields on current page
  const scanPage = useCallback(
    (currentProfile?: UserProfile | null) => {
      const prof = currentProfile !== undefined ? currentProfile : profile;
      if (!prof) return;

      setIsScanning(true);
      try {
        const adapter = getActiveAdapter();
        const summary = adapter.detectFields(prof);
        setDetection(summary);

        // Also extract job description if present
        const jd = extractJobDescriptionFromPage();
        if (jd && jd.found && jd.descriptionText.length > 40) {
          const reqs = extractJobRequirements(jd.descriptionText, jd.jobTitle);
          const report = analyzeResumeMatch(prof, reqs);
          const tailored = generateTailoredProfile(prof, reqs, report);
          setJobReqs(reqs);
          setMatchReport(report);
          setTailoredResult(tailored);
        }
      } catch (err) {
        console.error('[ApplyKit Floating] Error scanning page:', err);
      } finally {
        setIsScanning(false);
      }
    },
    [profile]
  );

  // Initial load & subscribe to profileStore
  useEffect(() => {
    async function init() {
      const p = await profileStore.get();
      setProfile(p);
      extractPageMetadata();
      scanPage(p);
    }
    init();

    const unsubscribe = profileStore.subscribe((updated) => {
      setProfile(updated);
      scanPage(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Toggle & open listeners (both local shortcut and chrome message)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Alt+A or Option+A or Ctrl+Shift+A
      if (
        (e.altKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA'))
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    // Custom window event for internal dispatch
    const handleToggleEvent = () => setIsOpen((prev) => !prev);
    const handleOpenEvent = () => setIsOpen(true);
    const handleCloseEvent = () => setIsOpen(false);

    window.addEventListener('applykit:toggle-floating', handleToggleEvent);
    window.addEventListener('applykit:open-floating', handleOpenEvent);
    window.addEventListener('applykit:close-floating', handleCloseEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('applykit:toggle-floating', handleToggleEvent);
      window.removeEventListener('applykit:open-floating', handleOpenEvent);
      window.removeEventListener('applykit:close-floating', handleCloseEvent);
    };
  }, [isOpen]);

  // Window drag handling
  const handleDragStart = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 425, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, e.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResetPosition = () => {
    const defaultX = Math.max(20, window.innerWidth - 435);
    const defaultY = 32;
    setPosition({ x: defaultX, y: defaultY });
  };

  // Autofill handlers
  const handleAutofillAll = async (forceOverwrite: boolean): Promise<AutofillResult[]> => {
    if (!profile || !detection) return [];
    const adapter = getActiveAdapter();
    const fieldIds = detection.detectedFields.map((f) => f.id);

    try {
      const results = await adapter.autofill(
        fieldIds,
        detection.detectedFields,
        profile,
        forceOverwrite
      );
      const filledCount = results.filter((r) => r.status === 'filled').length;
      showToast(`Autofilled ${filledCount} field${filledCount !== 1 ? 's' : ''}!`);
      scanPage(profile);
      return results;
    } catch (err) {
      console.error('Autofill failed:', err);
      showToast('Autofill encountered an error');
      return [];
    }
  };

  const handleAutofillSingle = async (fieldId: string, forceOverwrite: boolean): Promise<void> => {
    if (!profile || !detection) return;
    const adapter = getActiveAdapter();
    await adapter.autofill([fieldId], detection.detectedFields, profile, forceOverwrite);
    scanPage(profile);
  };

  const handleHighlightField = (fieldId: string, highlight: boolean) => {
    try {
      const el = document.querySelector<HTMLElement>(`[data-applykit-id="${safeCssEscape(fieldId)}"]`);
      if (el) {
        if (highlight) {
          el.style.outline = '2px solid #6366f1';
          el.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.5)';
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      }
    } catch {}
  };

  // Clipboard copy handler
  const handleCopy = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(`Copied ${label}!`);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast(`Failed to copy ${label}`);
    }
  };

  const fieldCount = detection?.detectedFields.length || 0;

  return (
    <div className="ak-floating-container">
      {/* Floating Pill Launcher (when minimized/closed) */}
      {!isOpen && (
        <FloatingPill
          fieldCount={fieldCount}
          onOpen={() => {
            setIsOpen(true);
            scanPage();
          }}
        />
      )}

      {/* Floating Window Panel */}
      {isOpen && (
        <div
          className="ak-window-panel"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          {/* Draggable Header */}
          <FloatingHeader
            profile={profile}
            onDragStart={handleDragStart}
            onMinimize={() => setIsOpen(false)}
            onResetPosition={handleResetPosition}
            onClose={() => setIsOpen(false)}
          />

          {/* Nav Tabs */}
          <div className="ak-nav-tabs">
            <button
              className={`ak-tab-btn ${activeTab === 'autofill' ? 'active' : ''}`}
              onClick={() => setActiveTab('autofill')}
            >
              <Zap size={12} />
              <span>Autofill {fieldCount > 0 ? `(${fieldCount})` : ''}</span>
            </button>

            <button
              className={`ak-tab-btn ${activeTab === 'quickcopy' ? 'active' : ''}`}
              onClick={() => setActiveTab('quickcopy')}
            >
              <Copy size={12} />
              <span>Quick Copy</span>
            </button>

            <button
              className={`ak-tab-btn ${activeTab === 'tailor' ? 'active' : ''}`}
              onClick={() => setActiveTab('tailor')}
            >
              <Target size={12} />
              <span>ATS Tailor</span>
            </button>

            <button
              className={`ak-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracker')}
            >
              <Cloud size={12} />
              <span>Tracker</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="ak-body">
            {activeTab === 'autofill' && (
              <FloatingAutofillTab
                detection={detection}
                profile={profile}
                isScanning={isScanning}
                onRescan={() => scanPage(profile)}
                onAutofillAll={handleAutofillAll}
                onAutofillSingle={handleAutofillSingle}
                onHighlightField={handleHighlightField}
                showToast={showToast}
              />
            )}

            {activeTab === 'quickcopy' && (
              <FloatingQuickCopyTab profile={profile} onCopy={handleCopy} />
            )}

            {activeTab === 'tailor' && (
              <FloatingTailorTab
                jobReqs={jobReqs}
                matchReport={matchReport}
                tailoredResult={tailoredResult}
                onCopy={handleCopy}
              />
            )}

            {activeTab === 'tracker' && (
              <FloatingTrackerTab
                company={pageMeta.company}
                role={pageMeta.role}
                url={pageMeta.url}
                matchedSkills={matchReport?.matchedSkills?.map((s) => s.canonical)}
                tailoredSummary={tailoredResult?.tailoredSummaries.impact}
                showToast={showToast}
              />
            )}
          </div>

          {/* Footer Bar */}
          <div className="ak-footer">
            <span>Shortcut: Alt+A to toggle</span>
            <span
              className="ak-footer-link"
              onClick={() => window.open('http://localhost:5173/options.html', '_blank')}
            >
              Edit Profile
            </span>
          </div>

          {/* In-Window Toast */}
          {toastMessage && (
            <div className="ak-toast">
              <Check size={13} style={{ color: '#34d399' }} />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
