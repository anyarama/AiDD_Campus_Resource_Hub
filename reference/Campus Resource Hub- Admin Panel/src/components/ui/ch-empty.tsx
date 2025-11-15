import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * CH/Empty
 * Empty state component with IU token-based styling
 */

export interface CHEmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function CHEmpty({
  icon,
  title,
  description,
  action,
}: CHEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-lg bg-subtle flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-fg-muted" />}
      </div>
      
      {/* Title */}
      <h3 className="text-h4 text-fg-default mb-2">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="text-body text-fg-muted mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
}
