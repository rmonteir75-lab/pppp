import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export interface ToastProps {
  message: string;
  type?: ToastType;
  title?: string;
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  title,
  onClose,
  durationMs = 4000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] animate-fade-in pointer-events-auto">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
          type === 'success'
            ? 'bg-slate-950/95 text-white border-emerald-500/60 shadow-emerald-950/40'
            : type === 'error'
            ? 'bg-slate-950/95 text-white border-rose-500/60 shadow-rose-950/40'
            : 'bg-slate-950/95 text-white border-amber-500/60 shadow-amber-950/40'
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {type === 'info' && <Info className="w-5 h-5 text-amber-400" />}
        </div>

        <div className="flex-1 min-w-0">
          {title && <div className="text-xs font-black tracking-wide">{title}</div>}
          <p className="text-xs text-slate-200 leading-snug break-words">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md animate-fade-in transition-all ${
            toast.type === 'success'
              ? 'bg-slate-950/95 text-white border-emerald-500/60 shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-slate-950/95 text-white border-rose-500/60 shadow-rose-950/40'
              : 'bg-slate-950/95 text-white border-amber-500/60 shadow-amber-950/40'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-400" />}
          </div>

          <div className="flex-1 min-w-0">
            {toast.title && <div className="text-xs font-black tracking-wide">{toast.title}</div>}
            {toast.message && (
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
