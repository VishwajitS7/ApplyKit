import React from 'react';
import { EducationInfo } from '../../types/profile';

interface EducationSectionProps {
  data: EducationInfo;
  onChange: (patch: Partial<EducationInfo>) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Education & Academics
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          University details and degree information requested in job applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            College / University Name
          </label>
          <input
            type="text"
            value={data.college || ''}
            onChange={(e) => onChange({ college: e.target.value })}
            placeholder="e.g. University of California, Berkeley"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Degree
          </label>
          <input
            type="text"
            value={data.degree || ''}
            onChange={(e) => onChange({ degree: e.target.value })}
            placeholder="e.g. Bachelor of Science"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Branch / Major
          </label>
          <input
            type="text"
            value={data.branch || ''}
            onChange={(e) => onChange({ branch: e.target.value })}
            placeholder="e.g. Computer Science"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Graduation Year
          </label>
          <input
            type="text"
            value={data.graduationYear || ''}
            onChange={(e) => onChange({ graduationYear: e.target.value })}
            placeholder="e.g. 2025"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            CGPA / GPA / Percentage
          </label>
          <input
            type="text"
            value={data.cgpa || ''}
            onChange={(e) => onChange({ cgpa: e.target.value })}
            placeholder="e.g. 3.85 / 4.0 or 9.2"
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
};
