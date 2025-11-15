import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * CH/Table
 * Table component with sticky header, row hover, sortable columns, checkbox selection
 * Density: comfortable | compact
 */

export interface CHTableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface CHTableProps<T = any> {
  columns: CHTableColumn<T>[];
  data: T[];
  density?: 'comfortable' | 'compact';
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedRows: Set<string>) => void;
  getRowId?: (row: T) => string;
  onSort?: (columnKey: string, direction: 'asc' | 'desc' | null) => void;
}

export function CHTable<T = any>({
  columns,
  data,
  density = 'comfortable',
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (_, index) => String(index),
  onSort,
}: CHTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  const densityStyles = {
    comfortable: 'py-4',
    compact: 'py-3',
  };
  
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;
    
    let newDirection: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig?.key === columnKey) {
      if (sortConfig.direction === 'asc') {
        newDirection = 'desc';
      } else {
        newDirection = null;
        setSortConfig(null);
      }
    }
    
    if (newDirection) {
      setSortConfig({ key: columnKey, direction: newDirection });
    } else {
      setSortConfig(null);
    }
    
    onSort?.(columnKey, newDirection);
  };
  
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedRows.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row, idx) => getRowId(row, idx))));
    }
  };
  
  const handleSelectRow = (rowId: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    onSelectionChange(newSelection);
  };
  
  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;
  
  return (
    <div className="w-full border border-default rounded-lg overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Sticky Header */}
          <thead className="bg-subtle border-b border-default sticky top-0 z-10">
            <tr>
              {/* Selection Column */}
              {selectable && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-default text-brand-crimson focus:ring-2 focus:ring-brand-crimson cursor-pointer"
                  />
                </th>
              )}
              
              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-caption-semibold text-fg-default ${
                    column.width || ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-brand-crimson transition-colors"
                    >
                      {column.header}
                      <span className="text-fg-muted">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody>
            {data.map((row, rowIndex) => {
              const rowId = getRowId(row, rowIndex);
              const isSelected = selectedRows.has(rowId);
              
              return (
                <tr
                  key={rowId}
                  className={`
                    border-b border-muted last:border-0
                    transition-colors duration-150
                    ${isSelected ? 'bg-[#F9F7F6]' : 'hover:bg-[#F9F7F6]'}
                    ${selectable ? 'cursor-pointer' : ''}
                  `}
                  onClick={selectable ? () => handleSelectRow(rowId) : undefined}
                >
                  {/* Selection Column */}
                  {selectable && (
                    <td className={`px-4 ${densityStyles[density]}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        className="w-4 h-4 rounded border-default text-brand-crimson focus:ring-2 focus:ring-brand-crimson cursor-pointer"
                      />
                    </td>
                  )}
                  
                  {/* Data Columns */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 ${densityStyles[density]} text-caption text-fg-default`}
                    >
                      {column.render
                        ? column.render(row)
                        : String((row as any)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-body text-fg-muted">No data available</p>
        </div>
      )}
    </div>
  );
}