'use client';

import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isPending = false,
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-10 h-10 text-red-600" />,
      buttonClass: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-50'
    },
    warning: {
      icon: <AlertTriangle className="w-10 h-10 text-amber-600" />,
      buttonClass: 'bg-amber-600 hover:bg-amber-700',
      iconBg: 'bg-amber-50'
    },
    info: {
      icon: <AlertTriangle className="w-10 h-10 text-blue-600" />,
      buttonClass: 'bg-[#071a4a] hover:bg-[#050f2e]',
      iconBg: 'bg-blue-50'
    }
  };

  const { icon, buttonClass, iconBg } = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={`mx-auto w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mb-4`}>
            {icon}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-8 mx-auto max-w-[240px]">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${buttonClass} disabled:opacity-50`}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
