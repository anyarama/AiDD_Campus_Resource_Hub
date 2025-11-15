import React from 'react';
import { LucideIcon } from 'lucide-react';

export type DeltaDirection = 'up' | 'down' | 'flat';

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  deltaDirection: DeltaDirection;
  deltaValue: string;
  period?: string;
  className?: string;
}

/**
 * KPI Card Component (Data/KPI Card)
 * 
 * Structure:
 * - Icon (20px) → Label (Admin/Small) → Value (Admin/H2) → Delta chip (+/- %)
 * 
 * Styling:
 * - Padding: 20px (p-5)
 * - Border radius: 12px (rounded-token-lg)
 * - Shadow: sm (shadow-iu-sm)
 * - Background: Role/Surface
 * 
 * Value Color: TextPrimary
 * Delta Colors: Success/Warning/Danger tokens
 * 
 * Properties:
 * - icon: LucideIcon - Icon component (20px rendered)
 * - label: string - Metric name (Admin/Small)
 * - value: string | number - Main metric value (Admin/H2)
 * - deltaDirection: 'up' | 'down' | 'flat' - Direction of change
 * - deltaValue: string - Delta percentage/value
 * - period: string - Comparison period (e.g., "vs last month")
 */
export function KPICard({
  icon: Icon,
  label,
  value,
  deltaDirection,
  deltaValue,
  period = 'vs last period',
  className = ''
}: KPICardProps) {
  const deltaConfig = {
    up: {
      color: 'text-[var(--iu-success)]',
      bg: 'bg-[var(--iu-success)]/10',
      border: 'border-[var(--iu-success)]/20',
      symbol: '↑'
    },
    down: {
      color: 'text-[var(--iu-danger)]',
      bg: 'bg-[var(--iu-danger)]/10',
      border: 'border-[var(--iu-danger)]/20',
      symbol: '↓'
    },
    flat: {
      color: 'text-[var(--iu-warning)]',
      bg: 'bg-[var(--iu-warning)]/10',
      border: 'border-[var(--iu-warning)]/20',
      symbol: '→'
    }
  };
  
  // Safely get delta config with fallback to 'flat'
  const delta = deltaConfig[deltaDirection] || deltaConfig.flat;
  
  return (
    <div 
      className={`p-5 rounded-token-lg shadow-iu-sm bg-role-surface border border-role-border ${className}`}
      role="region"
      aria-label={`${label} KPI card`}
    >
      <div className="flex flex-col gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-token-md bg-role-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-role-accent" aria-hidden="true" />
        </div>
        
        {/* Label */}
        <div>
          <p className="admin-small text-role-secondary">{label}</p>
        </div>
        
        {/* Value */}
        <div>
          <h3 className="admin-h2 text-role-primary">{value}</h3>
        </div>
        
        {/* Delta Chip */}
        <div className="flex items-center gap-2">
          <div 
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-token-sm border ${delta.bg} ${delta.border} ${delta.color}`}
          >
            <span className="admin-caption" aria-hidden="true">{delta.symbol}</span>
            <span className="admin-caption">{deltaValue}</span>
          </div>
          {period && (
            <span className="admin-caption text-role-secondary">{period}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * KPI Row - Convenience wrapper for 4 KPI cards
 * Uses the KPIRow layout from AdminLayout
 */
interface KPIRowProps {
  children: React.ReactNode;
}

export function KPICardRow({ children }: KPIRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}