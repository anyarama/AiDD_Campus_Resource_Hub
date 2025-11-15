import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IUButton } from './IUButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-[var(--iu-surface-muted)] flex items-center justify-center">
        <Icon className="w-8 h-8 text-iu-secondary" />
      </div>
      <h4 className="text-iu-primary mb-2">{title}</h4>
      <p className="text-iu-secondary max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {onAction && actionLabel && (
          <IUButton onClick={onAction}>{actionLabel}</IUButton>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <IUButton variant="secondary" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </IUButton>
        )}
      </div>
    </div>
  );
}
