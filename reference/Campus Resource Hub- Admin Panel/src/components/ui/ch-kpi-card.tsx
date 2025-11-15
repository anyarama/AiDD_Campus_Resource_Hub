import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { CHBadge } from './ch-badge';

/**
 * CH/KPICard - Standardized KPI Card
 * 
 * Features:
 * - Card header: left = title, right = icon
 * - KPI number uses h1 token
 * - Change uses CHBadge with arrow icon (up green, down red)
 * - Hover elevation with 120ms ease-in transition
 * - Consistent icon stroke weight (strokeWidth={2})
 */

export interface CHKPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CHKPICard({
  title,
  value,
  change,
  trend,
  icon,
  onClick,
  className = '',
}: CHKPICardProps) {
  return (
    <div 
      className={`
        flex flex-col gap-3 p-5
        bg-surface border border-default rounded-lg
        shadow-sm
        transition-all duration-[120ms] ease-in
        hover:shadow-card hover:border-brand-crimson/20
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Card Header: Left = Title, Right = Icon */}
      <div className="flex items-start justify-between">
        <span className="text-caption text-fg-muted">
          {title}
        </span>
        
        {icon && (
          <div className="w-10 h-10 rounded-md bg-brand-crimson/5 flex items-center justify-center text-brand-crimson shrink-0">
            {icon}
          </div>
        )}
      </div>
      
      {/* KPI Number - Uses h1 token */}
      <div>
        <h3 className="text-h1 text-fg-default">
          {value}
        </h3>
      </div>
      
      {/* Change Badge - Uses CHBadge with arrow icon */}
      {change && trend && (
        <div>
          <CHBadge
            variant={trend === 'up' ? 'success' : 'danger'}
            size="sm"
          >
            <div className="flex items-center gap-1">
              {trend === 'up' && <ArrowUp className="w-3 h-3" strokeWidth={2.5} />}
              {trend === 'down' && <ArrowDown className="w-3 h-3" strokeWidth={2.5} />}
              <span>{change}</span>
            </div>
          </CHBadge>
        </div>
      )}
    </div>
  );
}
