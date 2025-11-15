import React from 'react';

export type TableDensity = 'comfortable' | 'compact';

interface AdminTableProps {
  children: React.ReactNode;
  density?: TableDensity;
  className?: string;
}

interface AdminTableHeaderProps {
  children: React.ReactNode;
  density?: TableDensity;
}

interface AdminTableBodyProps {
  children: React.ReactNode;
  density?: TableDensity;
}

interface AdminTableRowProps {
  children: React.ReactNode;
  density?: TableDensity;
  className?: string;
}

interface AdminTableCellProps {
  children: React.ReactNode;
  density?: TableDensity;
  as?: 'th' | 'td';
  className?: string;
}

/**
 * Admin Table Component
 * 
 * Density Variants:
 * - comfortable: 56px row height (default for admin pages)
 * - compact: 44px row height (for dense data tables)
 * 
 * Usage:
 * <AdminTable density="compact">
 *   <AdminTableHeader>
 *     <AdminTableRow>
 *       <AdminTableCell as="th">Name</AdminTableCell>
 *     </AdminTableRow>
 *   </AdminTableHeader>
 *   <AdminTableBody>
 *     <AdminTableRow>
 *       <AdminTableCell>John Doe</AdminTableCell>
 *     </AdminTableRow>
 *   </AdminTableBody>
 * </AdminTable>
 */

export function AdminTable({ children, density = 'comfortable', className = '' }: AdminTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`} data-density={density}>
        {children}
      </table>
    </div>
  );
}

export function AdminTableHeader({ children, density = 'comfortable' }: AdminTableHeaderProps) {
  return (
    <thead className="bg-role-surface-muted border-b border-role-border" data-density={density}>
      {children}
    </thead>
  );
}

export function AdminTableBody({ children, density = 'comfortable' }: AdminTableBodyProps) {
  return (
    <tbody className="divide-y divide-[var(--iu-border)]" data-density={density}>
      {children}
    </tbody>
  );
}

export function AdminTableRow({ children, density = 'comfortable', className = '' }: AdminTableRowProps) {
  const heightClass = density === 'compact' ? 'h-11' : 'h-14';
  
  return (
    <tr 
      className={`hover:bg-role-surface-muted transition-colors ${heightClass} ${className}`}
      data-density={density}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({ 
  children, 
  density = 'comfortable', 
  as = 'td',
  className = '' 
}: AdminTableCellProps) {
  const paddingClass = density === 'compact' ? 'px-4 py-2' : 'p-token-6';
  const Component = as;
  
  return (
    <Component className={`${paddingClass} text-left admin-small ${className}`} data-density={density}>
      {children}
    </Component>
  );
}

/**
 * Table Density Toggle Component
 * Allows users to switch between comfortable/compact views
 */
interface TableDensityToggleProps {
  density: TableDensity;
  onChange: (density: TableDensity) => void;
}

export function TableDensityToggle({ density, onChange }: TableDensityToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 p-1 bg-role-surface-muted rounded-token-md">
      <button
        onClick={() => onChange('comfortable')}
        className={`px-3 py-1.5 rounded-token-sm admin-small transition-all ${
          density === 'comfortable'
            ? 'bg-role-surface text-role-primary shadow-iu-sm'
            : 'text-role-secondary hover:text-role-primary'
        }`}
        aria-pressed={density === 'comfortable'}
      >
        Comfortable
      </button>
      <button
        onClick={() => onChange('compact')}
        className={`px-3 py-1.5 rounded-token-sm admin-small transition-all ${
          density === 'compact'
            ? 'bg-role-surface text-role-primary shadow-iu-sm'
            : 'text-role-secondary hover:text-role-primary'
        }`}
        aria-pressed={density === 'compact'}
      >
        Compact
      </button>
    </div>
  );
}
