import React from 'react';
import { AlertTriangle, X, Check, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  confirmLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="flex items-start gap-3.5">
          <div className={cn(
            "p-2.5 rounded-xl shrink-0 mt-0.5",
            type === 'danger' && "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
            type === 'warning' && "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
            type === 'info' && "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
          )}>
            {type === 'info' ? <Info className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-modal-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={confirmLoading}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={confirmLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading}
            className={cn(
              "px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50",
              type === 'danger' && "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
              type === 'warning' && "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
              type === 'info' && "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20"
            )}
          >
            {confirmLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
