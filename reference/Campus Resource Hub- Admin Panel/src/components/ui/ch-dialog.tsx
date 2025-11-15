import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

/**
 * CH/Dialog
 * Token-compliant dialog component
 * - Uses design system colors
 * - Consistent spacing (4pt grid)
 * - Accessible focus states
 */

export interface CHDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CHDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}: CHDialogProps) {
  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={`bg-surface border-border-default ${maxWidthClasses[maxWidth]}`}>
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle className="text-h3 text-fg-default">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-body text-fg-muted">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        <div className="overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <DialogFooter className="gap-3 sticky bottom-0 bg-surface pt-4 -mb-2">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export base components for advanced usage
export {
  Dialog as CHDialogRoot,
  DialogTrigger as CHDialogTrigger,
  DialogContent as CHDialogContent,
  DialogHeader as CHDialogHeader,
  DialogTitle as CHDialogTitle,
  DialogDescription as CHDialogDescription,
  DialogFooter as CHDialogFooter,
};