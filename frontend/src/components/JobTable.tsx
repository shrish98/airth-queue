import React from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  Search,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { Job, JobStatus } from '../types/job';

interface JobTableProps {
  jobs: Job[];
  loading: boolean;
  onUpdateStatus: (id: string, status: JobStatus) => void;
  onDeleteJob: (id: string) => void;
  actionLoadingId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  loading,
  onUpdateStatus,
  onDeleteJob,
  actionLoadingId,
  searchQuery,
  onSearchChange,
}) => {
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            <span>Running</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, ID, or job type..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-semibold">{filteredJobs.length}</span> of{' '}
          <span className="text-white font-semibold">{jobs.length}</span> jobs
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800/80">
            <tr>
              <th className="px-6 py-3.5">Job Title & Type</th>
              <th className="px-6 py-3.5">Job ID</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Created At</th>
              <th className="px-6 py-3.5 text-right">State Machine Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    <span>Loading queue jobs...</span>
                  </div>
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-500" />
                    <span className="font-semibold text-white">No jobs found</span>
                    <span className="text-xs text-slate-400">
                      {searchQuery
                        ? 'Try clearing your search term.'
                        : 'Click "+ New Job" to push a job into the queue.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => {
                const isItemLoading = actionLoadingId === job.id;
                const isTerminal = job.status === 'completed' || job.status === 'failed';

                return (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-900/40 transition-colors group"
                  >
                    {/* Title & Type */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                        {job.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {job.type}
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                      {job.id}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(job.status)}</td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {formatDate(job.createdAt)}
                    </td>

                    {/* State Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isItemLoading ? (
                          <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-indigo-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : job.status === 'pending' ? (
                          <button
                            onClick={() => onUpdateStatus(job.id, 'running')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all"
                            title="Transition pending -> running"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start Job</span>
                          </button>
                        ) : job.status === 'running' ? (
                          <>
                            <button
                              onClick={() => onUpdateStatus(job.id, 'completed')}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all"
                              title="Transition running -> completed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => onUpdateStatus(job.id, 'failed')}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all"
                              title="Transition running -> failed"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Fail</span>
                            </button>
                          </>
                        ) : isTerminal ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Locked Terminal State</span>
                          </span>
                        ) : null}

                        {/* Delete Job Button */}
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
