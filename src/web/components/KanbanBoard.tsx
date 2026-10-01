import React from 'react';
import {
  ExternalLink,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  Trash2,
  Edit2,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../../cloud/sync-types';

interface KanbanBoardProps {
  applications: JobApplication[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onEditApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
}

interface ColumnConfig {
  id: ApplicationStatus;
  title: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'wishlist', title: 'Wishlist', badgeBg: 'bg-zinc-100 dark:bg-zinc-800', badgeText: 'text-zinc-600 dark:text-zinc-400', dotColor: 'bg-zinc-400' },
  { id: 'applied', title: 'Applied', badgeBg: 'bg-blue-50 dark:bg-blue-950/40', badgeText: 'text-blue-700 dark:text-blue-300', dotColor: 'bg-blue-500' },
  { id: 'interviewing', title: 'Interviewing', badgeBg: 'bg-amber-50 dark:bg-amber-950/40', badgeText: 'text-amber-700 dark:text-amber-300', dotColor: 'bg-amber-500' },
  { id: 'offer', title: 'Offer', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40', badgeText: 'text-emerald-700 dark:text-emerald-300', dotColor: 'bg-emerald-500' },
  { id: 'rejected', title: 'Archived', badgeBg: 'bg-zinc-100 dark:bg-zinc-800/80', badgeText: 'text-zinc-500 dark:text-zinc-400', dotColor: 'bg-zinc-500' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onUpdateStatus,
  onEditApplication,
  onDeleteApplication,
}) => {
  const getDaysAgo = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-surface-900/90 shadow-subtle min-h-[520px]"
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {col.title}
                </span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}>
                {colApps.length}
              </span>
            </div>

            {/* Applications List */}
            <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
              {colApps.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                  No applications in {col.title.toLowerCase()}
                </div>
              ) : (
                colApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-surface-800 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all space-y-2.5 text-xs group"
                  >
                    {/* Company & Role */}
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-zinc-900 dark:text-white leading-tight">
                          {app.company}
                        </h4>
                        {app.url && (
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-brand-500 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5 font-medium">
                        {app.role}
                      </p>
                    </div>

                    {/* Metadata tags (Salary, Location) */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                      {app.salary && (
                        <span className="flex items-center gap-0.5 bg-zinc-100 dark:bg-surface-750 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-medium">
                          <DollarSign className="w-2.5 h-2.5" />
                          <span>{app.salary}</span>
                        </span>
                      )}
                      {app.location && (
                        <span className="flex items-center gap-0.5 bg-zinc-100 dark:bg-surface-750 px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{app.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Matched skills snippet */}
                    {app.matchedSkills && app.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.matchedSkills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.2 rounded text-[9px] bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {app.matchedSkills.length > 3 && (
                          <span className="text-[9px] text-zinc-400 self-center">
                            +{app.matchedSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Active Interview Round Pill */}
                    {app.interviewRounds && app.interviewRounds.length > 0 && (
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300">
                        <div className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-amber-500" />
                          <span>{app.interviewRounds[app.interviewRounds.length - 1].title}</span>
                        </div>
                      </div>
                    )}

                    {/* Card Footer: Date & Quick Actions */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-750 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getDaysAgo(app.appliedDate)}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Status Select dropdown */}
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="bg-zinc-50 dark:bg-surface-750 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-700 dark:text-zinc-200 cursor-pointer"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Archived</option>
                        </select>

                        <button
                          onClick={() => onEditApplication(app)}
                          title="Edit details"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          title="Delete application"
                          className="p-1 rounded text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
