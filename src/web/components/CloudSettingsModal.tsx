import React, { useState } from 'react';
import { SyncManager } from '../../cloud/sync-manager';

interface CloudSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncManager: SyncManager;
  onSyncCompleted: () => void;
}

export const CloudSettingsModal: React.FC<CloudSettingsModalProps> = ({
  isOpen,
  onClose,
  syncManager,
  onSyncCompleted
}) => {
  const [activeProvider, setActiveProvider] = useState<'local' | 'firebase' | 'custom'>('local');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    projectId: '',
    authDomain: ''
  });
  const [customApiConfig, setCustomApiConfig] = useState({
    endpoint: 'https://api.applykit.internal/v1/sync',
    bearerToken: ''
  });

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    setStatusMessage('Synchronizing applications and profile with cloud gateway...');
    try {
      const res = await syncManager.syncNow();
      if (res.success) {
        setSyncStatus('success');
        setStatusMessage(`Sync successful! ${res.syncedApplicationsCount} applications synced at ${new Date(res.timestamp).toLocaleTimeString()}`);
        onSyncCompleted();
      } else {
        setSyncStatus('error');
        setStatusMessage(res.error || 'Sync encountered an error.');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setStatusMessage(err?.message || 'Failed to sync with cloud gateway.');
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await syncManager.exportBackupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applykit-cloud-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export backup data.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        await syncManager.importBackupData(parsed);
        alert('Backup data imported successfully into local cloud gateway!');
        onSyncCompleted();
      } catch (err: any) {
        alert('Invalid JSON file or backup schema format: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cloud Storage &amp; Sync Engine</h2>
              <p className="text-xs text-slate-400">Cross-device persistence and bidirectional browser sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Sync Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveProvider('local')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  activeProvider === 'local'
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Local Gateway
                </div>
                <span className="text-[10px] text-slate-400">Zero-setup offline sync</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider('firebase')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  activeProvider === 'firebase'
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Firebase
                </div>
                <span className="text-[10px] text-slate-400">Google Firestore sync</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider('custom')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  activeProvider === 'custom'
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  REST API
                </div>
                <span className="text-[10px] text-slate-400">Custom backend webhook</span>
              </button>
            </div>
          </div>

          {/* Provider Specific Details */}
          {activeProvider === 'local' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Live Browser Channel</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses the high-speed <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">BroadcastChannel API</code> and unified IndexedDB storage.
                Any job application logged from the Chrome extension immediately reflects here without network latency or required logins.
              </p>
            </div>
          )}

          {activeProvider === 'firebase' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">
                Provide your Firebase project credentials to sync your applications and profiles with Cloud Firestore.
              </p>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Project ID</label>
                <input
                  type="text"
                  placeholder="applykit-prod-1234"
                  value={firebaseConfig.projectId}
                  onChange={e => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Web API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSyB..."
                  value={firebaseConfig.apiKey}
                  onChange={e => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {activeProvider === 'custom' && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">
                Configure your company or personal REST endpoint for automated application ingestion.
              </p>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">API Endpoint URL</label>
                <input
                  type="url"
                  value={customApiConfig.endpoint}
                  onChange={e => setCustomApiConfig({ ...customApiConfig, endpoint: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Authorization Bearer Token (Optional)</label>
                <input
                  type="password"
                  placeholder="Bearer eyJhbGciOi..."
                  value={customApiConfig.bearerToken}
                  onChange={e => setCustomApiConfig({ ...customApiConfig, bearerToken: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Sync Trigger and Status */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-300">Manual Synchronize</h4>
                <p className="text-[11px] text-slate-500">Force immediate sync cycle across all stores</p>
              </div>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncStatus === 'syncing'}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Now
                  </>
                )}
              </button>
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                syncStatus === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : syncStatus === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Backup & Data Ownership */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Data Ownership &amp; Backups</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export JSON Backup
              </button>
              <label className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
