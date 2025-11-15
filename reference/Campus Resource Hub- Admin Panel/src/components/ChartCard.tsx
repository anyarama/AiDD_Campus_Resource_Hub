import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';

export type TimeRange = 'week' | 'month' | 'quarter' | 'year';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showTimeRangeSelector?: boolean;
  showDownload?: boolean;
  footer?: React.ReactNode;
  minHeight?: string;
  className?: string;
}

/**
 * Chart Card Component (for Chart.js)
 * 
 * Specifications:
 * - Minimum size: 560×320px
 * - Padding: 20-24px (p-5 to p-6)
 * - Shadow: md (shadow-iu-md)
 * - Background: Role/Surface
 * 
 * Structure:
 * - Header: Title + Time Range Pills (Week/Month/Quarter) + Download
 * - Legend Row: Placeholder for chart legend
 * - Chart Container: Canvas area with 16px inner padding
 * - Footer: Min/max/last-updated metadata
 * 
 * Properties:
 * - title: string - Chart title
 * - timeRange: 'week' | 'month' | 'quarter' | 'year'
 * - onTimeRangeChange: callback
 * - showTimeRangeSelector: boolean
 * - showDownload: boolean
 * - footer: React.ReactNode - Footer content
 * - minHeight: string - Minimum height override
 */
export function ChartCard({
  title,
  children,
  timeRange = 'week',
  onTimeRangeChange,
  showTimeRangeSelector = true,
  showDownload = true,
  footer,
  minHeight = '320px',
  className = ''
}: ChartCardProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRange);
  
  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    onTimeRangeChange?.(range);
  };
  
  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];
  
  return (
    <div 
      className={`bg-role-surface border border-role-border rounded-token-lg shadow-iu-md ${className}`}
      style={{ minWidth: '280px', minHeight }}
      role="region"
      aria-label={`${title} chart`}
    >
      {/* Header */}
      <div className="p-5 border-b border-role-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h4 className="admin-h2 text-role-primary truncate">{title}</h4>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Time Range Pills */}
            {showTimeRangeSelector && (
              <div className="inline-flex items-center gap-1 p-1 bg-role-surface-muted rounded-token-md">
                {timeRanges.map(range => (
                  <button
                    key={range.value}
                    onClick={() => handleRangeChange(range.value)}
                    className={`px-3 py-1.5 rounded-token-sm admin-caption transition-all ${
                      selectedRange === range.value
                        ? 'bg-role-surface text-role-primary shadow-iu-sm'
                        : 'text-role-secondary hover:text-role-primary'
                    }`}
                    aria-pressed={selectedRange === range.value}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Download Button */}
            {showDownload && (
              <button
                className="p-2 text-role-secondary hover:text-role-primary hover:bg-[var(--iu-accent-hover)] rounded-token-md transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
                aria-label="Download chart data"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Chart Container with 16px inner padding */}
      <div className="p-4">
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="px-5 pb-5 pt-3 border-t border-role-border">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Chart Container Component
 * 
 * Wrapper for canvas element with proper padding and aspect ratio
 * - Inner padding: 16px
 * - Responsive height
 * - Canvas area designated
 */
interface ChartContainerProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
}

export function ChartContainer({ 
  children, 
  height = '280px',
  className = '' 
}: ChartContainerProps) {
  return (
    <div 
      className={`w-full ${className}`}
      style={{ height }}
    >
      {children}
    </div>
  );
}

/**
 * Chart Footer Component
 * 
 * Displays metadata like min/max/last-updated
 */
interface ChartFooterProps {
  stats?: Array<{ label: string; value: string; color?: string }>;
  lastUpdated?: string;
}

export function ChartFooter({ stats, lastUpdated }: ChartFooterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              {stat.color && (
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: stat.color }}
                  aria-hidden="true"
                />
              )}
              <span className="admin-caption text-role-secondary">{stat.label}:</span>
              <span className="admin-small text-role-primary">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
      
      {lastUpdated && (
        <div className="flex items-center gap-2 text-role-secondary">
          <Calendar className="w-3 h-3" aria-hidden="true" />
          <span className="admin-caption">Updated {lastUpdated}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Chart Legend Component
 * 
 * Placeholder for chart legend with consistent styling
 */
interface ChartLegendProps {
  items: Array<{ label: string; color: string; value?: string }>;
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="admin-small text-role-primary">{item.label}</span>
          {item.value && (
            <span className="admin-caption text-role-secondary">({item.value})</span>
          )}
        </div>
      ))}
    </div>
  );
}
