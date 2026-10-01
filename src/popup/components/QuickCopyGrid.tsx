import React, { useState } from 'react';
import {
  Linkedin,
  Github,
  Code2,
  Globe,
  Mail,
  Phone,
  Check,
  Copy,
  Plus,
  Wrench,
  FileText,
  BookOpen,
  Search,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, SnippetCategory } from '../../types/profile';
import { copyTextToClipboard } from '../../utils/clipboard';

interface QuickCopyGridProps {
  profile: UserProfile;
  activeCompany?: string;
  activeRole?: string;
  onOpenOptions: () => void;
  onShowToast: (msg: string) => void;
}

interface CopyItemConfig {
  key: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  shortcut?: string;
}

export const QuickCopyGrid: React.FC<QuickCopyGridProps> = ({
  profile,
  activeCompany,
  activeRole,
  onOpenOptions,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'links' | 'vault'>('links');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [vaultSearch, setVaultSearch] = useState('');

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const snippets = profile.snippets || [];

  const items: CopyItemConfig[] = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      value: profile.profiles.linkedin || '',
      icon: <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />,
      shortcut: `${modKey}+⇧+L`,
    },
    {
      key: 'github',
      label: 'GitHub',
      value: profile.profiles.github || '',
      icon: <Github className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />,
      shortcut: `${modKey}+⇧+G`,
    },
    {
      key: 'leetcode',
      label: 'LeetCode',
      value: profile.profiles.leetcode || '',
      icon: <Code2 className="w-3.5 h-3.5 text-[#FFA116]" />,
      shortcut: `${modKey}+⇧+C`,
    },
    {
      key: 'portfolio',
      label: 'Portfolio',
      value: profile.profiles.portfolio || '',
      icon: <Globe className="w-3.5 h-3.5 text-brand-500" />,
      shortcut: `${modKey}+⇧+P`,
    },
    {
      key: 'email',
      label: 'Email',
      value: profile.personal.email || '',
      icon: <Mail className="w-3.5 h-3.5 text-red-500" />,
    },
    {
      key: 'phone',
      label: 'Phone',
      value: profile.personal.phone || '',
      icon: <Phone className="w-3.5 h-3.5 text-emerald-500" />,
    },
    {
      key: 'skills',
      label: 'Skills',
      value: (profile.professional.skills || []).join(', '),
      icon: <Wrench className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      key: 'summary',
      label: 'Summary',
      value: profile.professional.summary || '',
      icon: <FileText className="w-3.5 h-3.5 text-sky-500" />,
    },
  ];

  const resolveSnippetTokens = (text: string): string => {
    const comp = activeCompany || 'the company';
    const r = activeRole || 'this position';
    const skl = (profile.professional.skills || []).slice(0, 4).join(', ') || 'modern software engineering';
    const name = profile.personal.fullName || 'Candidate';
    const port = profile.profiles.portfolio || profile.profiles.github || '';

    return text
      .replace(/{company}/gi, comp)
      .replace(/{role}/gi, r)
      .replace(/{skills}/gi, skl)
      .replace(/{fullName}/gi, name)
      .replace(/{portfolio}/gi, port);
  };

  const handleCopy = async (key: string, text: string, label: string) => {
    if (!text) {
      onOpenOptions();
      return;
    }

    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedKey(key);
      onShowToast(`Copied ${label}`);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1500);
    }
  };

  const filteredSnippets = snippets.filter((s) => {
    const q = vaultSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const getCategoryBadgeClass = (category: SnippetCategory) => {
    switch (category) {
      case 'technical':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'behavioral':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'logistics':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'general':
      default:
        return 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-500/20';
    }
  };

  return (
    <div className="space-y-2">
      {/* Header with Switcher Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'links'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            ⚡ Quick Links
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-white dark:bg-zinc-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Answer Vault</span>
            <span className="text-[9px] font-mono px-1 rounded bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-200">
              {snippets.length}
            </span>
          </button>
        </div>

        {activeTab === 'vault' && (
          <button
            onClick={onOpenOptions}
            className="text-[10px] text-zinc-400 hover:text-brand-500 flex items-center gap-0.5 transition-colors cursor-pointer"
            title="Manage all snippets in Options Dashboard"
          >
            <span>Manage</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Tab 1: Links Grid */}
      {activeTab === 'links' && (
        <div className="grid grid-cols-2 gap-1.5 animate-in fade-in-50 duration-150">
          {items.map((item) => {
            const isCopied = copiedKey === item.key;
            const hasValue = Boolean(item.value && item.value.trim().length > 0);

            return (
              <button
                key={item.key}
                onClick={() => handleCopy(item.key, item.value, item.label)}
                title={hasValue ? `Copy: ${item.value}` : `Add ${item.label} in profile`}
                className={`group flex items-center justify-between p-2 rounded-lg border text-left transition-all subtle-interactive cursor-pointer ${
                  isCopied
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : hasValue
                    ? 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-850/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                    : 'border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 leading-tight">
                      <span className="text-[11px] font-medium text-zinc-900 dark:text-zinc-200 truncate">
                        {item.label}
                      </span>
                      {item.shortcut && (
                        <span className="hidden group-hover:inline-block kbd-shortcut py-0 px-1 text-[9px]">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                      {hasValue ? item.value : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isCopied ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : hasValue ? (
                    <span className="p-1 rounded text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                      <Copy className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="p-1 rounded text-zinc-400 group-hover:text-brand-500 transition-colors">
                      <Plus className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 2: Answer Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-1.5 animate-in fade-in-50 duration-150">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={vaultSearch}
              onChange={(e) => setVaultSearch(e.target.value)}
              placeholder="Search answers (Why Us, Notice Period...)"
              className="w-full pl-7 pr-2.5 py-1 text-[11px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Snippet List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-4 text-zinc-400 text-xs">
                No matching answers found.
              </div>
            ) : (
              filteredSnippets.map((snip) => {
                const isCopied = copiedKey === snip.id;
                const resolvedContent = resolveSnippetTokens(snip.content);

                return (
                  <button
                    key={snip.id}
                    onClick={() => handleCopy(snip.id, resolvedContent, snip.title)}
                    className={`w-full group p-2 rounded-lg border text-left transition-all subtle-interactive cursor-pointer flex flex-col gap-1 ${
                      isCopied
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-850/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                          {snip.title}
                        </span>
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider px-1 rounded border ${getCategoryBadgeClass(
                            snip.category
                          )}`}
                        >
                          {snip.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px]">
                        {isCopied ? (
                          <span className="flex items-center gap-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3" />
                            <span>Copied!</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 flex items-center gap-0.5">
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-snug">
                      {resolvedContent}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
