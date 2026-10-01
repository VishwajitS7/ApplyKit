import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { profileStore } from '../../storage/profile-store';
import { UserProfile } from '../../types/profile';

interface ImportExportProps {
  onProfileUpdated: (profile: UserProfile) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({
  onProfileUpdated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = async () => {
    try {
      const data = await profileStore.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applykit-profile-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: 'Profile exported successfully as JSON.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Failed to export: ${(err as Error).message}`,
      });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result || '');
        const res = await profileStore.import(text);
        if (res.success && res.profile) {
          onProfileUpdated(res.profile);
          setFeedback({
            type: 'success',
            message: 'Profile imported and validated successfully!',
          });
        } else {
          setFeedback({
            type: 'error',
            message: res.error || 'Invalid profile JSON structure.',
          });
        }
      } catch (err) {
        setFeedback({
          type: 'error',
          message: `Error reading file: ${(err as Error).message}`,
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClear = async () => {
    await profileStore.clear();
    const fresh = await profileStore.get();
    onProfileUpdated(fresh);
    setConfirmClear(false);
    setFeedback({
      type: 'success',
      message: 'All local profile data has been reset to defaults.',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Data & Backup
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Export your stored profile to keep a backup or transfer it to another browser.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Export / Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-brand-500" />
              <span>Export Profile</span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Save your entire profile as a structured JSON file.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-2 px-3 rounded-lg bg-zinc-100 dark:bg-surface-800 hover:bg-zinc-200 dark:hover:bg-surface-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-brand-500" />
              <span>Import Profile</span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Restore from a previously exported ApplyKit JSON file.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-lg bg-zinc-100 dark:bg-surface-800 hover:bg-zinc-200 dark:hover:bg-surface-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Select JSON File</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone: Clear Profile */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-red-600 dark:text-red-400">
              Reset Profile
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Permanently erase all stored personal data, links, education, and resume from this browser.
            </p>
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
              >
                Yes, Erase Everything
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="py-1.5 px-3 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stored Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
