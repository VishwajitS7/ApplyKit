import React, { useState } from 'react';
import {
  Users,
  Plus,
  Check,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Globe,
  Github,
  Linkedin,
  X,
} from 'lucide-react';
import { ProfilePersona, UserProfile } from '../../types/profile';

interface PersonasSectionProps {
  profile: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

export const PersonasSection: React.FC<PersonasSectionProps> = ({
  profile,
  onChange,
}) => {
  const personas = profile.personas || [];
  const activePersonaId = profile.activePersonaId || personas[0]?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Partial<ProfilePersona> | null>(null);
  const [skillInput, setSkillInput] = useState('');

  const handleSetActive = (id: string) => {
    onChange({ activePersonaId: id });
  };

  const handleOpenCreate = () => {
    setEditingPersona({
      id: `persona-${Date.now().toString(36)}`,
      name: '',
      title: '',
      skills: [...(profile.professional.skills || [])],
      summary: profile.professional.summary || '',
      portfolioUrl: profile.profiles.portfolio || '',
      githubUrl: profile.profiles.github || '',
      linkedinUrl: profile.profiles.linkedin || '',
      isDefault: false,
    });
    setSkillInput('');
    setIsEditing(true);
  };

  const handleOpenClone = (p: ProfilePersona) => {
    setEditingPersona({
      id: `persona-${Date.now().toString(36)}`,
      name: `${p.name} (Copy)`,
      title: p.title || '',
      skills: [...p.skills],
      summary: p.summary,
      portfolioUrl: p.portfolioUrl || '',
      githubUrl: p.githubUrl || '',
      linkedinUrl: p.linkedinUrl || '',
      isDefault: false,
    });
    setSkillInput('');
    setIsEditing(true);
  };

  const handleOpenEdit = (p: ProfilePersona) => {
    setEditingPersona({ ...p, skills: [...p.skills] });
    setSkillInput('');
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (personas.length <= 1) {
      alert('You must keep at least one persona profile.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this persona?')) {
      const filtered = personas.filter((p) => p.id !== id);
      const nextActive = activePersonaId === id ? filtered[0].id : activePersonaId;
      onChange({ personas: filtered, activePersonaId: nextActive });
    }
  };

  const handleSave = () => {
    if (!editingPersona || !editingPersona.name?.trim()) return;

    const updated: ProfilePersona = {
      id: editingPersona.id || `persona-${Date.now().toString(36)}`,
      name: editingPersona.name.trim(),
      title: editingPersona.title?.trim() || undefined,
      skills: editingPersona.skills || [],
      summary: editingPersona.summary?.trim() || '',
      portfolioUrl: editingPersona.portfolioUrl?.trim() || undefined,
      githubUrl: editingPersona.githubUrl?.trim() || undefined,
      linkedinUrl: editingPersona.linkedinUrl?.trim() || undefined,
      isDefault: editingPersona.isDefault || false,
      createdAt: editingPersona.createdAt || new Date().toISOString(),
    };

    const exists = personas.some((p) => p.id === updated.id);
    let updatedPersonas: ProfilePersona[];
    if (exists) {
      updatedPersonas = personas.map((p) => (p.id === updated.id ? updated : p));
    } else {
      updatedPersonas = [...personas, updated];
    }

    onChange({ personas: updatedPersonas });
    setIsEditing(false);
    setEditingPersona(null);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && editingPersona && !editingPersona.skills?.includes(trimmed)) {
      setEditingPersona({
        ...editingPersona,
        skills: [...(editingPersona.skills || []), trimmed],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!editingPersona) return;
    setEditingPersona({
      ...editingPersona,
      skills: (editingPersona.skills || []).filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            <span>Multi-Persona Profiles & Roles</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Maintain tailored sub-profiles for different job titles (e.g. *Full-Stack*, *Frontend*, *DevOps*).
            Switching personas immediately adapts your autofilled skills, summaries, and portfolio URLs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Persona</span>
        </button>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((persona) => {
          const isActive = persona.id === activePersonaId;
          return (
            <div
              key={persona.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'border-brand-500/50 bg-brand-50/20 dark:bg-brand-950/20 shadow-sm ring-1 ring-brand-500/30'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="space-y-3">
                {/* Persona Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {persona.name}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white flex items-center gap-1 shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    {persona.title && (
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-0.5">
                        {persona.title}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenClone(persona)}
                      title="Clone Persona"
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(persona)}
                      title="Edit Persona"
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {personas.length > 1 && (
                      <button
                        onClick={() => handleDelete(persona.id)}
                        title="Delete Persona"
                        className="p-1.5 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Tailored Tech Stack ({persona.skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {persona.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Summary snippet */}
                {persona.summary && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Professional Bio
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed bg-zinc-50/70 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      {persona.summary}
                    </p>
                  </div>
                )}

                {/* Optional URLs */}
                {(persona.portfolioUrl || persona.githubUrl || persona.linkedinUrl) && (
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                    {persona.portfolioUrl && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-brand-500" />
                        <span className="truncate max-w-[120px]">Portfolio</span>
                      </span>
                    )}
                    {persona.githubUrl && (
                      <span className="flex items-center gap-1">
                        <Github className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                        <span className="truncate max-w-[120px]">GitHub</span>
                      </span>
                    )}
                    {persona.linkedinUrl && (
                      <span className="flex items-center gap-1">
                        <Linkedin className="w-3 h-3 text-[#0A66C2]" />
                        <span className="truncate max-w-[120px]">LinkedIn</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Set as Active footer */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">
                  {persona.createdAt ? new Date(persona.createdAt).toLocaleDateString() : 'Active'}
                </span>
                {!isActive ? (
                  <button
                    onClick={() => handleSetActive(persona.id)}
                    className="px-3 py-1.5 rounded-lg border border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Set as Active Persona
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>In Use</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Persona Modal */}
      {isEditing && editingPersona && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>{editingPersona.name ? 'Edit Persona' : 'New Role Persona'}</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Persona Name & Target Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Persona Label *
                  </label>
                  <input
                    type="text"
                    value={editingPersona.name || ''}
                    onChange={(e) =>
                      setEditingPersona({ ...editingPersona, name: e.target.value })
                    }
                    placeholder="e.g. Frontend Specialist"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Target Role Title
                  </label>
                  <input
                    type="text"
                    value={editingPersona.title || ''}
                    onChange={(e) =>
                      setEditingPersona({ ...editingPersona, title: e.target.value })
                    }
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Persona Tech Stack
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill (e.g. React, Next.js) and press Enter"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {(editingPersona.skills || []).map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tailored Professional Summary */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tailored Professional Summary / Bio
                </label>
                <textarea
                  rows={4}
                  value={editingPersona.summary || ''}
                  onChange={(e) =>
                    setEditingPersona({ ...editingPersona, summary: e.target.value })
                  }
                  placeholder="Role-tailored elevator bio used for application summary and about me fields..."
                  className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              {/* Optional Overrides */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-500 block">
                  Link Overrides (Optional):
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="url"
                      value={editingPersona.portfolioUrl || ''}
                      onChange={(e) =>
                        setEditingPersona({ ...editingPersona, portfolioUrl: e.target.value })
                      }
                      placeholder="Specialized portfolio link (e.g. https://alex.dev/frontend)"
                      className="flex-1 px-3 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="url"
                      value={editingPersona.githubUrl || ''}
                      onChange={(e) =>
                        setEditingPersona({ ...editingPersona, githubUrl: e.target.value })
                      }
                      placeholder="GitHub profile URL (e.g. https://github.com/alex)"
                      className="flex-1 px-3 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingPersona.name?.trim()}
                className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Save Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
