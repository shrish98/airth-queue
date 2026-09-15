import React from 'react';
import { Clock, Play, CheckCircle2, XCircle, Layers } from 'lucide-react';
import { JobCounts, JobStatus } from '../types/job';

interface StatusCardsProps {
  counts: JobCounts;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  counts,
  selectedStatus,
  onSelectStatus,
}) => {
  const total = counts.pending + counts.running + counts.completed + counts.failed;

  const cardConfig = [
    {
      id: 'all',
      title: 'Total Jobs',
      count: total,
      icon: Layers,
      color: 'text-slate-200',
      activeBg: 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300',
      hoverBorder: 'hover:border-indigo-500/30',
      indicatorBg: 'bg-indigo-500',
    },
    {
      id: 'pending',
      title: 'Pending',
      count: counts.pending,
      icon: Clock,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      hoverBorder: 'hover:border-amber-500/30',
      indicatorBg: 'bg-amber-500',
    },
    {
      id: 'running',
      title: 'Running',
      count: counts.running,
      icon: Play,
      color: 'text-blue-400',
      activeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
      hoverBorder: 'hover:border-blue-500/30',
      indicatorBg: 'bg-blue-500',
    },
    {
      id: 'completed',
      title: 'Completed',
      count: counts.completed,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      hoverBorder: 'hover:border-emerald-500/30',
      indicatorBg: 'bg-emerald-500',
    },
    {
      id: 'failed',
      title: 'Failed',
      count: counts.failed,
      icon: XCircle,
      color: 'text-rose-400',
      activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      hoverBorder: 'hover:border-rose-500/30',
      indicatorBg: 'bg-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectStatus(card.id)}
            className={`text-left p-4 rounded-xl transition-all border ${
              isSelected ? card.activeBg : `glass-card border-slate-800 ${card.hoverBorder}`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white tracking-tight">{card.count}</span>
              {total > 0 && card.id !== 'all' && (
                <span className="text-[11px] font-medium text-slate-400">
                  {Math.round((card.count / total) * 100)}%
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
