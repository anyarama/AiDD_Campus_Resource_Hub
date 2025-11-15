import React, { useState } from 'react';
import { X, Filter, Search, Calendar } from 'lucide-react';
import { IUButton } from './IUButton';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  search?: {
    placeholder?: string;
    value?: string;
  };
  select?: Array<{
    id: string;
    label: string;
    options: FilterOption[];
    value?: string;
  }>;
  dateRange?: {
    label?: string;
    from?: string;
    to?: string;
  };
  multiSelect?: Array<{
    id: string;
    label: string;
    options: FilterOption[];
    values?: string[];
  }>;
}

export interface ActiveFilters {
  search?: string;
  [key: string]: any;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: FilterConfig;
  activeFilters: ActiveFilters;
  onApply: (filters: ActiveFilters) => void;
  onClear: () => void;
}

/**
 * FilterDrawer Component (Panel/Filters)
 * 
 * Features:
 * - Right-side slide-out panel
 * - Search input
 * - Select dropdowns (Role, Status, Type)
 * - Date range picker
 * - Multi-select options
 * - Apply/Clear actions
 * - Persistent state
 * 
 * Properties:
 * - isOpen: boolean - Drawer visibility
 * - onClose: () => void - Close callback
 * - config: FilterConfig - Filter configuration
 * - activeFilters: ActiveFilters - Current filter values
 * - onApply: (filters) => void - Apply callback
 * - onClear: () => void - Clear callback
 */
export function FilterDrawer({
  isOpen,
  onClose,
  config,
  activeFilters,
  onApply,
  onClear
}: FilterDrawerProps) {
  const [filters, setFilters] = useState<ActiveFilters>(activeFilters);
  
  const handleApply = () => {
    onApply(filters);
    onClose();
  };
  
  const handleClear = () => {
    setFilters({});
    onClear();
  };
  
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-role-surface border-l border-role-border shadow-iu-xl z-50 
          flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label="Filters"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-role-border">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-role-accent" />
            <h3 className="admin-h2">Filters</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-role-surface-muted rounded-token-md transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Search */}
          {config.search && (
            <div>
              <label className="block admin-small text-role-secondary mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-role-secondary" />
                <input
                  type="text"
                  placeholder={config.search.placeholder || 'Search...'}
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-role-surface border border-role-border rounded-token-md admin-small
                    focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20 outline-none
                    placeholder:text-role-secondary"
                />
              </div>
            </div>
          )}
          
          {/* Select Filters */}
          {config.select?.map(select => (
            <div key={select.id}>
              <label className="block admin-small text-role-secondary mb-2">
                {select.label}
              </label>
              <select
                value={filters[select.id] || ''}
                onChange={(e) => updateFilter(select.id, e.target.value)}
                className="w-full px-3 py-2 bg-role-surface border border-role-border rounded-token-md admin-small
                  focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20 outline-none"
              >
                <option value="">All {select.label}</option>
                {select.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          {/* Multi-Select Filters */}
          {config.multiSelect?.map(multiSelect => (
            <div key={multiSelect.id}>
              <label className="block admin-small text-role-secondary mb-2">
                {multiSelect.label}
              </label>
              <div className="space-y-2">
                {multiSelect.options.map(option => {
                  const values = filters[multiSelect.id] || [];
                  const isChecked = values.includes(option.value);
                  
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-role-surface-muted p-2 rounded-token-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...values, option.value]
                            : values.filter((v: string) => v !== option.value);
                          updateFilter(multiSelect.id, newValues);
                        }}
                        className="w-4 h-4 text-role-accent rounded border-role-border 
                          focus:ring-2 focus:ring-[var(--iu-focus)] focus:ring-offset-2"
                      />
                      <span className="admin-small text-role-primary">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Date Range */}
          {config.dateRange && (
            <div>
              <label className="block admin-small text-role-secondary mb-2">
                {config.dateRange.label || 'Date Range'}
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-role-secondary" />
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-role-surface border border-role-border rounded-token-md admin-small
                      focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20 outline-none"
                    placeholder="From"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-role-secondary" />
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-role-surface border border-role-border rounded-token-md admin-small
                      focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20 outline-none"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-role-border bg-role-surface">
          <IUButton variant="ghost" onClick={handleClear}>
            Clear All
          </IUButton>
          <div className="flex gap-2">
            <IUButton variant="outline" onClick={onClose}>
              Cancel
            </IUButton>
            <IUButton onClick={handleApply}>
              Apply Filters
            </IUButton>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Filter Chips Summary
 * 
 * Displays active filters as removable chips at top of page
 */
interface FilterChipsProps {
  filters: ActiveFilters;
  onRemove: (key: string) => void;
  onClear: () => void;
  labels?: Record<string, string>;
}

export function FilterChips({ filters, onRemove, onClear, labels = {} }: FilterChipsProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== null && value !== undefined;
  });
  
  if (activeFilters.length === 0) return null;
  
  return (
    <div className="flex items-center gap-2 flex-wrap p-4 bg-role-surface-muted rounded-token-md border border-role-border">
      <span className="admin-small text-role-secondary">Active filters:</span>
      
      {activeFilters.map(([key, value]) => {
        const label = labels[key] || key;
        const displayValue = Array.isArray(value) 
          ? `${value.length} selected` 
          : value;
        
        return (
          <button
            key={key}
            onClick={() => onRemove(key)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-role-surface border border-role-border 
              rounded-token-md admin-caption hover:bg-role-surface-muted transition-colors group
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
          >
            <span className="text-role-primary">
              {label}: <span className="text-role-accent">{displayValue}</span>
            </span>
            <X className="w-3 h-3 text-role-secondary group-hover:text-role-primary" />
          </button>
        );
      })}
      
      <button
        onClick={onClear}
        className="admin-caption text-role-accent hover:text-role-primary transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2 rounded-token-sm"
      >
        Clear all
      </button>
    </div>
  );
}