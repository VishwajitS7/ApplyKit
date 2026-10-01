import React from 'react';
import { PersonalInfo } from '../../types/profile';

interface PersonalSectionProps {
  data: PersonalInfo;
  onChange: (patch: Partial<PersonalInfo>) => void;
}

export const PersonalSection: React.FC<PersonalSectionProps> = ({
  data,
  onChange,
}) => {
  const handleFullNameChange = (val: string) => {
    const parts = val.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    onChange({
      fullName: val,
      firstName: data.firstName || firstName,
      lastName: data.lastName || lastName,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Personal Information
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Your basic identity information commonly required on every job application form.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.fullName || ''}
            onChange={(e) => handleFullNameChange(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            First Name
          </label>
          <input
            type="text"
            value={data.firstName || ''}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="Jane"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={data.lastName || ''}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Doe"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="jane.doe@example.com"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Location / City, Country
          </label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g. San Francisco, CA or London, UK"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
};
