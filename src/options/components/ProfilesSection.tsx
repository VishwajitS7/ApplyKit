import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { OnlineProfiles, CustomProfileLink } from '../../types/profile';

interface ProfilesSectionProps {
  data: OnlineProfiles;
  onChange: (patch: Partial<OnlineProfiles>) => void;
}

export const ProfilesSection: React.FC<ProfilesSectionProps> = ({
  data,
  onChange,
}) => {
  const customLinks = data.other || [];

  const handleAddCustomLink = () => {
    const newLink: CustomProfileLink = {
      id: `custom-${Date.now()}`,
      name: '',
      url: '',
    };
    onChange({ other: [...customLinks, newLink] });
  };

  const handleUpdateCustomLink = (id: string, field: 'name' | 'url', val: string) => {
    const updated = customLinks.map((link) =>
      link.id === id ? { ...link, [field]: val } : link
    );
    onChange({ other: updated });
  };

  const handleRemoveCustomLink = (id: string) => {
    onChange({ other: customLinks.filter((link) => link.id !== id) });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Online Profiles & URLs
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Links to your professional presence, portfolios, coding platforms, and repositories.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            LinkedIn Profile URL
          </label>
          <input
            type="url"
            value={data.linkedin || ''}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            GitHub Profile URL
          </label>
          <input
            type="url"
            value={data.github || ''}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="https://github.com/username"
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            LeetCode Profile URL
          </label>
          <input
            type="url"
            value={data.leetcode || ''}
            onChange={(e) => onChange({ leetcode: e.target.value })}
            placeholder="https://leetcode.com/username"
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Portfolio / Personal Website URL
          </label>
          <input
            type="url"
            value={data.portfolio || ''}
            onChange={(e) => onChange({ portfolio: e.target.value })}
            placeholder="https://janedoe.dev"
            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        {/* Custom Links Section */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Custom Links (Twitter, Kaggle, Substack, etc.)
            </span>
            <button
              onClick={handleAddCustomLink}
              className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          {customLinks.length === 0 ? (
            <p className="text-[11px] text-zinc-400 italic">
              No custom links added yet.
            </p>
          ) : (
            <div className="space-y-2">
              {customLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => handleUpdateCustomLink(link.id, 'name', e.target.value)}
                    placeholder="Platform (e.g. X / Twitter)"
                    className="w-1/3 px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleUpdateCustomLink(link.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="w-2/3 px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleRemoveCustomLink(link.id)}
                    title="Remove link"
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
