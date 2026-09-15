import React from 'react';
import { Layers, Plus, Zap, ShieldAlert, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenRaceModal: () => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onOpenRaceModal,
  isConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white">
                AIRTH <span className="text-indigo-400 font-light">QUEUE</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                NestJS + React
              </span>
            </div>
            <p className="text-xs text-slate-400">Mini Job Queue & Concurrency Management</p>
          </div>
        </div>

        {/* Status Indicator & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse' : ''}`} />
            <span>{isConnected ? 'Real-time Live' : 'Polling Mode'}</span>
          </div>

          {/* Race Condition Simulator Button */}
          <button
            onClick={onOpenRaceModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800/90 text-amber-300 border border-amber-500/30 hover:bg-slate-800 hover:border-amber-500/60 transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Test Race Condition</span>
          </button>

          {/* Create Job Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
