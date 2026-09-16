import React, { useState } from 'react';
import { X, Plus, Sparkles, Loader2 } from 'lucide-react';
import { JobType } from '../types/job';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (jobData: { title: string; type: string }) => Promise<void>;
}

const JOB_TYPES: { label: string; value: JobType; desc: string }[] = [
  {
    label: 'Email Notification',
    value: 'EMAIL_NOTIFICATION',
    desc: 'Dispatch automated email queues',
  },
  {
    label: 'Data Export',
    value: 'DATA_EXPORT',
    desc: 'Export records to CSV/JSON format',
  },
  {
    label: 'Report Generation',
    value: 'REPORT_GENERATION',
    desc: 'Generate analytics PDF reports',
  },
  {
    label: 'Image Processing',
    value: 'IMAGE_PROCESSING',
    desc: 'Resize and optimize uploaded media',
  },
  {
    label: 'Database Backup',
    value: 'DATABASE_BACKUP',
    desc: 'Scheduled automated database snapshot',
  },
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('EMAIL_NOTIFICATION');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await onCreate({ title, type });
      setTitle('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-orange-100 shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
              <Sparkles className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Create Queue Job</h3>
              <p className="text-xs text-slate-500 font-medium">Add a new task with status "Pending"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Export Weekly User Metrics CSV"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
              autoFocus
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Job Type
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {JOB_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    type === t.value
                      ? 'bg-orange-50 border-orange-500 text-orange-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-slate-900 font-bold">{t.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-orange-600 text-white hover:bg-orange-500 transition-all shadow-md shadow-orange-600/25 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
