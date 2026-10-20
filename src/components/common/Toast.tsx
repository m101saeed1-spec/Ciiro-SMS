import React, { useEffect } from 'react';
import { useSchoolData, ToastType } from '../../context/SchoolDataContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

let toastDispatch: ((message: string, type?: ToastType, title?: string) => void) | null = null;

export const showToast = (message: string, type: ToastType = 'info', title?: string) => {
  if (toastDispatch) {
    toastDispatch(message, type, title);
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, addToast } = useSchoolData();

  useEffect(() => {
    toastDispatch = (msg: string, type: ToastType = 'info', title?: string) => {
      addToast(title ? { title, message: msg, type } : { message: msg, type });
    };
    return () => {
      toastDispatch = null;
    };
  }, [addToast]);

  if (!toasts.length) return null;


  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info' || (!isSuccess && !isError && !isWarning);

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-2xl shadow-xl border text-xs transition-all duration-200 animate-slide-up backdrop-blur-md ${
              isSuccess
                ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800/80 text-slate-800 dark:text-slate-100 shadow-emerald-500/10'
                : isError
                ? 'bg-white/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-800/80 text-slate-800 dark:text-slate-100 shadow-rose-500/10'
                : isWarning
                ? 'bg-white/95 dark:bg-slate-900/95 border-amber-200 dark:border-amber-800/80 text-slate-800 dark:text-slate-100 shadow-amber-500/10'
                : 'bg-white/95 dark:bg-slate-900/95 border-[#3B82F6]/30 text-slate-800 dark:text-slate-100 shadow-blue-500/10'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0 pr-2">
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {isInfo && <Info className="w-5 h-5 text-[#3B82F6] dark:text-[#60A5FA]" />}
              </div>
              <div className="min-w-0 flex-1">
                {toast.title && (
                  <p className="font-bold text-slate-900 dark:text-white text-xs mb-0.5 truncate">
                    {String(toast.title)}
                  </p>
                )}
                <p className="font-medium text-slate-600 dark:text-slate-300 text-xs leading-relaxed break-words">
                  {typeof toast.message === 'string' ? toast.message : JSON.stringify(toast.message)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Close notification"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
