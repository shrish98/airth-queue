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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
            <span>Running</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
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
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-orange-50/20">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, ID, or job type..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-sm"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{filteredJobs.length}</span> of{' '}
          <span className="text-slate-900 font-bold">{jobs.length}</span> jobs
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Job Title & Type</th>
              <th className="px-6 py-4">Job ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">State Machine Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                    <span className="font-medium">Loading queue jobs...</span>
                  </div>
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                    <span className="font-bold text-slate-800 text-sm">No jobs found</span>
                    <span className="text-xs text-slate-500">
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
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    {/* Title & Type */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                        {job.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 font-medium">
                        {job.type}
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500 font-semibold">
                      {job.id}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(job.status)}</td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                      {formatDate(job.createdAt)}
                    </td>

                    {/* State Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isItemLoading ? (
                          <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        ) : job.status === 'pending' ? (
                          <button
                            onClick={() => onUpdateStatus(job.id, 'running')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-600 text-white hover:bg-orange-500 transition-all shadow-sm active:scale-95"
                            title="Transition pending -> running"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start Job</span>
                          </button>
                        ) : job.status === 'running' ? (
                          <>
                            <button
                              onClick={() => onUpdateStatus(job.id, 'completed')}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm active:scale-95"
                              title="Transition running -> completed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => onUpdateStatus(job.id, 'failed')}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-sm active:scale-95"
                              title="Transition running -> failed"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Fail</span>
                            </button>
                          </>
                        ) : isTerminal ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Locked Terminal State</span>
                          </span>
                        ) : null}

                        {/* Delete Job Button */}
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
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
