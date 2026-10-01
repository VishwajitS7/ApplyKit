import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, ShieldCheck, Rocket } from 'lucide-react';
import { UserProfile } from '../../types/profile';

interface OnboardingProps {
  onComplete: (profilePatch: Partial<UserProfile>) => Promise<void>;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      await onComplete({
        personal: {
          fullName: fullName.trim(),
          firstName,
          lastName,
          email: email.trim(),
          phone: phone.trim(),
        },
        profiles: {
          linkedin: linkedin.trim(),
          github: github.trim(),
          portfolio: portfolio.trim(),
        },
        education: {
          college: college.trim(),
          graduationYear: graduationYear.trim(),
        },
        settings: {
          theme: 'system',
          overwriteNonEmpty: false,
          hasCompletedOnboarding: true,
        },
      });
    } catch (err) {
      console.error('[ApplyKit] Failed saving onboarding profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="flex flex-col h-full justify-between p-6 text-center animate-in fade-in duration-200">
        <div className="my-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Welcome to ApplyKit
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[260px] mx-auto">
              Fill your profile once. Use it across every job application.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>100% local storage. Zero servers or tracking.</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Never auto-submits applications. You stay in control.</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep(1)}
          className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all"
        >
          <span>Set Up My Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Step 1: Essential Contact Info (Required)
  if (step === 1) {
    const isStep1Valid = fullName.trim().length > 0 && email.trim().length > 0;

    return (
      <div className="flex flex-col h-full justify-between p-5 animate-in fade-in duration-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
                Step 1 of 2
              </span>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Contact Details
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                autoFocus
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => setStep(0)}
            className="w-1/3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Back
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-2/3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-brand-600/30"
          >
            <span>Next: Profiles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Profiles & Education (Optional)
  if (step === 2) {
    return (
      <div className="flex flex-col h-full justify-between p-5 animate-in fade-in duration-200">
        <div className="space-y-3 overflow-y-auto pr-1 max-h-[440px]">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
              Step 2 of 2 (Optional)
            </span>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Online Profiles & Education
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/alex"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/alex"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Portfolio / Website
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://alex.dev"
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  College / Univ
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Stanford"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Grad Year
                </label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="2025"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setStep(1)}
            className="w-1/3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Back
          </button>
          <button
            onClick={() => setStep(3)}
            className="w-2/3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-brand-600/30"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Complete / Ready
  return (
    <div className="flex flex-col h-full justify-between p-6 text-center animate-in fade-in duration-200">
      <div className="my-auto space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Check className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            You're ready.
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[260px] mx-auto">
            Open any job application and ApplyKit will help you fill it faster.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-1.5">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
            <Rocket className="w-3.5 h-3.5 text-brand-500" />
            <span>How to use:</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <li>Navigate to any job application page</li>
            <li>Click the ApplyKit extension icon</li>
            <li>Review detected fields & click Autofill</li>
          </ol>
        </div>
      </div>

      <button
        onClick={handleFinish}
        disabled={saving}
        className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all"
      >
        <span>{saving ? 'Saving Profile...' : 'Done & Start Using'}</span>
      </button>
    </div>
  );
};
