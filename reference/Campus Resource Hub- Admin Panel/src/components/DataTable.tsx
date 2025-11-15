import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { IUButton } from './IUButton';

export type TableDensity = 'comfortable' | 'compact';
export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  density?: TableDensity;
  loading?: boolean;
  error?: string | null;
  emptyState?: React.ReactNode;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  onSort?: (columnId: string, direction: SortDirection) => void;
  stickyHeader?: boolean;
  className?: string;
}

/**
 * DataTable Component (Data/Table)
 * 
 * Features:
 * - Sortable headers with active indicator
 * - Sticky header on scroll
 * - Row heights: 56px (comfortable), 44px (compact)
 * - Row selection with checkboxes
 * - Bulk selection toolbar
 * - States: loading (skeleton), empty, error
 * 
 * Properties:
 * - columns: TableColumn[] - Column definitions
 * - data: T[] - Table data
 * - density: 'comfortable' | 'compact' - Row height
 * - loading: boolean - Loading state
 * - error: string - Error message
 * - emptyState: ReactNode - Empty state UI
 * - selectable: boolean - Enable row selection
 * - selectedRows: string[] - Selected row IDs
 * - onSelectionChange: (ids) => void - Selection callback
 * - getRowId: (row) => string - Get unique ID from row
 * - onSort: (columnId, direction) => void - Sort callback
 * - stickyHeader: boolean - Sticky header on scroll
 */
export function DataTable<T = any>({
  columns,
  data,
  density = 'comfortable',
  loading = false,
  error = null,
  emptyState,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row: any) => row.id,
  onSort,
  stickyHeader = true,
  className = ''
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const rowHeight = density === 'comfortable' ? 'h-14' : 'h-11'; // 56px vs 44px
  const cellPadding = density === 'comfortable' ? 'px-4 py-3' : 'px-4 py-2';
  
  const handleSort = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column?.sortable) return;
    
    let newDirection: SortDirection = 'asc';
    
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') newDirection = 'desc';
      else if (sortDirection === 'desc') newDirection = null;
    }
    
    setSortColumn(newDirection ? columnId : null);
    setSortDirection(newDirection);
    onSort?.(columnId, newDirection);
  };
  
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(row => getRowId(row)));
    }
  };
  
  const handleSelectRow = (rowId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter(id => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };
  
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < data.length;
  
  // Loading State
  if (loading) {
    return (
      <div className={`bg-role-surface border border-role-border rounded-token-lg overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-role-surface-muted border-b border-role-border ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
              <tr>
                {selectable && (
                  <th className={`${cellPadding} w-12`}>
                    <div className="w-4 h-4 bg-role-surface-muted rounded animate-pulse" />
                  </th>
                )}
                {columns.map(column => (
                  <th key={column.id} className={`text-left ${cellPadding} admin-small text-role-secondary`}>
                    <div className="h-4 w-24 bg-role-surface-muted rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-role-border">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className={rowHeight}>
                  {selectable && (
                    <td className={cellPadding}>
                      <div className="w-4 h-4 bg-role-surface-muted rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.id} className={cellPadding}>
                      <div className="h-4 w-32 bg-role-surface-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 text-role-accent animate-spin" />
          <span className="ml-3 admin-small text-role-secondary">Loading data...</span>
        </div>
      </div>
    );
  }
  
  // Error State
  if (error) {
    return (
      <div className={`bg-role-surface border border-role-border rounded-token-lg overflow-hidden ${className}`}>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-[var(--iu-danger)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[var(--iu-danger)]" />
          </div>
          <h4 className="admin-subtitle text-role-primary mb-2">Error Loading Data</h4>
          <p className="admin-small text-role-secondary mb-4">{error}</p>
          <IUButton variant="outline" onClick={() => window.location.reload()}>
            Retry
          </IUButton>
        </div>
      </div>
    );
  }
  
  // Empty State
  if (data.length === 0) {
    return (
      <div className={`bg-role-surface border border-role-border rounded-token-lg overflow-hidden ${className}`}>
        {emptyState || (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-role-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-role-secondary" />
            </div>
            <h4 className="admin-subtitle text-role-primary mb-2">No Data</h4>
            <p className="admin-small text-role-secondary mb-4">No records found</p>
          </div>
        )}
      </div>
    );
  }
  
  // Table State
  return (
    <div className={`bg-role-surface border border-role-border rounded-token-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className={`bg-role-surface-muted border-b border-role-border ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {selectable && (
                <th className={`${cellPadding} w-12`}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-role-accent rounded border-role-border 
                      focus:ring-2 focus:ring-[var(--iu-focus)] focus:ring-offset-2
                      cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.id}
                  className={`text-left ${cellPadding} admin-small text-role-secondary ${column.width || ''}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="flex items-center gap-2 hover:text-role-primary transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2 rounded-token-sm"
                    >
                      <span>{column.header}</span>
                      {sortColumn === column.id ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4 text-role-accent" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-role-accent" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="divide-y divide-role-border">
            {data.map(row => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.includes(rowId);
              
              return (
                <tr
                  key={rowId}
                  className={`${rowHeight} hover:bg-role-surface-muted transition-colors ${
                    isSelected ? 'bg-[var(--iu-accent)]/5' : ''
                  }`}
                >
                  {selectable && (
                    <td className={cellPadding}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        className="w-4 h-4 text-role-accent rounded border-role-border 
                          focus:ring-2 focus:ring-[var(--iu-focus)] focus:ring-offset-2
                          cursor-pointer"
                        aria-label={`Select row ${rowId}`}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.id} className={`${cellPadding} admin-small`}>
                      {column.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Bulk Selection Toolbar
 * 
 * Displays when rows are selected with action buttons
 */
interface BulkToolbarProps {
  selectedCount: number;
  onClear: () => void;
  actions?: React.ReactNode;
}

export function BulkToolbar({ selectedCount, onClear, actions }: BulkToolbarProps) {
  if (selectedCount === 0) return null;
  
  return (
    <div className="flex items-center justify-between p-4 bg-[var(--iu-accent)]/10 border border-[var(--iu-accent)]/20 rounded-token-md mb-4">
      <div className="flex items-center gap-3">
        <span className="admin-body-medium text-role-primary">
          {selectedCount} selected
        </span>
        <button
          onClick={onClear}
          className="admin-small text-role-accent hover:text-role-primary transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2 rounded-token-sm"
        >
          Clear selection
        </button>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Pagination Component
 * 
 * Per-page selector + numbered navigation
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-role-border bg-role-surface">
      {/* Per-page selector */}
      <div className="flex items-center gap-2">
        <span className="admin-small text-role-secondary">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-1.5 bg-role-surface border border-role-border rounded-token-md admin-small
            focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20 outline-none"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      
      {/* Item count */}
      <div className="admin-small text-role-secondary">
        {startItem}–{endItem} of {totalItems}
      </div>
      
      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 admin-small text-role-secondary hover:text-role-primary hover:bg-role-surface-muted 
            rounded-token-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
        >
          Previous
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1.5 admin-small text-role-secondary">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1.5 admin-small rounded-token-md transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2
                ${currentPage === page 
                  ? 'bg-role-accent text-white' 
                  : 'text-role-secondary hover:text-role-primary hover:bg-role-surface-muted'
                }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 admin-small text-role-secondary hover:text-role-primary hover:bg-role-surface-muted 
            rounded-token-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}
