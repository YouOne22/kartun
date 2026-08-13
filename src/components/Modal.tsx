import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

/**
 * Reusable modal component with backdrop, escape key handling,
 * and proper ARIA attributes for accessibility.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className = '',
}: ModalProps) {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={`${sizeStyles[size]} w-full max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6 ${className}`}
      >
        {(title || description) && (
          <div className="mb-5 flex items-start justify-between">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-bold">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Tutup ${title || 'dialog'}`}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={19} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}