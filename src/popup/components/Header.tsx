import React from 'react';
import { Settings, Sparkles, Moon, Sun, Cloud, ChevronDown } from 'lucide-react';
import { UserSettings, ProfilePersona } from '../../types/profile';

interface HeaderProps {
  settings: UserSettings;
  personas?: ProfilePersona[];
  activePersonaId?: string;
  onSelectPersona?: (id: string) => void;
  onOpenPersonas?: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onOpenCloudTracker?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  personas,
  activePersonaId,
  onSelectPersona,
  onOpenPersonas,
  onOpenSettings,
  onToggleTheme,
  onOpenCloudTracker,
}) => {
  return (
    <header className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
              ApplyKit
            </h1>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-none">
            Fill once. Apply faster.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {personas && personas.length > 0 && onSelectPersona && (
          <div className="relative flex items-center">
            <select
              value={activePersonaId || personas[0]?.id}
              onChange={(e) => {
                if (e.target.value === '__manage__') {
                  (onOpenPersonas || onOpenSettings)();
                } else {
                  onSelectPersona(e.target.value);
                }
              }}
              className="appearance-none text-[10px] font-semibold bg-brand-50/90 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30 rounded-lg px-2 py-1 pr-5 focus:outline-hidden cursor-pointer"
              title="Switch Active Candidate Persona"
            >
              {personas.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  {p.name}
                </option>
              ))}
              <option value="__manage__" className="bg-zinc-100 dark:bg-zinc-900 text-brand-600 dark:text-brand-400 font-bold">
                ⚙ Manage Personas...
              </option>
            </select>
            <ChevronDown className="w-3 h-3 text-brand-600 dark:text-brand-400 absolute right-1.5 pointer-events-none" />
          </div>
        )}

        {onOpenCloudTracker && (
          <button
            onClick={onOpenCloudTracker}
            title="Open Dedicated Cloud Tracker & ATS Studio"
            className="p-1.5 rounded-md text-brand-600 dark:text-brand-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
            aria-label="Open Cloud Tracker"
          >
            <Cloud className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onToggleTheme}
          title={`Theme: ${settings.theme}`}
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          aria-label="Toggle theme"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          title="Open Dashboard & Settings"
          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
