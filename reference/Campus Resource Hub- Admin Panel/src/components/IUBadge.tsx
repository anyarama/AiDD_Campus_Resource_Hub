import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface IUBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function IUBadge({ variant = 'default', children, className = '' }: IUBadgeProps) {
  const variantStyles = {
    default: 'bg-[var(--iu-crimson)] text-white',
    success: 'bg-[var(--iu-success)] text-white',
    warning: 'bg-[var(--iu-warning)] text-white',
    danger: 'bg-[var(--iu-danger)] text-white',
    info: 'bg-[var(--iu-info)] text-white',
    neutral: 'bg-[var(--iu-neutral-200)] text-[var(--iu-neutral-700)]'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-[var(--radius-sm)] text-caption ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface IUChipProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function IUChip({ children, onRemove, className = '' }: IUChipProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--iu-surface-muted)] text-iu-primary text-sm border border-iu ${className}`}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-iu-crimson transition-colors"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
