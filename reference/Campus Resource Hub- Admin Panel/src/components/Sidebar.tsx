import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Calendar,
  MessageSquare,
  Star,
  Shield,
  Users,
  BarChart3,
  AlertTriangle,
  HeadphonesIcon,
  Settings,
  ChevronRight
} from 'lucide-react';
import { IULogo } from './brand/IULogo';

export type SidebarDensity = 'comfortable' | 'compact';
export type SidebarPage = 
  | 'dashboard' 
  | 'resources' 
  | 'bookings' 
  | 'messages' 
  | 'reviews' 
  | 'admin' 
  | 'admin-users' 
  | 'admin-analytics' 
  | 'admin-moderation' 
  | 'concierge' 
  | 'settings'
  | 'design-system'
  | 'foundation-qa'
  | 'foundation-spec'
  | 'layout-qa'
  | 'nav-qa';

interface SidebarProps {
  activeItem: SidebarPage;
  onNavigate: (item: SidebarPage) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  density?: SidebarDensity;
}

interface NavItem {
  id: SidebarPage;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

interface TooltipState {
  show: boolean;
  item: string | null;
  x: number;
  y: number;
}

/**
 * Sidebar Navigation Component
 * 
 * Properties:
 * - expanded: boolean (default: false) - Controls sidebar width
 * - activeItem: SidebarPage - Currently active page
 * - density: 'comfortable' | 'compact' - Spacing density
 * - onNavigate: (item) => void - Navigation callback
 * - onToggleExpanded: () => void - Toggle callback
 * 
 * Behavior:
 * - Collapsed: 72px width, icon-only with tooltips
 * - Expanded: 240px width, icon + labels
 * - Active item: Crimson text + 4px left indicator (20px radius)
 * - Hover: AccentHover background
 * - Tooltips: Show on hover/focus in collapsed state
 * - Keyboard: ESC closes tooltip, proper focus rings
 */
export function Sidebar({ 
  activeItem, 
  onNavigate, 
  expanded = false, 
  onToggleExpanded,
  density = 'comfortable'
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['admin']);
  const [tooltip, setTooltip] = useState<TooltipState>({ show: false, item: null, x: 0, y: 0 });
  
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'resources', label: 'Resources', icon: <Package className="w-5 h-5" /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Shield className="w-5 h-5" />,
      children: [
        { id: 'admin-users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        { id: 'admin-analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'admin-moderation', label: 'Moderation', icon: <AlertTriangle className="w-4 h-4" /> },
      ]
    },
    { id: 'concierge', label: 'Concierge', icon: <HeadphonesIcon className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];
  
  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };
  
  const showTooltip = (item: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!expanded) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        item,
        x: rect.right + 8,
        y: rect.top + rect.height / 2
      });
    }
  };
  
  const hideTooltip = () => {
    setTooltip({ show: false, item: null, x: 0, y: 0 });
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  };
  
  const itemPadding = density === 'compact' ? 'py-2' : 'py-2.5';
  const itemGap = density === 'compact' ? 'gap-2' : 'gap-3';
  const navSpacing = density === 'compact' ? 'space-y-0.5' : 'space-y-1';
  
  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isSectionExpanded = expandedSections.includes(item.id);
    
    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren && expanded) {
              toggleSection(item.id);
            } else {
              onNavigate(item.id);
              hideTooltip();
            }
          }}
          onMouseEnter={(e) => showTooltip(item.label, e)}
          onMouseLeave={hideTooltip}
          onFocus={(e) => showTooltip(item.label, e)}
          onBlur={hideTooltip}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center ${itemGap} px-4 ${itemPadding} rounded-[var(--radius-md)] transition-all group relative
            ${isActive 
              ? 'text-iu-crimson bg-[var(--iu-crimson)]/5' 
              : 'text-iu-secondary hover:text-iu-primary hover:bg-[var(--iu-accent-hover)]'
            }
            ${level > 0 ? 'ml-4 text-sm' : ''}
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2
          `}
          aria-current={isActive ? 'page' : undefined}
          aria-label={!expanded ? item.label : undefined}
          aria-expanded={hasChildren && expanded ? isSectionExpanded : undefined}
        >
          {/* Active Indicator Pill - 4px left, 20px radius */}
          {isActive && (
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-iu-crimson rounded-r-full"
              style={{ borderRadius: '0 20px 20px 0' }}
            />
          )}
          
          <span className={`${level > 0 ? 'ml-2' : ''} flex-shrink-0`}>{item.icon}</span>
          
          {expanded && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              {hasChildren && (
                <ChevronRight 
                  className={`w-4 h-4 transition-transform flex-shrink-0 ${isSectionExpanded ? 'rotate-90' : ''}`} 
                />
              )}
            </>
          )}
        </button>
        
        {hasChildren && expanded && isSectionExpanded && (
          <div className={`mt-1 ${navSpacing}`}>
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <aside
        className={`bg-iu-surface border-r border-iu h-screen sticky top-0 transition-all duration-300 flex flex-col
          ${expanded ? 'w-60' : 'w-[72px]'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={`p-4 border-b border-iu flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
          {expanded ? (
            <div className="flex items-center gap-3">
              <IULogo variant="icon" size="sm" color="crimson" />
              <div className="flex flex-col min-w-0">
                <span className="text-iu-primary truncate">Campus Hub</span>
              </div>
            </div>
          ) : (
            <IULogo variant="icon" size="sm" color="crimson" />
          )}
        </div>
        
        {/* Navigation */}
        <nav className={`flex-1 p-3 overflow-y-auto ${navSpacing}`}>
          {navItems.map(item => renderNavItem(item))}
        </nav>
        
        {/* Toggle button */}
        {onToggleExpanded && (
          <div className="p-3 border-t border-iu">
            <button
              onClick={onToggleExpanded}
              onMouseEnter={(e) => showTooltip(expanded ? 'Collapse' : 'Expand', e)}
              onMouseLeave={hideTooltip}
              onFocus={(e) => showTooltip(expanded ? 'Collapse' : 'Expand', e)}
              onBlur={hideTooltip}
              onKeyDown={handleKeyDown}
              className={`w-full flex items-center justify-center ${itemGap} px-4 ${itemPadding} text-iu-secondary hover:text-iu-primary hover:bg-[var(--iu-accent-hover)] rounded-[var(--radius-md)] transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2
              `}
              aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              {expanded && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        )}
      </aside>
      
      {/* Tooltip Portal */}
      {tooltip.show && !expanded && tooltip.item && (
        <div
          className="fixed z-50 px-3 py-2 bg-role-surface-inverse text-white admin-small rounded-token-md shadow-iu-lg pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateY(-50%)',
          }}
          role="tooltip"
        >
          {tooltip.item}
          <div 
            className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-role-surface-inverse rotate-45"
            style={{ marginRight: '1px' }}
          />
        </div>
      )}
    </>
  );
}