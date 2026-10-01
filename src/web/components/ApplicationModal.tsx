import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { JobApplication, ApplicationStatus, InterviewRound } from '../../cloud/sync-types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: JobApplication) => Promise<void>;
  editingApp?: JobApplication | null;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingApp,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([]);

  useEffect(() => {
    if (editingApp) {
      setCompany(editingApp.company);
      setRole(editingApp.role);
      setUrl(editingApp.url || '');
      setStatus(editingApp.status);
      setAppliedDate(editingApp.appliedDate ? editingApp.appliedDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setSalary(editingApp.salary || '');
      setLocation(editingApp.location || '');
      setNotes(editingApp.notes || '');
      setInterviewRounds(editingApp.interviewRounds || []);
    } else {
      setCompany('');
      setRole('');
      setUrl('');
      setStatus('applied');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setSalary('');
      setLocation('');
      setNotes('');
      setInterviewRounds([]);
    }
  }, [editingApp, isOpen]);

  if (!isOpen) return null;

  const handleAddRound = () => {
    const newRound: InterviewRound = {
      id: `round-${Date.now()}`,
      title: 'Technical Screen',
      date: new Date().toISOString().split('T')[0],
      completed: false,
    };
    setInterviewRounds([...interviewRounds, newRound]);
  };

  const handleRemoveRound = (id: string) => {
    setInterviewRounds(interviewRounds.filter((r) => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const appToSave: JobApplication = {
      id: editingApp ? editingApp.id : `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      company: company.trim(),
      role: role.trim(),
      url: url.trim(),
      status,
      appliedDate: new Date(appliedDate).toISOString(),
      salary: salary.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      interviewRounds: interviewRounds.length > 0 ? interviewRounds : undefined,
      matchedSkills: editingApp?.matchedSkills,
      tailoredSummary: editingApp?.tailoredSummary,
      createdAt: editingApp ? editingApp.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSave(appToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-850 rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            {editingApp ? 'Edit Application' : 'Add New Application'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Inc"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Role Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Job Posting URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/careers/..."
              className="w-full px-3 py-2 font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs cursor-pointer"
              >
                <option value="wishlist">Wishlist</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Archived</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Date Applied
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$150k - $175k"
                className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote (US) or New York, NY"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Notes & Follow-ups
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral contact, application questions, follow-up dates..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs"
            />
          </div>

          {/* Interview Stages Tracker */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Interview Stages
              </span>
              <button
                type="button"
                onClick={handleAddRound}
                className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Round</span>
              </button>
            </div>

            {interviewRounds.length === 0 ? (
              <p className="text-[11px] text-zinc-400 italic">No interview rounds logged yet.</p>
            ) : (
              <div className="space-y-2">
                {interviewRounds.map((round, idx) => (
                  <div key={round.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                    <span className="font-mono text-[10px] text-zinc-400">R{idx + 1}</span>
                    <input
                      type="text"
                      value={round.title}
                      onChange={(e) => {
                        const updated = [...interviewRounds];
                        updated[idx].title = e.target.value;
                        setInterviewRounds(updated);
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                    <input
                      type="date"
                      value={round.date.split('T')[0]}
                      onChange={(e) => {
                        const updated = [...interviewRounds];
                        updated[idx].date = e.target.value;
                        setInterviewRounds(updated);
                      }}
                      className="px-2 py-1 text-[11px] rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRound(round.id)}
                      className="p-1 text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs"
            >
              {editingApp ? 'Save Changes' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
