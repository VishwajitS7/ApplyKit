import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
  Tag,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { AnswerSnippet, SnippetCategory } from '../../types/profile';
import { copyTextToClipboard } from '../../utils/clipboard';

interface SnippetVaultSectionProps {
  snippets: AnswerSnippet[];
  onChange: (snippets: AnswerSnippet[]) => void;
}

export const SnippetVaultSection: React.FC<SnippetVaultSectionProps> = ({
  snippets = [],
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | SnippetCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal / Form state for Create/Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Partial<AnswerSnippet> | null>(null);
  const [tagInput, setTagInput] = useState('');

  const categories: Array<{ id: 'all' | SnippetCategory; label: string }> = [
    { id: 'all', label: 'All Snippets' },
    { id: 'general', label: 'General / Motivation' },
    { id: 'technical', label: 'Technical & Projects' },
    { id: 'behavioral', label: 'Behavioral & Leadership' },
    { id: 'logistics', label: 'Logistics & Availability' },
  ];

  const filteredSnippets = snippets.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      s.title.toLowerCase().includes(query) ||
      s.content.toLowerCase().includes(query) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = async (snippet: AnswerSnippet) => {
    const ok = await copyTextToClipboard(snippet.content);
    if (ok) {
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId((prev) => (prev === snippet.id ? null : prev)), 1600);
    }
  };

  const handleOpenCreate = () => {
    setEditingSnippet({
      id: `snip-${Date.now()}`,
      title: '',
      category: selectedCategory === 'all' ? 'general' : selectedCategory,
      content: '',
      tags: [],
    });
    setTagInput('');
    setIsEditing(true);
  };

  const handleOpenEdit = (snippet: AnswerSnippet) => {
    setEditingSnippet({ ...snippet, tags: [...(snippet.tags || [])] });
    setTagInput('');
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this answer snippet?')) {
      onChange(snippets.filter((s) => s.id !== id));
    }
  };

  const handleSaveSnippet = () => {
    if (!editingSnippet || !editingSnippet.title?.trim() || !editingSnippet.content?.trim()) {
      return;
    }

    const updatedSnippet: AnswerSnippet = {
      id: editingSnippet.id || `snip-${Date.now()}`,
      title: editingSnippet.title.trim(),
      category: editingSnippet.category || 'general',
      content: editingSnippet.content.trim(),
      tags: editingSnippet.tags || [],
      updatedAt: new Date().toISOString(),
    };

    const exists = snippets.some((s) => s.id === updatedSnippet.id);
    if (exists) {
      onChange(snippets.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s)));
    } else {
      onChange([updatedSnippet, ...snippets]);
    }

    setIsEditing(false);
    setEditingSnippet(null);
  };

  const insertVariableToken = (token: string) => {
    if (!editingSnippet) return;
    const current = editingSnippet.content || '';
    setEditingSnippet({
      ...editingSnippet,
      content: current ? `${current} ${token}` : token,
    });
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && editingSnippet && !editingSnippet.tags?.includes(trimmed)) {
      setEditingSnippet({
        ...editingSnippet,
        tags: [...(editingSnippet.tags || []), trimmed],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingSnippet) return;
    setEditingSnippet({
      ...editingSnippet,
      tags: (editingSnippet.tags || []).filter((t) => t !== tagToRemove),
    });
  };

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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <span>Smart Answer Vault & Snippets</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Store and quickly copy responses for open-ended application questions. Use tokens like{' '}
            <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-brand-600 dark:text-brand-400">
              {'{company}'}
            </code>{' '}
            and{' '}
            <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-brand-600 dark:text-brand-400">
              {'{role}'}
            </code>{' '}
            for automatic dynamic tailoring.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Snippet</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snippets by title, content, or tags..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet Grid / List */}
      {filteredSnippets.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No snippets found
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {searchQuery
              ? 'Try adjusting your search query or category filter.'
              : 'Create your first answer snippet to speed up future job applications.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Snippet</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSnippets.map((snippet) => {
            const isCopied = copiedId === snippet.id;
            return (
              <div
                key={snippet.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle flex flex-col justify-between space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {snippet.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getCategoryBadgeClass(
                            snippet.category
                          )}`}
                        >
                          {snippet.category}
                        </span>
                        {snippet.tags && snippet.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {snippet.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(snippet)}
                        title="Copy to clipboard"
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isCopied
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(snippet)}
                        title="Edit snippet"
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(snippet.id)}
                        title="Delete snippet"
                        className="p-1.5 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-500/10 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed line-clamp-4 bg-zinc-50/70 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                    {snippet.content}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <span>{snippet.content.length} characters</span>
                  <span>{snippet.content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isEditing && editingSnippet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>{editingSnippet.title ? 'Edit Snippet' : 'New Answer Snippet'}</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Snippet Title *
                  </label>
                  <input
                    type="text"
                    value={editingSnippet.title || ''}
                    onChange={(e) =>
                      setEditingSnippet({ ...editingSnippet, title: e.target.value })
                    }
                    placeholder="e.g. Why Us? / Motivation"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingSnippet.category || 'general'}
                    onChange={(e) =>
                      setEditingSnippet({
                        ...editingSnippet,
                        category: e.target.value as SnippetCategory,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  >
                    <option value="general">General / Motivation</option>
                    <option value="technical">Technical & Projects</option>
                    <option value="behavioral">Behavioral & Leadership</option>
                    <option value="logistics">Logistics & Availability</option>
                  </select>
                </div>
              </div>

              {/* Variable Token Pill Inserters */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Insert Dynamic Tokens:
                  </label>
                  <span className="text-[10px] text-zinc-400">Auto-filled on active job pages</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['{company}', '{role}', '{skills}', '{fullName}', '{portfolio}'].map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => insertVariableToken(token)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 transition-colors cursor-pointer"
                    >
                      + {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Answer Content *
                </label>
                <textarea
                  rows={5}
                  value={editingSnippet.content || ''}
                  onChange={(e) =>
                    setEditingSnippet({ ...editingSnippet, content: e.target.value })
                  }
                  placeholder="Type your response here. Use {company} or {role} where you want company details to be substituted automatically."
                  className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tags
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag and press Enter"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {editingSnippet.tags && editingSnippet.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {editingSnippet.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        <span>#{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSnippet}
                disabled={!editingSnippet.title?.trim() || !editingSnippet.content?.trim()}
                className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Save Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
