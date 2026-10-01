import React, { useState } from 'react';
import { Cloud, CheckCircle2, ExternalLink, X, Plus } from 'lucide-react';
import { syncManager } from '../../cloud/sync-manager';
import { JobApplication } from '../../cloud/sync-types';

interface LogApplicationBannerProps {
  company: string;
  role: string;
  url: string;
  matchedSkills?: string[];
  tailoredSummary?: string;
  onLogged?: () => void;
  onDismiss: () => void;
}

export const LogApplicationBanner: React.FC<LogApplicationBannerProps> = ({
  company: initialCompany,
  role: initialRole,
  url,
  matchedSkills,
  tailoredSummary,
  onLogged,
  onDismiss,
}) => {
  const [company, setCompany] = useState(initialCompany || 'Company');
  const [role, setRole] = useState(initialRole || 'Software Engineer');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        company: company.trim() || 'Company',
        role: role.trim() || 'Software Engineer',
        url: url || '',
        status: 'applied',
        appliedDate: new Date().toISOString(),
        notes: 'Autofilled and submitted via ApplyKit Chrome Extension.',
        matchedSkills: matchedSkills || [],
        tailoredSummary: tailoredSummary || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await syncManager.saveApplication(newApp);
      setIsSaved(true);
      if (onLogged) onLogged();
    } catch (err) {
      console.error('Failed to log application to cloud:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'http://localhost:5173/' });
    } else {
      window.open('http://localhost:5173/', '_blank');
    }
  };

  if (isSaved) {
    return (
      <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-emerald-300">Logged to Cloud Tracker!</span>
        </div>
        <button
          onClick={handleOpenDashboard}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white underline underline-offset-2 transition"
        >
          <span>Open Dashboard</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-brand-500/30 bg-brand-500/10 text-zinc-900 dark:text-zinc-100 text-xs space-y-2.5 animate-fade-in shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400">
          <Cloud className="w-4 h-4" />
          <span>Log to Cloud Tracker?</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-surface-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-surface-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. Frontend Engineer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Status will be set to Applied</span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        >
          <Plus className="w-3 h-3" />
          <span>{isSaving ? 'Logging...' : 'Log Application'}</span>
        </button>
      </div>
    </div>
  );
};
