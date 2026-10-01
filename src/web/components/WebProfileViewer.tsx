import React, { useState } from 'react';
import { User, Globe, GraduationCap, Briefcase, Check, Edit2, BookOpen, Copy, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types/profile';
import { copyTextToClipboard } from '../../utils/clipboard';
import { ResumeExtractModal } from '../../options/components/ResumeExtractModal';

interface WebProfileViewerProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => Promise<void>;
}

export const WebProfileViewer: React.FC<WebProfileViewerProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);

  const handleSave = async () => {
    await onSaveProfile(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Candidate Profile & Master Credentials
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Synchronized with your ApplyKit Chrome Extension and Cloud Store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Synced & Saved!</span>
            </span>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" />
            <span>Personal Information</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Full Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.personal.fullName}
                  onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, fullName: e.target.value } })}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              ) : (
                <span className="font-semibold text-zinc-900 dark:text-white">{formData.personal.fullName || '—'}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-400 block text-[11px]">Email</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.personal.email}
                    onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, email: e.target.value } })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                ) : (
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">{formData.personal.email || '—'}</span>
                )}
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Phone</span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.personal.phone}
                    onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, phone: e.target.value } })}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                ) : (
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">{formData.personal.phone || '—'}</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">Location</span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.personal.location || ''}
                  onChange={(e) => setFormData({ ...formData, personal: { ...formData.personal, location: e.target.value } })}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              ) : (
                <span className="text-zinc-800 dark:text-zinc-200">{formData.personal.location || '—'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Online Profiles */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-500" />
            <span>Online Profiles & Repositories</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">LinkedIn</span>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.profiles.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, profiles: { ...formData.profiles, linkedin: e.target.value } })}
                  className="w-full mt-1 px-2.5 py-1.5 font-mono text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              ) : (
                <span className="font-mono text-brand-600 dark:text-brand-400">{formData.profiles.linkedin || 'Not set'}</span>
              )}
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px]">GitHub</span>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.profiles.github || ''}
                  onChange={(e) => setFormData({ ...formData, profiles: { ...formData.profiles, github: e.target.value } })}
                  className="w-full mt-1 px-2.5 py-1.5 font-mono text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              ) : (
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{formData.profiles.github || 'Not set'}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-400 block text-[11px]">LeetCode</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{formData.profiles.leetcode || 'Not set'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Portfolio</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{formData.profiles.portfolio || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-500" />
            <span>Education</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">University / College</span>
              <span className="font-semibold text-zinc-900 dark:text-white">{formData.education.college || '—'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-zinc-400 block text-[11px]">Degree</span>
                <span>{formData.education.degree || '—'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Major</span>
                <span>{formData.education.branch || '—'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Year</span>
                <span className="font-mono">{formData.education.graduationYear || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Personas */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              <span>Multi-Persona Profiles ({formData.personas?.length || 0})</span>
            </h3>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Active: <span className="font-semibold text-brand-600 dark:text-brand-400">
                {formData.personas?.find((p) => p.id === formData.activePersonaId)?.name || 'Default'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {(formData.personas || []).map((persona) => {
              const isActive = persona.id === formData.activePersonaId;
              return (
                <div
                  key={persona.id}
                  className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isActive
                      ? 'border-brand-500/60 bg-brand-50/40 dark:bg-brand-950/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-zinc-900 dark:text-white truncate">
                        {persona.name}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500 text-white shadow-xs">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            const updated = { ...formData, activePersonaId: persona.id };
                            setFormData(updated);
                            await onSaveProfile(updated);
                          }}
                          className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                        >
                          Switch
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      {persona.title || 'Role Persona'}
                    </p>

                    {persona.summary && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                        {persona.summary}
                      </p>
                    )}

                    {persona.skills && persona.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {persona.skills.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          >
                            {s}
                          </span>
                        ))}
                        {persona.skills.length > 4 && (
                          <span className="text-[10px] text-zinc-400 self-center">
                            +{persona.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills & Summary */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-500" />
              <span>Skills & Summary</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsExtractModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>Extract from Resume</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px] mb-1.5">Skills ({formData.professional.skills?.length || 0})</span>
              <div className="flex flex-wrap gap-1">
                {(formData.professional.skills || []).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px] mb-1">Summary</span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-[11px]">
                {formData.professional.summary || 'No professional summary set.'}
              </p>
            </div>
          </div>
        </div>

        {/* Smart Answer Vault & Snippets */}
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-500" />
              <span>Smart Answer Vault & Snippets ({formData.snippets?.length || 0})</span>
            </h3>
            <span className="text-[10px] text-zinc-400">
              Synced with your extension popup
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(formData.snippets || []).map((snip) => {
              const isCopied = copiedSnippetId === snip.id;
              return (
                <div
                  key={snip.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {snip.title}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                        {snip.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed line-clamp-3">
                      {snip.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {snip.content.length} chars
                    </span>
                    <button
                      onClick={async () => {
                        await copyTextToClipboard(snip.content);
                        setCopiedSnippetId(snip.id);
                        setTimeout(() => setCopiedSnippetId((prev) => (prev === snip.id ? null : prev)), 1500);
                      }}
                      className="px-2 py-1 rounded text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ResumeExtractModal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        storedResume={formData.documents?.resume}
        existingSkills={formData.professional.skills || []}
        existingSummary={formData.professional.summary || ''}
        onApply={async ({ skills: newSkills, summary: newSummary, mergeSkills }) => {
          let finalSkills = newSkills;
          if (mergeSkills) {
            const combined = new Set([...(formData.professional.skills || []), ...newSkills]);
            finalSkills = Array.from(combined);
          }
          const updated: UserProfile = {
            ...formData,
            professional: {
              ...formData.professional,
              skills: finalSkills,
              summary: newSummary || formData.professional.summary,
            },
          };
          setFormData(updated);
          await onSaveProfile(updated);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 2000);
        }}
      />
    </div>
  );
};
