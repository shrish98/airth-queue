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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-lg w-full rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create Queue Job</h3>
              <p className="text-xs text-slate-400">Add a new task with status "Pending"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Job Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Export Weekly User Metrics CSV"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Job Type
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {JOB_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    type === t.value
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-white font-medium">{t.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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
