import React from 'react';
import { Clock, Play, CheckCircle2, XCircle, Layers } from 'lucide-react';
import { JobCounts } from '../types/job';

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
      color: 'text-orange-600',
      activeBg: 'bg-orange-600 text-white shadow-lg shadow-orange-600/25 border-orange-600',
      hoverBorder: 'hover:border-orange-300',
      iconBg: 'bg-orange-100',
    },
    {
      id: 'pending',
      title: 'Pending',
      count: counts.pending,
      icon: Clock,
      color: 'text-amber-600',
      activeBg: 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 border-amber-600',
      hoverBorder: 'hover:border-amber-300',
      iconBg: 'bg-amber-100',
    },
    {
      id: 'running',
      title: 'Running',
      count: counts.running,
      icon: Play,
      color: 'text-blue-600',
      activeBg: 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border-blue-600',
      hoverBorder: 'hover:border-blue-300',
      iconBg: 'bg-blue-100',
    },
    {
      id: 'completed',
      title: 'Completed',
      count: counts.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      iconBg: 'bg-emerald-100',
    },
    {
      id: 'failed',
      title: 'Failed',
      count: counts.failed,
      icon: XCircle,
      color: 'text-rose-600',
      activeBg: 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 border-rose-600',
      hoverBorder: 'hover:border-rose-300',
      iconBg: 'bg-rose-100',
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
            className={`text-left p-4 rounded-2xl transition-all border ${
              isSelected
                ? card.activeBg
                : `bg-white border-slate-200 shadow-sm ${card.hoverBorder}`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isSelected ? 'text-white/90' : 'text-slate-500'
                }`}
              >
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-white/20 text-white' : `${card.iconBg} ${card.color}`
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span
                className={`text-2xl font-extrabold tracking-tight ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}
              >
                {card.count}
              </span>
              {total > 0 && card.id !== 'all' && (
                <span
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-white/80' : 'text-slate-500'
                  }`}
                >
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
