import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { QuickCopyGrid } from '../components/QuickCopyGrid';
import { DetectionCard } from '../components/DetectionCard';
import { PreviewModal } from '../components/PreviewModal';
import { Completeness } from '../components/Completeness';
import { Onboarding } from '../components/Onboarding';
import { Toast } from '../components/Toast';
import { JobTailorCard } from '../components/JobTailorCard';
import { JobTailorModal } from '../components/JobTailorModal';
import { LogApplicationBanner } from '../components/LogApplicationBanner';
import { profileStore } from '../../storage/profile-store';
import { UserProfile, CompletenessResult, getEffectiveProfile } from '../../types/profile';
import { DetectionSummary, AutofillResult } from '../../types/detection';
import { ExtensionMessage } from '../../types/messages';
import { applyTheme } from '../../utils/theme';
import { extractJobRequirements, ExtractedJobRequirements } from '../../analyzer/keyword-extractor';
import { analyzeResumeMatch, ResumeMatchReport } from '../../analyzer/resume-matcher';
import { generateTailoredProfile, TailoredProfileResult } from '../../analyzer/tailor-engine';

export const PopupApp: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [detection, setDetection] = useState<DetectionSummary | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRestrictedPage, setIsRestrictedPage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

  // Cloud Tracker Logging State
  const [showLogBanner, setShowLogBanner] = useState(false);
  const [pageMeta, setPageMeta] = useState<{ company: string; role: string; url: string }>({
    company: '',
    role: '',
    url: '',
  });

  // Job Description Tailoring States
  const [jobReqs, setJobReqs] = useState<ExtractedJobRequirements | null>(null);
  const [matchReport, setMatchReport] = useState<ResumeMatchReport | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoredProfileResult | null>(null);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 1800);
  }, []);

  // Compute tailoring data
  const processJobDescription = useCallback((text: string, title?: string, currentProfile?: UserProfile) => {
    const prof = currentProfile || profile;
    if (!prof || !text || text.trim().length < 40) return;

    try {
      const reqs = extractJobRequirements(text, title);
      const report = analyzeResumeMatch(prof, reqs);
      const tailored = generateTailoredProfile(prof, reqs, report);

      setJobReqs(reqs);
      setMatchReport(report);
      setTailoredResult(tailored);
    } catch (err) {
      console.error('[ApplyKit] Error processing job description:', err);
    }
  }, [profile]);

  // Load initial profile
  useEffect(() => {
    async function loadData() {
      const p = await profileStore.get();
      setProfile(p);
      applyTheme(p.settings.theme);
      setLoading(false);
    }
    loadData();
  }, []);

  // Scan current page for form fields AND job description
  const scanCurrentPage = useCallback(async (userProfile: UserProfile) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      // Mock detection for web dev preview
      setDetection({
        formDetected: false,
        totalInputsOnPage: 0,
        detectedFields: [],
        highConfidenceCount: 0,
        ambiguousCount: 0,
      });
      return;
    }

    try {
      setIsScanning(true);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id || !tab.url) {
        setIsRestrictedPage(true);
        setIsScanning(false);
        return;
      }

      setActiveTabId(tab.id);

      // Check for restricted URLs (chrome://, edge://, about:)
      if (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('view-source:')
      ) {
        setIsRestrictedPage(true);
        setIsScanning(false);
        return;
      }

      setIsRestrictedPage(false);

      // Extract basic page metadata for cloud tracker logging
      try {
        const parsedUrl = new URL(tab.url);
        const hostParts = parsedUrl.hostname.replace(/^www\./, '').split('.');
        let companyGuess = hostParts[0];
        if (hostParts[0] === 'jobs' || hostParts[0] === 'careers' || hostParts[0] === 'boards') {
          companyGuess = hostParts[1] || hostParts[0];
        }
        if (companyGuess) {
          companyGuess = companyGuess.charAt(0).toUpperCase() + companyGuess.slice(1);
        }
        const roleGuess = tab.title ? tab.title.split(/[-–|]/)[0].trim() : 'Software Engineer';
        setPageMeta({
          company: companyGuess || 'Target Company',
          role: roleGuess || 'Software Engineer',
          url: tab.url,
        });
      } catch {}

      // 1. Send detect fields message to content script
      const detectMsg: ExtensionMessage = {
        type: 'DETECT_FIELDS',
        payload: { profile: userProfile },
      };

      chrome.tabs.sendMessage(tab.id, detectMsg, (response) => {
        setIsScanning(false);
        if (chrome.runtime.lastError) {
          console.warn('[ApplyKit] Content script error:', chrome.runtime.lastError.message);
          if (chrome.scripting && tab.id) {
            chrome.scripting
              .executeScript({
                target: { tabId: tab.id },
                files: ['content.js'],
              })
              .then(() => {
                setTimeout(() => {
                  chrome.tabs.sendMessage(tab.id!, detectMsg, (retryRes) => {
                    if (retryRes && retryRes.success) {
                      setDetection(retryRes.data);
                    }
                  });
                }, 100);
              })
              .catch(() => {});
          }
          return;
        }

        if (response && response.success) {
          setDetection(response.data);
        }
      });

      // 2. Query JD extraction from content script
      const extractJdMsg: ExtensionMessage = {
        type: 'EXTRACT_JOB_DESCRIPTION',
      };

      chrome.tabs.sendMessage(tab.id, extractJdMsg, (jdResponse) => {
        if (jdResponse && jdResponse.success && jdResponse.data && jdResponse.data.found) {
          processJobDescription(jdResponse.data.descriptionText, jdResponse.data.jobTitle, userProfile);
        }
      });
    } catch (err) {
      console.error('[ApplyKit] Failed to scan tab:', err);
      setIsScanning(false);
    }
  }, [processJobDescription]);

  // When profile is loaded, run scan
  useEffect(() => {
    if (profile && profile.settings.hasCompletedOnboarding) {
      scanCurrentPage(profile);
    }
  }, [profile, scanCurrentPage]);

  const handleOpenSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/options.html', '_blank');
    }
  };

  const handleOpenPersonas = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      if (chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html#personas') });
      } else if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    } else {
      window.open('/options.html#personas', '_blank');
    }
  };

  const handleToggleTheme = async () => {
    if (!profile) return;
    const nextTheme = profile.settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    const updated = await profileStore.updateSection('settings', { theme: nextTheme });
    setProfile(updated);
  };

  const handleOnboardingComplete = async (patch: Partial<UserProfile>) => {
    const updated = await profileStore.update(patch);
    setProfile(updated);
    showToast('Profile created!');
    scanCurrentPage(updated);
  };

  const handleAutofillSelected = async (
    fieldIds: string[],
    forceOverwrite: boolean
  ): Promise<AutofillResult[]> => {
    if (!activeTabId || !profile) return [];

    return new Promise((resolve) => {
      const msg: ExtensionMessage = {
        type: 'AUTOFILL_FIELDS',
        payload: {
          fieldIds,
          profile,
          forceOverwrite,
        },
      };

      chrome.tabs.sendMessage(activeTabId, msg, (response) => {
        if (response && response.success) {
          const { results, filledCount } = response.data;
          showToast(`✓ Filled ${filledCount} field${filledCount !== 1 ? 's' : ''}`);
          if (filledCount > 0) {
            setShowLogBanner(true);
          }
          scanCurrentPage(profile);
          resolve(results);
        } else {
          showToast('Autofill failed');
          resolve([]);
        }
      });
    });
  };

  const handleHoverField = (fieldId: string, highlight: boolean) => {
    if (!activeTabId) return;
    const msg: ExtensionMessage = {
      type: 'HIGHLIGHT_FIELD',
      payload: { fieldId, highlight },
    };
    chrome.tabs.sendMessage(activeTabId, msg).catch(() => {});
  };

  const handleAddSkillToProfile = async (newSkill: string) => {
    if (!profile) return;
    const currentSkills = profile.professional.skills || [];
    if (!currentSkills.includes(newSkill)) {
      const updatedSkills = [...currentSkills, newSkill];
      const updated = await profileStore.update({
        professional: { ...profile.professional, skills: updatedSkills },
      });
      setProfile(updated);
      if (jobReqs) {
        const report = analyzeResumeMatch(updated, jobReqs);
        const tailored = generateTailoredProfile(updated, jobReqs, report);
        setMatchReport(report);
        setTailoredResult(tailored);
      }
      scanCurrentPage(updated);
    }
  };

  const handleApplyTailoredData = async (
    tailoredSummary: string,
    tailoredSkills: string[],
    saveAsDefault: boolean
  ) => {
    if (!profile) return;
    const updatedProfile: UserProfile = {
      ...profile,
      professional: {
        skills: tailoredSkills,
        summary: tailoredSummary,
      },
    };

    if (saveAsDefault) {
      await profileStore.update({
        professional: {
          skills: tailoredSkills,
          summary: tailoredSummary,
        },
      });
    }

    setProfile(updatedProfile);
    scanCurrentPage(updatedProfile);
  };

  const handleSelectPersona = async (personaId: string) => {
    if (!profile) return;
    const updated = await profileStore.setActivePersona(personaId);
    setProfile(updated);
    const eff = getEffectiveProfile(updated);
    const activePersona = (updated.personas || []).find((p) => p.id === personaId);
    showToast(`Switched: ${activePersona?.name || 'Active Persona'}`);
    scanCurrentPage(eff);
  };

  if (loading || !profile) {
    return (
      <div className="w-[390px] h-[550px] flex items-center justify-center bg-white dark:bg-surface-900">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading ApplyKit...</span>
        </div>
      </div>
    );
  }

  // First-time onboarding experience
  if (!profile.settings.hasCompletedOnboarding) {
    return (
      <div className="w-[390px] h-[550px] bg-white dark:bg-surface-900 flex flex-col justify-between overflow-hidden">
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toast message={toastMessage} />
      </div>
    );
  }

  const effectiveProfile = getEffectiveProfile(profile);
  const completeness: CompletenessResult = profileStore.calculateCompleteness(effectiveProfile);

  return (
    <div className="w-[390px] min-h-[550px] max-h-[600px] bg-white dark:bg-surface-900 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-3.5 select-none overflow-y-auto">
      <div className="space-y-3">
        <Header
          settings={profile.settings}
          personas={profile.personas}
          activePersonaId={profile.activePersonaId}
          onSelectPersona={handleSelectPersona}
          onOpenPersonas={handleOpenPersonas}
          onOpenSettings={handleOpenSettings}
          onToggleTheme={handleToggleTheme}
          onOpenCloudTracker={() => window.open('http://localhost:5173/#tracker', '_blank')}
        />

        {/* Job Description Analyzer & Tailor Widget */}
        <JobTailorCard
          jobReqs={jobReqs}
          matchReport={matchReport}
          onOpenTailorModal={() => setIsTailorModalOpen(true)}
          onManualJdSubmit={(text) => processJobDescription(text, undefined, profile)}
        />

        {showLogBanner && (
          <LogApplicationBanner
            company={jobReqs?.jobTitle?.split(' at ')[1] || pageMeta.company}
            role={jobReqs?.jobTitle?.split(' at ')[0] || pageMeta.role}
            url={pageMeta.url}
            matchedSkills={matchReport?.matchedSkills?.map((s) => s.canonical)}
            tailoredSummary={tailoredResult?.tailoredSummaries.impact}
            onDismiss={() => setShowLogBanner(false)}
            onLogged={() => {
              showToast('✓ Logged to Cloud Tracker');
            }}
          />
        )}

        <DetectionCard
          summary={detection}
          loading={isScanning}
          onRescan={() => scanCurrentPage(effectiveProfile)}
          onOpenPreview={() => setIsPreviewOpen(true)}
          isRestrictedPage={isRestrictedPage}
        />

        <QuickCopyGrid
          profile={effectiveProfile}
          activeCompany={jobReqs?.jobTitle?.split(' at ')[1] || pageMeta.company}
          activeRole={jobReqs?.jobTitle?.split(' at ')[0] || pageMeta.role}
          onOpenOptions={handleOpenSettings}
          onShowToast={showToast}
        />
      </div>

      <div className="mt-2.5">
        <Completeness
          completeness={completeness}
          onOpenOptions={handleOpenSettings}
        />
      </div>

      {detection && (
        <PreviewModal
          isOpen={isPreviewOpen}
          fields={detection.detectedFields}
          profile={effectiveProfile}
          onClose={() => setIsPreviewOpen(false)}
          onAutofill={handleAutofillSelected}
          onHoverField={handleHoverField}
        />
      )}

      {jobReqs && matchReport && tailoredResult && (
        <JobTailorModal
          isOpen={isTailorModalOpen}
          onClose={() => setIsTailorModalOpen(false)}
          jobReqs={jobReqs}
          matchReport={matchReport}
          tailoredResult={tailoredResult}
          onAddSkillToProfile={handleAddSkillToProfile}
          onApplyTailoredData={handleApplyTailoredData}
          onShowToast={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
};
