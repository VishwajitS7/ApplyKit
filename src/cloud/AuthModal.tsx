import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cloud,
  LogOut,
  Settings,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { AuthUser, FirebaseConfig } from './sync-types';
import { syncManager } from './sync-manager';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange?: (user: AuthUser | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthChange }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(syncManager.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Form state for custom Firebase config
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [appId, setAppId] = useState('');

  useEffect(() => {
    const unsub = syncManager.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Load existing Firebase config
    syncManager.getFirebaseConfig().then((cfg) => {
      if (cfg) {
        setApiKey(cfg.apiKey || '');
        setAuthDomain(cfg.authDomain || '');
        setProjectId(cfg.projectId || '');
        setAppId(cfg.appId || '');
      }
    });

    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await syncManager.signInWithGoogle();
      setCurrentUser(user);
      setSuccessMsg(`Welcome, ${user.displayName || user.email}! Cloud sync is now active.`);
      if (onAuthChange) onAuthChange(user);
    } catch (err: any) {
      console.warn('Google OAuth prompt note:', err);
      const code = err.code || '';
      const msg = err.message || '';

      if (msg.includes('FIREBASE_NOT_CONFIGURED')) {
        setErrorMsg(
          'Live Firebase project keys are not configured yet. You can paste your Firebase credentials below, or click "Quick Demo Sign-In" to test Google OAuth immediately.'
        );
        setShowConfig(true);
      } else if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
        setErrorMsg('Sign-in cancelled: The Google sign-in window was closed.');
      } else if (code === 'auth/cancelled-popup-request' || msg.includes('cancelled-popup-request')) {
        // Ignored or harmless duplicate popup request
      } else if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        setErrorMsg(
          'Google Provider is not enabled in your Firebase Console project. Please enable "Google" under Firebase Authentication > Sign-in method, or use "Quick Demo Sign-In" below.'
        );
        setShowConfig(true);
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setErrorMsg(
          `Domain "${window.location.hostname}" is not authorized in your Firebase Console. Add it under Firebase Authentication > Settings > Authorized domains, or use "Quick Demo Sign-In".`
        );
      } else {
        setErrorMsg(msg || 'Google sign-in encountered an issue. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await syncManager.signInWithDemoGoogle('developer@applykit.io');
      setCurrentUser(user);
      setSuccessMsg('Authenticated with Demo Google Account. Cloud sync simulator active!');
      if (onAuthChange) onAuthChange(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await syncManager.signOut();
      setCurrentUser(null);
      setSuccessMsg('Signed out successfully. Data is now safely stored on your local device.');
      if (onAuthChange) onAuthChange(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign-out failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSnippet = (rawText: string) => {
    try {
      const apiKeyMatch = rawText.match(/apiKey\s*:\s*["']([^"']+)["']/);
      const authDomainMatch = rawText.match(/authDomain\s*:\s*["']([^"']+)["']/);
      const projectIdMatch = rawText.match(/projectId\s*:\s*["']([^"']+)["']/);
      const appIdMatch = rawText.match(/appId\s*:\s*["']([^"']+)["']/);

      if (apiKeyMatch && apiKeyMatch[1]) setApiKey(apiKeyMatch[1]);
      if (authDomainMatch && authDomainMatch[1]) setAuthDomain(authDomainMatch[1]);
      if (projectIdMatch && projectIdMatch[1]) setProjectId(projectIdMatch[1]);
      if (appIdMatch && appIdMatch[1]) setAppId(appIdMatch[1]);

      if (apiKeyMatch && projectIdMatch) {
        setSuccessMsg('Firebase config snippet recognized and auto-filled below! Click "Save Configuration" to apply.');
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMsg('API Key and Project ID are required.');
      return;
    }

    const cfg: FirebaseConfig = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      appId: appId.trim() || undefined,
    };

    try {
      await syncManager.saveFirebaseConfig(cfg);
      setSuccessMsg('Firebase credentials saved successfully. You can now sign in with Google!');
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg('Failed to save Firebase config: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-zinc-900 dark:text-zinc-100">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-surface-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Account &amp; Cloud Security
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hybrid Local-First + Google OAuth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Status feedback */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Auth Status Card */}
          {currentUser ? (
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-brand-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                        {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-850" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {currentUser.displayName || 'Candidate'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {currentUser.providerId === 'google.com'
                        ? 'Google OAuth Connected'
                        : 'Demo Account Simulator'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Cloud Sync: Active (Scoped to UID)</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  UID: {currentUser.uid.slice(0, 14)}...
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Sign In Call to Action */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-500/5 via-indigo-500/5 to-cyan-500/5 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-surface-800 shadow-md border border-zinc-200 dark:border-zinc-700 mx-auto flex items-center justify-center">
                  {/* Official Google G Logo SVG */}
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Sign in with Google
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Securely sync your tailored personas, resume profiles, and application pipeline across devices.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-surface-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white text-xs font-semibold border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {/* Mini G Icon */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                  </button>

                  <button
                    onClick={handleDemoSignIn}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Demo Sign-In</span>
                  </button>
                </div>
              </div>

              {/* Local Storage Indicator */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>Current Mode: <strong>100% Local Device Storage</strong> (No Cloud)</span>
                </span>
                <span className="text-[10px] text-zinc-400">Offline Ready</span>
              </div>
            </div>
          )}

          {/* Privacy & Security Guarantees */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <h5 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Security &amp; Zero-Knowledge Policy</span>
            </h5>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1 list-disc list-inside">
              <li>Your candidate data is never shared with third-party data brokers or AI crawlers.</li>
              <li>When signed in with Google, cloud records are isolated by your private Google UID.</li>
              <li>Signing out immediately purges local cloud tokens and reverts to sandbox device storage.</li>
            </ul>
          </div>

          {/* Firebase Credentials Configuration Drawer */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 py-1"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span>Custom Firebase / Google Cloud Project Keys</span>
              </span>
              <span className="text-[11px] text-brand-500">{showConfig ? 'Hide' : 'Configure'}</span>
            </button>

            {showConfig && (
              <form onSubmit={handleSaveConfig} className="mt-4 space-y-3 animate-fade-in text-xs">
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  To connect your own dedicated Firebase project for Google OAuth and Firestore:
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Paste Firebase Console Snippet (Optional)</span>
                    <span className="text-[10px] text-brand-500">Auto-fills fields below</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder='Paste "const firebaseConfig = { ... }" or JSON snippet here'
                    onChange={(e) => handlePasteSnippet(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono focus:border-brand-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Firebase API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="applykit-production"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      Auth Domain
                    </label>
                    <input
                      type="text"
                      value={authDomain}
                      onChange={(e) => setAuthDomain(e.target.value)}
                      placeholder="app.firebaseapp.com"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand-500 hover:underline flex items-center gap-1"
                  >
                    <span>Firebase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-surface-850 flex items-center justify-between text-xs text-zinc-400">
          <span>ApplyKit Auth v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
