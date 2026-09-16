import React from 'react';
import { Plus, Zap, ShieldAlert, Activity } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900">
                AIRTH <span className="text-orange-600 font-bold">QUEUE</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 rounded-full">
                NestJS + React
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Mini Job Queue & Concurrency Management</p>
          </div>
        </div>

        {/* Status Indicator & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse text-emerald-600' : ''}`} />
            <span>{isConnected ? 'Real-time Live' : 'Polling Mode'}</span>
          </div>

          {/* Race Condition Simulator Button */}
          <button
            onClick={onOpenRaceModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all shadow-sm active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Test Race Condition</span>
          </button>

          {/* Create Job Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 text-white hover:bg-orange-500 transition-all shadow-md shadow-orange-600/25 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
