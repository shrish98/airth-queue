import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-slate-900 border-emerald-500/40 text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    error: {
      bg: 'bg-slate-900 border-rose-500/40 text-rose-300',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
    },
    info: {
      bg: 'bg-slate-900 border-indigo-500/40 text-indigo-300',
      icon: Info,
      iconColor: 'text-indigo-400',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 transition-all animate-bounce-in glass-panel ${config.bg}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-xs">
        <div className="font-bold text-white text-sm">{toast.title}</div>
        {toast.message && <div className="text-slate-300 mt-0.5">{toast.message}</div>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
