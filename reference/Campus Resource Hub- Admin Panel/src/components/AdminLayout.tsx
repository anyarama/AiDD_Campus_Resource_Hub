import React from 'react';
import { ChevronRight } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  title: string;
  actions?: React.ReactNode;
}

/**
 * Admin Layout Component
 * 
 * Grid System:
 * - Desktop (1440px): 12 columns, max-width 1200px, 24px gutters
 * - Tablet (1024px): 8 columns, fluid, 24px gutters
 * - Mobile (375px): 4 columns, fluid, 16px gutters
 * 
 * Layout:
 * - Sidebar: Fixed width (60px collapsed, 240px expanded)
 * - Content: Fluid within max-width constraint
 * - Padding: 24px (desktop/tablet), 16px (mobile)
 */
export function AdminLayout({ children, breadcrumbs, title, actions }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <div className="admin-header bg-role-surface border-b border-role-border">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-6 md:px-6 sm:px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Breadcrumbs + Title */}
            <div className="flex-1 min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-2">
                  <ol className="flex items-center gap-2 admin-small">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {index > 0 && (
                          <ChevronRight className="w-4 h-4 text-role-secondary" />
                        )}
                        <span className={index === breadcrumbs.length - 1 ? 'text-role-primary' : 'text-role-secondary'}>
                          {crumb.label}
                        </span>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <h1 className="admin-h1">{title}</h1>
            </div>
            
            {/* Right: Actions */}
            {actions && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="admin-content">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-6 md:px-6 sm:px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Grid Container
 * Responsive 12/8/4 column grid
 */
export function AdminGrid({ children, cols = 12, className = '' }: { 
  children: React.ReactNode; 
  cols?: 4 | 8 | 12;
  className?: string;
}) {
  const gridClasses = {
    12: 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
    8: 'grid-cols-4 md:grid-cols-8',
    4: 'grid-cols-4'
  };
  
  return (
    <div className={`grid ${gridClasses[cols]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Admin Grid Column
 * Span columns responsively
 */
export function AdminCol({ 
  children, 
  span = { mobile: 4, tablet: 8, desktop: 12 },
  className = ''
}: { 
  children: React.ReactNode;
  span?: { mobile?: number; tablet?: number; desktop?: number };
  className?: string;
}) {
  const mobileSpan = span.mobile || 4;
  const tabletSpan = span.tablet || 8;
  const desktopSpan = span.desktop || 12;
  
  return (
    <div className={`col-span-${mobileSpan} md:col-span-${tabletSpan} lg:col-span-${desktopSpan} ${className}`}>
      {children}
    </div>
  );
}

/**
 * KPI Row Component
 * 4 tiles: 4 columns on desktop, 2x2 on tablet, stacked on mobile
 */
export function KPIRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

/**
 * Admin Chart Row
 * 2 charts side-by-side on desktop, stacked on tablet/mobile
 */
export function ChartRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {children}
    </div>
  );
}
