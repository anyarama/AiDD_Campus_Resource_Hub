import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toaster } from './components/ui/sonner';
import { Dashboard } from './components/pages/Dashboard';
import { Resources } from './components/pages/Resources';
import { MyBookings } from './components/pages/MyBookings';
import { Bookings } from './components/pages/Bookings';
import { AdminUsers } from './components/pages/AdminUsers';
import { AdminAnalytics } from './components/pages/AdminAnalytics';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { AdminModeration } from './components/pages/AdminModeration';
import { DesignSystem } from './components/pages/DesignSystem';
import { FoundationQA } from './components/pages/FoundationQA';
import { FoundationSpec } from './components/pages/FoundationSpec';
import { LayoutQA } from './components/pages/LayoutQA';
import { NavQA } from './components/pages/NavQA';
import { DashboardQA } from './components/pages/DashboardQA';
import { TableQA } from './components/pages/TableQA';
import { FormQA } from './components/pages/FormQA';
import { A11yQA } from './components/pages/A11yQA';
import { HandoffAdmin } from './components/pages/HandoffAdmin';
import { LintReport } from './components/pages/LintReport';
import { CampusHubTokens } from './components/pages/CampusHubTokens';
import { CampusHubLibrary } from './components/pages/CampusHubLibrary';
import { BrandAssets } from './components/pages/BrandAssets';
import { ComponentShowcase } from './components/pages/ComponentShowcase';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  const pageConfig: Record<string, { title: string; breadcrumbs?: Array<{ label: string; href?: string }> }> = {
    'nav-qa': {
      title: 'Nav QA Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Nav QA' }]
    },
    'layout-qa': {
      title: 'Layout QA Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Layout QA' }]
    },
    'foundation-qa': {
      title: 'Foundation QA Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Foundation QA' }]
    },
    'foundation-spec': {
      title: 'Foundation Specification',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Foundation Spec' }]
    },
    'design-system': {
      title: 'IU Design System',
      breadcrumbs: [{ label: 'Documentation' }, { label: 'Design System' }]
    },
    'dashboard': {
      title: 'Dashboard',
      breadcrumbs: [{ label: 'Home' }, { label: 'Dashboard' }]
    },
    'resources': {
      title: 'Resources',
      breadcrumbs: [{ label: 'Resources' }, { label: 'Browse' }]
    },
    'bookings': {
      title: 'My Bookings',
      breadcrumbs: [{ label: 'Bookings' }, { label: 'My Bookings' }]
    },
    'messages': {
      title: 'Messages',
      breadcrumbs: [{ label: 'Messages' }]
    },
    'reviews': {
      title: 'Reviews',
      breadcrumbs: [{ label: 'Reviews' }]
    },
    'admin': {
      title: 'Admin',
      breadcrumbs: [{ label: 'Admin' }]
    },
    'admin-users': {
      title: 'User Management',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Users' }]
    },
    'admin-analytics': {
      title: 'Analytics',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Analytics' }]
    },
    'admin-moderation': {
      title: 'Moderation',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Moderation' }]
    },
    'concierge': {
      title: 'Concierge',
      breadcrumbs: [{ label: 'Concierge' }]
    },
    'settings': {
      title: 'Settings',
      breadcrumbs: [{ label: 'Settings' }]
    },
    'dashboard-qa': {
      title: 'Dashboard QA Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Dashboard QA' }]
    },
    'table-qa': {
      title: 'Table QA Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Table QA' }]
    },
    'form-qa': {
      title: 'Form QA Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Form QA' }]
    },
    'a11y-qa': {
      title: 'A11y QA Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'A11y QA' }]
    },
    'handoff-admin': {
      title: 'Handoff Admin',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Handoff Admin' }]
    },
    'lint-report': {
      title: 'Lint Report',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Lint Report' }]
    },
    'campus-hub-tokens': {
      title: 'Campus Hub Tokens',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Campus Hub Tokens' }]
    },
    'campus-hub-library': {
      title: 'Campus Hub Library',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Campus Hub Library' }]
    },
    'brand-assets': {
      title: 'Brand Assets',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Brand Assets' }]
    },
    'component-showcase': {
      title: 'Component Showcase',
      breadcrumbs: [{ label: 'Admin' }, { label: 'Component Showcase' }]
    }
  };
  
  const renderPage = () => {
    switch (activePage) {
      case 'nav-qa':
        return <NavQA />;
      case 'layout-qa':
        return <LayoutQA />;
      case 'foundation-qa':
        return <FoundationQA />;
      case 'foundation-spec':
        return <FoundationSpec />;
      case 'design-system':
        return <DesignSystem />;
      case 'dashboard':
        return <Dashboard />;
      case 'resources':
        return <Resources />;
      case 'bookings':
        return <MyBookings />;
      case 'admin-users':
        return <AdminUsers />;
      case 'admin-analytics':
        return <AdminAnalytics />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-moderation':
        return <AdminModeration />;
      case 'messages':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-iu-primary mb-2">Messages</h3>
              <p className="text-iu-secondary">Messages feature coming soon...</p>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-iu-primary mb-2">Reviews</h3>
              <p className="text-iu-secondary">Reviews feature coming soon...</p>
            </div>
          </div>
        );
      case 'concierge':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-iu-primary mb-2">Concierge</h3>
              <p className="text-iu-secondary">Concierge service coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h3 className="text-iu-primary mb-2">Settings</h3>
              <p className="text-iu-secondary">Settings page coming soon...</p>
            </div>
          </div>
        );
      case 'dashboard-qa':
        return <DashboardQA />;
      case 'table-qa':
        return <TableQA />;
      case 'form-qa':
        return <FormQA />;
      case 'a11y-qa':
        return <A11yQA />;
      case 'handoff-admin':
        return <HandoffAdmin />;
      case 'lint-report':
        return <LintReport />;
      case 'campus-hub-tokens':
        return <CampusHubTokens />;
      case 'campus-hub-library':
        return <CampusHubLibrary />;
      case 'brand-assets':
        return <BrandAssets />;
      case 'component-showcase':
        return <ComponentShowcase />;
      default:
        return <DesignSystem />;
    }
  };
  
  const currentConfig = pageConfig[activePage] || pageConfig['design-system'];
  
  return (
    <div className="flex min-h-screen bg-iu-bg">
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        duration={6000}
        pauseWhenPageIsHidden
        closeButton
        richColors
      />
      
      {/* Sidebar - Fixed width, responsive */}
      <Sidebar
        activeItem={activePage}
        onNavigate={setActivePage}
        expanded={sidebarExpanded}
        onToggleExpanded={() => setSidebarExpanded(!sidebarExpanded)}
      />
      
      {/* Main Content Area - Fluid with max-width constraint */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Topbar - Only show for non-admin layout pages */}
        {!['admin-users', 'admin-analytics', 'admin-moderation'].includes(activePage) && (
          <Topbar
            title={currentConfig.title}
            breadcrumbs={currentConfig.breadcrumbs}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        )}
        
        {/* Page Content */}
        <main className="flex-1">
          {/* Admin pages handle their own layout, others use container padding */}
          {['admin-users', 'admin-analytics', 'admin-moderation'].includes(activePage) ? (
            renderPage()
          ) : (
            <div className="p-6">
              <div className="max-w-[1200px] mx-auto">
                {renderPage()}
              </div>
            </div>
          )}
        </main>
        
        {/* Footer */}
        <footer className="bg-iu-surface border-t border-iu py-6 px-6">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-iu-crimson rounded flex items-center justify-center">
                <span className="text-white text-xs">IU</span>
              </div>
              <span className="text-sm text-iu-secondary">
                © 2025 Indiana University Campus Resource Hub
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-iu-secondary hover:text-iu-crimson transition-colors">
                Help & Support
              </a>
              <a href="#" className="text-sm text-iu-secondary hover:text-iu-crimson transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-iu-secondary hover:text-iu-crimson transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}