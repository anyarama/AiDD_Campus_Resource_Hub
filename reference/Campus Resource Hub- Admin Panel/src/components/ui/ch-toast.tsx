import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * CH/Toast
 * Toast notification component with IU token-based styling
 */

export interface CHToastProps {
  variant?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  description?: string;
  onClose?: () => void;
}

export function CHToast({
  variant = 'info',
  title,
  description,
  onClose,
}: CHToastProps) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-info flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
  };
  
  const styles = {
    success: 'bg-surface border-success',
    error: 'bg-surface border-danger',
    info: 'bg-surface border-info',
    warning: 'bg-surface border-warning',
  };
  
  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-md shadow-lg border-l-4
        ${styles[variant]} animate-slide-up
      `}
    >
      {/* Icon */}
      {icons[variant]}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-caption-semibold text-fg-default mb-1">
            {title}
          </p>
        )}
        {description && (
          <p className="text-caption text-fg-muted">
            {description}
          </p>
        )}
      </div>
      
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-subtle transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-fg-muted" />
        </button>
      )}
    </div>
  );
}

/**
 * Toast container for managing multiple toasts
 */
export function CHToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {children}
    </div>
  );
}
