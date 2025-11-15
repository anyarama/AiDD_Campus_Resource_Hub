import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, MoreVertical } from 'lucide-react';

interface ListCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * List Card Component
 * 
 * Container for list/table content with consistent styling
 * - Padding: 20-24px
 * - Shadow: sm
 * - Section header: Admin/Subtitle
 */
export function ListCard({ title, children, action, className = '' }: ListCardProps) {
  return (
    <div 
      className={`bg-role-surface border border-role-border rounded-token-lg shadow-iu-sm ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="p-5 border-b border-role-border">
        <div className="flex items-center justify-between gap-4">
          <h4 className="admin-subtitle text-role-primary">{title}</h4>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
      
      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
}

/**
 * Pending Approval Item Component
 */
interface PendingApprovalItemProps {
  id: string;
  type: 'booking' | 'resource' | 'user';
  title: string;
  subtitle: string;
  timestamp: string;
  status: 'pending' | 'urgent';
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function PendingApprovalItem({
  id,
  type,
  title,
  subtitle,
  timestamp,
  status,
  onApprove,
  onReject
}: PendingApprovalItemProps) {
  const typeIcons = {
    booking: '📅',
    resource: '📦',
    user: '👤'
  };
  
  return (
    <div className="p-4 border-b border-role-border last:border-b-0 hover:bg-role-surface-muted transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-token-md bg-role-surface-muted flex items-center justify-center flex-shrink-0">
          <span className="text-lg" aria-hidden="true">{typeIcons[type]}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h5 className="admin-body-medium text-role-primary">{title}</h5>
            {status === 'urgent' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--iu-danger)]/10 border border-[var(--iu-danger)]/20 text-[var(--iu-danger)] rounded-token-sm admin-caption flex-shrink-0">
                <AlertCircle className="w-3 h-3" />
                Urgent
              </span>
            )}
          </div>
          
          <p className="admin-small text-role-secondary mb-2">{subtitle}</p>
          
          <div className="flex items-center gap-2 admin-caption text-role-secondary">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>{timestamp}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onApprove && (
            <button
              onClick={() => onApprove(id)}
              className="px-3 py-1.5 bg-[var(--iu-success)] text-white rounded-token-md admin-caption hover:bg-[var(--iu-success)]/90 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
              aria-label={`Approve ${title}`}
            >
              Approve
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(id)}
              className="px-3 py-1.5 border border-role-border text-role-secondary rounded-token-md admin-caption hover:bg-role-surface-muted transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
              aria-label={`Reject ${title}`}
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Recent Activity Item Component (Timeline style)
 */
interface ActivityItemProps {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected';
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export function ActivityItem({
  type,
  user,
  action,
  target,
  timestamp
}: ActivityItemProps) {
  const typeConfig = {
    created: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-[var(--iu-success)]',
      bg: 'bg-[var(--iu-success)]/10'
    },
    updated: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-[var(--iu-info)]',
      bg: 'bg-[var(--iu-info)]/10'
    },
    deleted: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-[var(--iu-danger)]',
      bg: 'bg-[var(--iu-danger)]/10'
    },
    approved: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-[var(--iu-success)]',
      bg: 'bg-[var(--iu-success)]/10'
    },
    rejected: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-[var(--iu-danger)]',
      bg: 'bg-[var(--iu-danger)]/10'
    }
  };
  
  const config = typeConfig[type];
  
  return (
    <div className="p-4 border-b border-role-border last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Timeline dot */}
        <div className={`w-8 h-8 rounded-full ${config.bg} ${config.color} flex items-center justify-center flex-shrink-0`}>
          {config.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="admin-small text-role-primary">
            <span className="font-medium">{user}</span> {action}{' '}
            <span className="font-medium">{target}</span>
          </p>
          <p className="admin-caption text-role-secondary mt-1">{timestamp}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component for Lists
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-12 text-center">
      {icon && (
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-role-surface-muted flex items-center justify-center text-role-secondary">
            {icon}
          </div>
        </div>
      )}
      <h5 className="admin-body-medium text-role-primary mb-2">{title}</h5>
      {description && (
        <p className="admin-small text-role-secondary mb-4 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Table List Component
 * 
 * Simple table layout for list cards
 */
interface TableListProps {
  headers: string[];
  rows: React.ReactNode[][];
  emptyState?: React.ReactNode;
}

export function TableList({ headers, rows, emptyState }: TableListProps) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-role-surface-muted border-b border-role-border">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index}
                className="px-4 py-3 text-left admin-small text-role-secondary"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-role-border">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-role-surface-muted transition-colors">
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex}
                  className="px-4 py-3 admin-small"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
