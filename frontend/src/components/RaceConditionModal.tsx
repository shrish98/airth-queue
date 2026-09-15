import React, { useState } from 'react';
import { X, ShieldAlert, Zap, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';
import { jobApi } from '../services/api';
import { Job } from '../types/job';

interface RaceConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const RaceConditionModal: React.FC<RaceConditionModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    job: Job | null;
    req1: { status: 'fulfilled' | 'rejected'; val?: any; reason?: string };
    req2: { status: 'fulfilled' | 'rejected'; val?: any; reason?: string };
  } | null>(null);

  if (!isOpen) return null;

  const handleRunRaceTest = async () => {
    try {
      setTesting(true);
      setResults(null);

      // 1. Create a dummy test job in PENDING state
      const testJob = await jobApi.createJob({
        title: `Race Test Job #${Math.floor(Math.random() * 9000 + 1000)}`,
        type: 'DATABASE_BACKUP',
      });

      // 2. Intentionally fire 2 parallel PATCH requests at the exact same millisecond
      const [res1, res2] = await jobApi.triggerSimultaneousStatusUpdate(
        testJob.id,
        'running',
      );

      setResults({
        job: testJob,
        req1: {
          status: res1.status,
          val: res1.status === 'fulfilled' ? res1.value : null,
          reason: res1.status === 'rejected' ? res1.reason.message : null,
        },
        req2: {
          status: res2.status,
          val: res2.status === 'fulfilled' ? res2.value : null,
          reason: res2.status === 'rejected' ? res2.reason.message : null,
        },
      });

      onRefresh();
    } catch (err: any) {
      console.error('Race test failed:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-xl w-full rounded-2xl border border-amber-500/30 shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Race Condition Simulator</h3>
              <p className="text-xs text-slate-400">
                Evaluating sub-millisecond atomic state lock protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanation Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Evaluation Scenario:
          </p>
          <p>
            Imagine two browser tabs hit <code className="text-indigo-300 font-mono">PATCH /jobs/:id/status</code> to change a <code className="text-amber-300">pending</code> job to <code className="text-blue-300">running</code> at the exact same millisecond.
          </p>
          <p className="text-slate-400">
            Our NestJS backend uses <strong className="text-white">Atomic SQL conditional queries</strong> (<code className="font-mono text-emerald-300">WHERE id = :id AND status = 'pending'</code>). Exactly 1 request will update the DB row, and the other will trigger a <strong className="text-rose-400">409 Concurrency Conflict</strong>.
          </p>
        </div>

        {/* Run Test Button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={handleRunRaceTest}
            disabled={testing}
            className="flex items-center gap-2.5 px-6 py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Firing 2 Simultaneous Requests...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Fire 2 Parallel Requests Now</span>
              </>
            )}
          </button>
        </div>

        {/* Results Showcase */}
        {results && (
          <div className="mt-6 space-y-3 animate-fade-in">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Live Test Execution Results (Job ID: <span className="font-mono text-white">{results.job?.id}</span>)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Request 1 */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  results.req1.status === 'fulfilled'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Tab 1 Request</span>
                  {results.req1.status === 'fulfilled' ? (
                    <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> 200 OK (Success)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] bg-rose-500/20 px-2 py-0.5 rounded-full text-rose-300">
                      <AlertOctagon className="w-3 h-3" /> 409 Conflict
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-90">
                  {results.req1.status === 'fulfilled'
                    ? 'Successfully updated status to RUNNING'
                    : results.req1.reason}
                </p>
              </div>

              {/* Request 2 */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  results.req2.status === 'fulfilled'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Tab 2 Request</span>
                  {results.req2.status === 'fulfilled' ? (
                    <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> 200 OK (Success)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] bg-rose-500/20 px-2 py-0.5 rounded-full text-rose-300">
                      <AlertOctagon className="w-3 h-3" /> 409 Conflict
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-90">
                  {results.req2.status === 'fulfilled'
                    ? 'Successfully updated status to RUNNING'
                    : results.req2.reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
