import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../../cloud/sync-types';

interface ApplicationTableProps {
  applications: JobApplication[];
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onEditApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onUpdateStatus,
  onEditApplication,
  onDeleteApplication,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'wishlist':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">Wishlist</span>;
      case 'applied':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">Applied</span>;
      case 'interviewing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">Interviewing</span>;
      case 'offer':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">Offer</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">Archived</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, location..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 text-zinc-800 dark:text-zinc-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses ({applications.length})</option>
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-surface-800 border-b border-zinc-200 dark:border-zinc-750 text-zinc-600 dark:text-zinc-300 font-semibold">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Applied</th>
                <th className="py-3 px-4">Salary</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400 italic">
                    No applications matched your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{app.company}</span>
                        {app.url && (
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-brand-500"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{app.role}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(app.status)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {app.salary || '—'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-zinc-600 dark:text-zinc-400">
                      {app.location || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300 cursor-pointer mr-1"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Archived</option>
                        </select>

                        <button
                          onClick={() => onEditApplication(app)}
                          title="Edit"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          title="Delete"
                          className="p-1 rounded text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
