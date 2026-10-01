import React, { useRef } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DocumentsInfo, ResumeDocument } from '../../types/profile';

interface DocumentsSectionProps {
  data: DocumentsInfo;
  onChange: (patch: Partial<DocumentsInfo>) => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  data,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resume = data.resume;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 3MB for local storage safety)
    if (file.size > 3 * 1024 * 1024) {
      alert('File exceeds 3MB limit for local browser storage. Please select a smaller PDF or store metadata only.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resumeDoc: ResumeDocument = {
        name: file.name,
        lastUpdated: new Date().toISOString(),
        sizeBytes: file.size,
        type: file.type || 'application/pdf',
        data: typeof reader.result === 'string' ? reader.result : undefined,
      };
      onChange({ resume: resumeDoc });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    onChange({ resume: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Resume & Documents
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Store your primary resume metadata and local copy. Stored strictly on your machine.
        </p>
      </div>

      {resume ? (
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-surface-850 shadow-subtle space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>{resume.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {formatFileSize(resume.sizeBytes)} · Updated {new Date(resume.lastUpdated || '').toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveResume}
              title="Remove stored resume"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              Replace file
            </button>
            <span className="text-[10px] text-zinc-400 font-mono">
              Ready for reference
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-brand-500 dark:hover:border-brand-500/60 bg-zinc-50/50 dark:bg-zinc-900/30 text-center cursor-pointer transition-colors space-y-2"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
              Click to select your resume (PDF)
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Maximum 3MB · Persisted locally in browser storage
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Safety Policy:</strong> ApplyKit will <em>never</em> automatically upload your resume or any file to a job portal without your manual action. The stored resume acts as your reference and local copy.
        </p>
      </div>
    </div>
  );
};
