import React, { useState } from 'react';
import { ChevronRight, Search, Bell, Moon, Sun, User, Settings, LogOut } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface TopbarProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  showSearch?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

/**
 * Topbar Navigation Component
 * 
 * Properties:
 * - title: string - Page title (Admin/H1 style)
 * - breadcrumbs: Breadcrumb[] - Navigation breadcrumbs
 * - showSearch: boolean (default: true) - Show global search
 * - darkMode: boolean - Current dark mode state
 * - onToggleDarkMode: () => void - Toggle dark mode callback
 * 
 * Layout:
 * - Left: Breadcrumbs + Page Title (Admin/H1)
 * - Right: Global Search (320px) + Notifications + Theme Toggle + Avatar Menu
 * - Auto Layout: 16px gaps, padding 16-20px
 * - Responsive: Search collapses on mobile
 */
export function Topbar({ 
  title, 
  breadcrumbs = [], 
  showSearch = true, 
  darkMode = false,
  onToggleDarkMode 
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(3);
  
  const notifications = [
    { id: 1, title: 'New booking request', time: '5 min ago', unread: true },
    { id: 2, title: 'Resource approval needed', time: '1 hour ago', unread: true },
    { id: 3, title: 'System maintenance scheduled', time: '2 hours ago', unread: false },
  ];
  
  return (
    <header className="bg-iu-surface border-b border-iu sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        {/* Left: Breadcrumbs + Title */}
        <div className="flex-1 min-w-0">
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-1">
              <ol className="flex items-center gap-2 admin-small">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-role-secondary" aria-hidden="true" />
                    )}
                    {crumb.href ? (
                      <a 
                        href={crumb.href}
                        className={`hover:text-role-primary transition-colors ${
                          index === breadcrumbs.length - 1 
                            ? 'text-role-primary' 
                            : 'text-role-secondary'
                        }`}
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className={
                        index === breadcrumbs.length - 1 
                          ? 'text-role-primary' 
                          : 'text-role-secondary'
                      }>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 className="admin-h1 truncate">{title}</h1>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Global Search - 320px on desktop, hidden on mobile */}
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-iu-secondary pointer-events-none" />
              <input
                type="search"
                placeholder="Search resources, bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 rounded-token-md border border-role-border bg-iu-surface admin-small outline-none
                  focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20 transition-all
                  placeholder:text-iu-secondary"
                aria-label="Global search"
              />
            </div>
          )}
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-iu-secondary hover:text-iu-primary hover:bg-[var(--iu-accent-hover)] rounded-token-md transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
              aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--iu-danger)] rounded-full border-2 border-iu-surface" />
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-iu-surface border border-iu rounded-token-lg shadow-iu-lg overflow-hidden">
                <div className="p-4 border-b border-iu">
                  <div className="flex items-center justify-between">
                    <h3 className="admin-subtitle">Notifications</h3>
                    {notificationCount > 0 && (
                      <span className="admin-caption text-role-accent">{notificationCount} new</span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notification => (
                    <button
                      key={notification.id}
                      className={`w-full p-4 text-left hover:bg-[var(--iu-accent-hover)] transition-colors border-b border-iu last:border-b-0
                        ${notification.unread ? 'bg-[var(--iu-info)]/5' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {notification.unread && (
                          <span className="w-2 h-2 bg-[var(--iu-info)] rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="admin-small text-role-primary">{notification.title}</p>
                          <p className="admin-caption mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-iu">
                  <button className="w-full text-center admin-small text-role-accent hover:text-role-primary transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-iu-secondary hover:text-iu-primary hover:bg-[var(--iu-accent-hover)] rounded-token-md transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          
          {/* Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 pr-3 rounded-token-lg hover:bg-[var(--iu-accent-hover)] transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 bg-role-accent rounded-full flex items-center justify-center text-white admin-small">
                <User className="w-4 h-4" />
              </div>
              <span className="admin-small hidden lg:inline">Admin User</span>
            </button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-iu-surface border border-iu rounded-token-lg shadow-iu-lg overflow-hidden">
                <div className="p-4 border-b border-iu">
                  <p className="admin-body-medium text-role-primary">Admin User</p>
                  <p className="admin-caption mt-1">admin@iu.edu</p>
                </div>
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left admin-small hover:bg-[var(--iu-accent-hover)] transition-colors flex items-center gap-3">
                    <User className="w-4 h-4 text-iu-secondary" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left admin-small hover:bg-[var(--iu-accent-hover)] transition-colors flex items-center gap-3">
                    <Settings className="w-4 h-4 text-iu-secondary" />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="border-t border-iu py-2">
                  <button className="w-full px-4 py-2 text-left admin-small hover:bg-[var(--iu-accent-hover)] transition-colors flex items-center gap-3 text-[var(--iu-danger)]">
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}