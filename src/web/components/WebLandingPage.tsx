import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Kanban,
  Users2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Terminal,
  Play,
  Layers,
  FileText,
  Keyboard,
  Compass,
  Flame,
  Database,
} from 'lucide-react';
import { WebTabKey } from './Navbar';
import { UserProfile, ProfilePersona } from '../../types/profile';
import { TrackerMetrics } from '../../cloud/sync-types';
import { copyTextToClipboard } from '../../utils/clipboard';

interface WebLandingPageProps {
  onNavigateTab: (tab: WebTabKey) => void;
  profile: UserProfile;
  metrics: TrackerMetrics;
}

export const WebLandingPage: React.FC<WebLandingPageProps> = ({
  onNavigateTab,
  profile,
  metrics,
}) => {
  // Interactive Walkthrough Guide Tab
  const [guideStep, setGuideStep] = useState<
    'install' | 'personas' | 'autofill' | 'studio' | 'pipeline'
  >('install');

  // Interactive Live Persona Simulator
  const defaultPersonas = profile.personas && profile.personas.length > 0 ? profile.personas : [
    {
      id: 'fullstack',
      name: 'Full-Stack Engineer',
      title: 'Senior Full-Stack Engineer',
      skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker'],
      summary: 'Passionate full-stack developer with 5+ years of experience architecting cloud applications and modern interfaces.',
      portfolioUrl: 'https://alexrivera.dev',
      githubUrl: 'https://github.com/alexrivera-io',
      linkedinUrl: 'https://linkedin.com/in/alexrivera-dev',
      isDefault: true,
    },
    {
      id: 'frontend',
      name: 'Frontend Specialist',
      title: 'Senior Frontend Engineer',
      skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Web Performance', 'Accessibility'],
      summary: 'Frontend specialist crafting pixel-perfect, accessible, and fast web experiences with modern React ecosystems.',
      portfolioUrl: 'https://alex-frontend.dev',
      githubUrl: 'https://github.com/alex-fe',
      linkedinUrl: 'https://linkedin.com/in/alexrivera-dev',
      isDefault: false,
    },
    {
      id: 'devops',
      name: 'DevOps & Cloud Specialist',
      title: 'DevOps & Infrastructure Engineer',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Prometheus'],
      summary: 'DevOps practitioner focused on reliable continuous delivery, automated cloud infrastructure, and zero-downtime microservices.',
      portfolioUrl: 'https://cloud.alexrivera.dev',
      githubUrl: 'https://github.com/alex-devops',
      linkedinUrl: 'https://linkedin.com/in/alexrivera-dev',
      isDefault: false,
    },
  ];

  const [activePersonaSim, setActivePersonaSim] = useState<ProfilePersona>(defaultPersonas[0]);
  const [copiedSimKey, setCopiedSimKey] = useState<string | null>(null);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleCopySimulation = (text: string, key: string) => {
    copyTextToClipboard(text);
    setCopiedSimKey(key);
    setTimeout(() => setCopiedSimKey(null), 1500);
  };

  const faqs = [
    {
      q: 'Will ApplyKit ever submit an application automatically without my review?',
      a: 'Strictly NEVER. ApplyKit enforces an ironclad zero-auto-submit policy. It never touches Submit, Apply, or Send buttons. Furthermore, ApplyKit strictly omits legal declarations, demographic surveys, and salary commitment questions, keeping you 100% in control.',
    },
    {
      q: 'Where is my candidate and application data stored?',
      a: 'All data is stored directly on your machine in chrome.storage.local and the browser local database. There are zero tracking beacons, zero external analytics, and zero required remote servers. Optional cloud synchronization via Firebase or custom REST webhook can be enabled if you wish to sync across devices.',
    },
    {
      q: 'How does the Work Personas feature work?',
      a: 'Work Personas allow you to maintain tailored identities (e.g., Full-Stack, Frontend Specialist, DevOps) under a single master profile. When you switch personas from the extension popup, header, or dashboard, ApplyKit immediately adapts your autofilled skills list, summary, and customized portfolio URLs to match that specific job description.',
    },
    {
      q: 'Does autofill work on modern single-page apps like React, Vue, and Angular?',
      a: 'Yes! Unlike basic autofill extensions that merely set element.value, ApplyKit triggers native prototype descriptors (HTMLInputElement.prototype) and dispatches authentic synthetic input, change, and blur events with event bubbling so frameworks properly commit the state.',
    },
    {
      q: 'Can I export or backup my data?',
      a: 'Yes. You can export a schema-versioned applykit-profile.json file with 1 click. You can restore or import it anytime with built-in schema validation and sanitization.',
    },
  ];

  return (
    <div className="space-y-16 py-4 animate-fade-in text-zinc-900 dark:text-zinc-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white via-zinc-50 to-zinc-100/60 dark:from-surface-900 dark:via-surface-900/90 dark:to-zinc-950 p-8 md:p-14 shadow-subtle">
        {/* Glow backdrop decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold backdrop-blur-md shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ApplyKit v1.0 • Privacy-First Career Acceleration Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.12]">
            Fill Once.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500">
              Apply 10x Faster
            </span>{' '}
            with Tailored Personas.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The candidate companion for modern job seekers: multi-persona autofill across Greenhouse, Lever, Ashby, and Workday, integrated ATS keyword compatibility matching, and a full visual application tracker.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigateTab('tracker')}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Kanban className="w-4 h-4" />
              <span>Open Applications Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('studio')}
              className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-surface-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-900 dark:text-zinc-100 text-sm font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4 text-brand-500" />
              <span>ATS Resume Studio</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-to-use-guide');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium flex items-center gap-2 transition"
            >
              <Compass className="w-4 h-4 text-zinc-500" />
              <span>Interactive User Guide</span>
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero-Submit Safety Policy</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>100% Local Device Storage</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users2 className="w-4 h-4 text-cyan-400" />
              <span>Dynamic Work Personas</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Global Quick Shortcuts</span>
            </span>
            {metrics && metrics.totalApplications > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>{metrics.totalApplications} In Pipeline</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Hero Visual Mockup Preview */}
        <div className="relative mt-12 max-w-4xl mx-auto rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-950">
          <img
            src="/hero-preview.jpg"
            alt="ApplyKit Dashboard & ATS Match Studio Preview"
            className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-500"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Live Unified System
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-medium">
                Autonomous browser autofill, ATS keyword matching, and cross-tab cloud sync in one harmonious platform.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigateTab('personas')}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition"
              >
                Configure Personas
              </button>
              <button
                onClick={() => onNavigateTab('tracker')}
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition"
              >
                View Pipeline
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Sandbox / Persona Simulator */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Users2 className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            See Multi-Persona Profiles in Action
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Switch between personas below to see how ApplyKit instantaneously transforms autofilled skills, tailored summaries, and targeted portfolio links for each job requirement.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-6">
          {/* Persona Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            {defaultPersonas.map((persona) => {
              const isActive = activePersonaSim.id === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => setActivePersonaSim(persona)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-surface-800 text-zinc-700 dark:text-zinc-300 hover:border-brand-500/40'
                  }`}
                >
                  <Users2 className="w-3.5 h-3.5" />
                  <span>{persona.name}</span>
                  {persona.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-mono">
                      Default
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Persona Card Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left: Persona Details */}
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Target Role Title
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {activePersonaSim.title || activePersonaSim.name}
                </h3>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Tailored Professional Summary (Injected into forms)
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-surface-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 leading-relaxed font-sans">
                  {activePersonaSim.summary || 'No summary specified for this persona.'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Prioritized Skill Stack ({activePersonaSim.skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(activePersonaSim.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Quick Copy Simulator */}
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-surface-900 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Quick Copy</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Live Simulation</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="truncate mr-2">
                    <span className="text-[10px] text-zinc-400 block font-mono">PORTFOLIO URL</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 text-[11px] truncate">
                      {activePersonaSim.portfolioUrl || 'https://alexrivera.dev'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopySimulation(
                        activePersonaSim.portfolioUrl || 'https://alexrivera.dev',
                        'portfolio'
                      )
                    }
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition"
                  >
                    {copiedSimKey === 'portfolio' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="truncate mr-2">
                    <span className="text-[10px] text-zinc-400 block font-mono">GITHUB PROFILE</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 text-[11px] truncate">
                      {activePersonaSim.githubUrl || 'https://github.com/alexrivera-io'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopySimulation(
                        activePersonaSim.githubUrl || 'https://github.com/alexrivera-io',
                        'github'
                      )
                    }
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition"
                  >
                    {copiedSimKey === 'github' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="truncate mr-2">
                    <span className="text-[10px] text-zinc-400 block font-mono">ALL SKILLS (CSV)</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 text-[11px] truncate">
                      {(activePersonaSim.skills || []).slice(0, 3).join(', ')}...
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopySimulation((activePersonaSim.skills || []).join(', '), 'skills')
                    }
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition"
                  >
                    {copiedSimKey === 'skills' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('personas')}
                  className="w-full py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Users2 className="w-3.5 h-3.5" />
                  <span>Customize Your Personas in Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "How to Use ApplyKit" — Complete Walkthrough */}
      <section id="how-to-use-guide" className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Step-by-Step Walkthrough</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How to Use ApplyKit (Full User Guide)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            From loading the Chrome Extension in 30 seconds to automated JD keyword absorption and pipeline tracking.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium max-w-3xl mx-auto">
          <button
            onClick={() => setGuideStep('install')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              guideStep === 'install'
                ? 'bg-white dark:bg-surface-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1. Install Extension</span>
          </button>

          <button
            onClick={() => setGuideStep('personas')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              guideStep === 'personas'
                ? 'bg-white dark:bg-surface-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>2. Master Profile & Personas</span>
          </button>

          <button
            onClick={() => setGuideStep('autofill')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              guideStep === 'autofill'
                ? 'bg-white dark:bg-surface-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. 1-Click Form Autofill</span>
          </button>

          <button
            onClick={() => setGuideStep('studio')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              guideStep === 'studio'
                ? 'bg-white dark:bg-surface-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>4. ATS Studio & Letters</span>
          </button>

          <button
            onClick={() => setGuideStep('pipeline')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              guideStep === 'pipeline'
                ? 'bg-white dark:bg-surface-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>5. Application Pipeline</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 md:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle max-w-4xl mx-auto">
          {guideStep === 'install' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Step 1 of 5
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Load ApplyKit in Chrome, Brave, or Edge in 30 Seconds
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Because ApplyKit uses Manifest V3 and zero remote tracking, you can run the unpacked extension directly from source or production build.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Build the Extension</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Open your terminal and run:
                  </p>
                  <pre className="p-2.5 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto">
                    npm run build
                  </pre>
                  <p className="text-[11px] text-zinc-400">
                    This generates the production bundle in the <code className="text-brand-400">dist/</code> directory.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Open Browser Extensions</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Navigate to the extensions manager in your browser:
                  </p>
                  <pre className="p-2.5 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto">
                    chrome://extensions
                  </pre>
                  <p className="text-[11px] text-zinc-400">
                    Toggle on <strong>Developer mode</strong> in the top-right corner.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Click "Load Unpacked"</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Click the <strong>Load unpacked</strong> button in the top-left and select the <code className="text-brand-400 font-mono">dist/</code> folder inside the project.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white">Pin &amp; Test Drive</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Pin ApplyKit to your toolbar. Open <code className="text-brand-400 font-mono">test-form.html</code> or any Greenhouse/Lever job to test autofill immediately!
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-500">Next: Configure your master profile</span>
                <button
                  onClick={() => setGuideStep('personas')}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {guideStep === 'personas' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Step 2 of 5
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Master Candidate Profile &amp; Work Personas
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Fill your contact info, education, and links once. Then create specialized personas for different types of jobs.
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Candidate Master Credentials</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Navigate to the <strong>Candidate Profile</strong> tab. Enter your full name, email, phone, university, degree, graduation year, and online links (LinkedIn, GitHub, LeetCode, Portfolio).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Work Personas Strategy</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Most engineers apply to roles with subtle differences (e.g. Full-Stack, Frontend Specialist, or Backend/Cloud). Rather than overwriting your profile, create a persona for each role with tailored skills, bios, and specific portfolio projects.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Instant Switching from Extension Toolbar</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    When you are on an active job posting, click the persona dropdown in the extension header. Switching immediately re-projects all autofilled fields to that persona!
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGuideStep('install')}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setGuideStep('autofill')}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Continue to Step 3: Autofill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {guideStep === 'autofill' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Step 3 of 5
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Safe 1-Click Form Autofill &amp; The Floating Assistant (<code className="text-brand-400 font-mono">Alt+A</code>)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  How to summon ApplyKit on any job application page with confidence scoring and safety guarantees.
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-amber-500" />
                    <span>Dual Modes: In-Page Floating Window or Extension Popup</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    You have two flexible ways to interact on any job board:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300 pl-1">
                    <li>
                      <strong>In-Page Floating Window (<kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">Alt+A</kbd>):</strong> Injected directly into the job page by the extension. It stays floating as you scroll, highlights inputs on hover, lets you switch personas live, and allows 1-click autofill without leaving the form.
                    </li>
                    <li>
                      <strong>Extension Toolbar Popup:</strong> Click the ApplyKit icon in your browser toolbar for quick-copy links (LinkedIn, GitHub, Portfolio) and field previews without showing on-page overlays.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Review Detected Form Fields</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    ApplyKit automatically inspects labels, placeholders, input types, and DOM structure. It calculates a confidence percentage for each field (e.g. 95% Full Name, 100% LinkedIn URL).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 space-y-1.5">
                  <h4 className="font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>The Zero-Submit Safety Guarantee</span>
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Notice that sensitive fields are completely excluded from autofill: Legal Declarations, EEO/Demographics, Visa/Work Auth, and Salary Expectations. Most importantly, ApplyKit <strong>NEVER clicks the Submit button</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGuideStep('personas')}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setGuideStep('studio')}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Continue to Step 4: ATS Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {guideStep === 'studio' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Step 4 of 5
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  ATS Resume Studio, Keyword Gaps &amp; Cover Letters
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Analyze job descriptions against your candidate profile, absorb missing skills with 1 click, and generate tailored cover letters.
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-500" />
                    <span>Paste or Auto-Detect Any Job Posting</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    In the extension or on the <strong>ATS Resume Studio</strong> web tab, paste any job description. ApplyKit scans requirements and extracts normalized skills using its 450+ tech dictionary.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>ATS Compatibility Scoring &amp; 1-Click Absorption</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    View your weighted ATS percentage score. If you have skills that match the job description but are missing from your profile, click <strong>+ Add to Profile</strong> to absorb them instantly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Synthesize Tailored Outreach &amp; Cover Letters</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Generate role-tailored summaries in 3 distinct tones (Impact-Driven, Core Specialist, Adaptable), modern 3-paragraph cover letters, and recruiter InMail/email outreach messages.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGuideStep('autofill')}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setGuideStep('pipeline')}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Continue to Step 5: Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {guideStep === 'pipeline' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Step 5 of 5
                </span>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Visual Kanban Pipeline &amp; Conversion Analytics
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Track every submission seamlessly with cross-tab instant synchronization.
                </p>
              </div>

              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-brand-500" />
                    <span>Visual Drag-and-Drop Kanban Board</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Organize your active job hunts across 5 distinct stages: <em>Wishlist</em>, <em>Applied</em>, <em>Interviewing</em>, <em>Offer</em>, and <em>Archived/Rejected</em>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Response Rate &amp; In-Demand Skills Analytics</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Monitor your pipeline response rate percentage and see which technical skills appear most frequently across the companies you are interviewing with.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Instant Cross-Tab Sync via BroadcastChannel</span>
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    When you log an application from the Chrome Extension on LinkedIn or Greenhouse, it immediately appears on your web dashboard without requiring a page reload.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setGuideStep('studio')}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => onNavigateTab('tracker')}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Launch Application Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture &amp; Pillars</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Engineered for Velocity, Built for Privacy
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            A look under the hood at the 6 core systems powering ApplyKit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Dynamic Work Personas
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Create role-tailored identities (e.g. Senior Full-Stack, Frontend Specialist, Cloud/DevOps). Switching immediately swaps your autofilled skills list, summary, and portfolio URLs.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Zero-Submit Safety Protocol
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Strict denylist excludes submit buttons, legal declarations, demographic surveys, and salary questions. You always review before manually clicking apply.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              ATS Keyword Gap Engine
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              450+ skill vocabulary mapping, frequency weighting, and resume-to-JD gap analysis. 1-click skill absorption adds missing keywords directly to your profile.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              React &amp; SPA Synthetic Events
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Triggers native prototype property descriptors and authentic input events, ensuring React 16+, Vue, and Angular applications commit state without dropping inputs.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Global Quick Shortcuts
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Instant copy from anywhere on the web: <code className="font-mono text-brand-400">Ctrl+Shift+L</code> for LinkedIn, <code className="font-mono text-brand-400">Ctrl+Shift+G</code> for GitHub, <code className="font-mono text-brand-400">Alt+A</code> to toggle assistant.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3 hover:border-brand-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Answer Vault with Dynamic Tokens
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Pre-loaded behavioral answers with dynamic token replacement: <code className="font-mono text-brand-400">{'{company}'}</code>, <code className="font-mono text-brand-400">{'{role}'}</code>, and <code className="font-mono text-brand-400">{'{skills}'}</code> are replaced on the fly.
            </p>
          </div>
        </div>
      </section>

      {/* Test Playground CTA Banner */}
      <section className="p-8 md:p-10 rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-900/40 via-indigo-950/40 to-surface-900 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold">
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Want to test-drive autofill on a realistic form?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            We built a comprehensive, 20-field job application playground (<code className="text-brand-300 font-mono">test-form.html</code>) with realistic ATS fields, dropdowns, and safety compliance badges.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/test-form.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
          >
            <span>Launch Test Form</span>
            <ExternalLink className="w-4 h-4 text-zinc-700" />
          </a>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Everything you need to know about privacy, autofill mechanics, and security.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 overflow-hidden transition shadow-xs"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full px-5 py-4 text-left text-sm font-semibold flex items-center justify-between gap-4 text-zinc-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Footer Launchpad */}
      <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
            A
          </div>
          <span className="font-semibold text-zinc-900 dark:text-white">ApplyKit</span>
          <span>•</span>
          <span>v1.0.0 Production Release</span>
          <span>•</span>
          <span>MIT License</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => onNavigateTab('tracker')}
            className="hover:text-zinc-900 dark:hover:text-white transition"
          >
            Applications Tracker
          </button>
          <button
            onClick={() => onNavigateTab('studio')}
            className="hover:text-zinc-900 dark:hover:text-white transition"
          >
            ATS Resume Studio
          </button>
          <button
            onClick={() => onNavigateTab('personas')}
            className="hover:text-zinc-900 dark:hover:text-white transition"
          >
            Work Personas
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className="hover:text-zinc-900 dark:hover:text-white transition"
          >
            Candidate Profile
          </button>
          <a
            href="/test-form.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1"
          >
            <span>Test Form</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
};
