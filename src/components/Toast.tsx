import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-primary/30';
        let bgIconClass = 'bg-primary/10 text-primary';
        let icon = 'check_circle';

        if (toast.type === 'error') {
          borderClass = 'border-error/40';
          bgIconClass = 'bg-error-container text-on-error-container';
          icon = 'error';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40';
          bgIconClass = 'bg-amber-100 text-amber-700';
          icon = 'warning';
        } else if (toast.type === 'info') {
          borderClass = 'border-secondary-container';
          bgIconClass = 'bg-secondary-container text-on-secondary-fixed';
          icon = 'info';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl shadow-lg border ${borderClass} transition-all duration-300 animate-slide-up`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${bgIconClass}`}>
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-title-md text-body-md text-on-surface leading-tight font-semibold">
                {toast.title}
              </div>
              {toast.message && (
                <div className="font-body-sm text-on-surface-variant mt-0.5">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-outline hover:text-on-surface p-0.5 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
