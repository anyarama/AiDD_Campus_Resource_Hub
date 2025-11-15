import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * CH/Sheet (Filter Drawer)
 * Right slide-in drawer, 360px, 40% black overlay, close on ESC
 */

export interface CHSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function CHSheet({
  isOpen,
  onClose,
  title,
  children,
}: CHSheetProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when open
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
      {/* Overlay - 40% black */}
      <div
        className="fixed inset-0 bg-brand-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet - 360px right slide-in */}
      <div className="fixed inset-y-0 right-0 z-50 w-[360px] bg-surface shadow-lg animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default">
          {title && <h3 className="text-h4 text-fg-default">{title}</h3>}
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-subtle transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-fg-muted" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}

export interface CHSheetHeaderProps {
  children: React.ReactNode;
}

export function CHSheetHeader({ children }: CHSheetHeaderProps) {
  return <div className="mb-6">{children}</div>;
}

export interface CHSheetTitleProps {
  children: React.ReactNode;
}

export function CHSheetTitle({ children }: CHSheetTitleProps) {
  return <h3 className="text-h4 text-fg-default">{children}</h3>;
}

export interface CHSheetFooterProps {
  children: React.ReactNode;
}

export function CHSheetFooter({ children }: CHSheetFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t border-default bg-surface">
      {children}
    </div>
  );
}
