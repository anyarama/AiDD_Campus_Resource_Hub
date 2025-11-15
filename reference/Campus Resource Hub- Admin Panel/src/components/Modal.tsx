import React, { useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { IUButton } from './IUButton';

export type ModalSize = 'sm' | 'md' | 'lg';
export type ConfirmationType = 'approve' | 'reject' | 'suspend' | 'delete' | 'warning';

/**
 * Modal Sizes
 * - sm: 480px
 * - md: 640px
 * - lg: 800px
 */
const modalSizes = {
  sm: 'max-w-[480px]',
  md: 'max-w-[640px]',
  lg: 'max-w-[800px]'
};

/**
 * Base Modal Component
 * 
 * Features:
 * - Keyboard focus trap
 * - ESC to close
 * - Backdrop click to close (optional)
 * - ARIA attributes for accessibility
 * - Sizes: sm (480), md (640), lg (800)
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  footer,
  className = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);
  
  // ESC to close
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          className={`
            w-full ${modalSizes[size]}
            bg-role-surface 
            border border-role-border 
            rounded-token-lg 
            shadow-iu-xl
            animate-slide-up
            ${className}
          `}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-role-border">
              <h3 id="modal-title" className="admin-h2 text-role-primary">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-role-surface-muted rounded-token-md transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-role-secondary" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Confirmation Modal
 * 
 * Pre-configured for common actions:
 * - Approve (green, CheckCircle)
 * - Reject (red, XCircle)
 * - Suspend (orange, AlertTriangle)
 * - Delete (red, AlertCircle)
 * - Warning (orange, AlertTriangle)
 */
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: ConfirmationType;
  title: string;
  message: string;
  consequence?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  size?: ModalSize;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  consequence,
  confirmLabel,
  cancelLabel = 'Cancel',
  loading,
  size = 'sm'
}: ConfirmationModalProps) {
  const config = {
    approve: {
      icon: CheckCircle,
      iconColor: 'text-[var(--iu-success)]',
      iconBg: 'bg-[var(--iu-success)]/10',
      confirmVariant: 'default' as const,
      defaultLabel: 'Approve'
    },
    reject: {
      icon: XCircle,
      iconColor: 'text-[var(--iu-danger)]',
      iconBg: 'bg-[var(--iu-danger)]/10',
      confirmVariant: 'destructive' as const,
      defaultLabel: 'Reject'
    },
    suspend: {
      icon: AlertTriangle,
      iconColor: 'text-[var(--iu-warning)]',
      iconBg: 'bg-[var(--iu-warning)]/10',
      confirmVariant: 'destructive' as const,
      defaultLabel: 'Suspend'
    },
    delete: {
      icon: AlertCircle,
      iconColor: 'text-[var(--iu-danger)]',
      iconBg: 'bg-[var(--iu-danger)]/10',
      confirmVariant: 'destructive' as const,
      defaultLabel: 'Delete'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-[var(--iu-warning)]',
      iconBg: 'bg-[var(--iu-warning)]/10',
      confirmVariant: 'default' as const,
      defaultLabel: 'Confirm'
    }
  };
  
  const { icon: Icon, iconColor, iconBg, confirmVariant, defaultLabel } = config[type];
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <div className="flex flex-col gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        {/* Title */}
        <h3 className="admin-h2 text-role-primary">{title}</h3>
        
        {/* Message */}
        <p className="admin-body-medium text-role-secondary">{message}</p>
        
        {/* Consequence */}
        {consequence && (
          <div className={`p-3 ${iconBg} border border-${type === 'approve' ? '[var(--iu-success)]' : type === 'delete' || type === 'reject' ? '[var(--iu-danger)]' : '[var(--iu-warning)]'}/20 rounded-token-md`}>
            <p className="admin-small text-role-primary">{consequence}</p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <IUButton
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </IUButton>
          <IUButton
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : (confirmLabel || defaultLabel)}
          </IUButton>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Form Modal
 * 
 * Modal wrapper for forms with built-in actions footer
 */
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  size?: ModalSize;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  size = 'md',
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled,
  loading,
  children
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit}>
        {children}
        
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-role-border">
          <IUButton
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </IUButton>
          <IUButton
            type="submit"
            disabled={submitDisabled || loading}
          >
            {loading ? 'Saving...' : submitLabel}
          </IUButton>
        </div>
      </form>
    </Modal>
  );
}
