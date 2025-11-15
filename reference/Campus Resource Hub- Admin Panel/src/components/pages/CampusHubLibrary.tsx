import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { IUButton } from '../IUButton';
import { IUBadge } from '../IUBadge';
import { IUCard, IUCardHeader, IUCardTitle, IUCardContent } from '../IUCard';

/**
 * CAMPUS HUB / LIBRARY
 * Complete component library with all CH/ prefixed components
 */

export function CampusHubLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const components = [
    {
      category: 'Navigation',
      items: [
        { 
          name: 'CH/Sidebar', 
          file: '/components/Sidebar.tsx',
          description: 'Main navigation sidebar with collapsible support',
          props: 'activePage, onPageChange',
          variants: 'Default, Collapsed'
        },
        { 
          name: 'CH/Topbar', 
          file: '/components/Topbar.tsx',
          description: 'Top navigation bar with search and user menu',
          props: 'title, actions',
          variants: 'Default, With breadcrumbs'
        },
      ]
    },
    {
      category: 'Data Display',
      items: [
        { 
          name: 'CH/KPI Card', 
          file: '/components/KPICard.tsx',
          description: 'Key performance indicator card with trend',
          props: 'title, value, change, icon',
          variants: 'Positive, Negative, Neutral'
        },
        { 
          name: 'CH/Data Table', 
          file: '/components/DataTable.tsx',
          description: 'Sortable, selectable table with pagination',
          props: 'columns, data, density, selectable, sortable',
          variants: 'Comfortable, Compact'
        },
        { 
          name: 'CH/Badge', 
          file: '/components/IUBadge.tsx',
          description: 'Status badge or label',
          props: 'variant, children',
          variants: 'Success, Warning, Danger, Info, Default'
        },
      ]
    },
    {
      category: 'Cards',
      items: [
        { 
          name: 'CH/Card', 
          file: '/components/IUCard.tsx',
          description: 'Base card container',
          props: 'children',
          variants: 'Default'
        },
        { 
          name: 'CH/Resource Card', 
          file: '/components/ResourceCard.tsx',
          description: 'Resource listing card with image',
          props: 'name, type, status, image, rating',
          variants: 'Available, Booked, Maintenance'
        },
        { 
          name: 'CH/Booking Card', 
          file: '/components/BookingCard.tsx',
          description: 'Booking detail card',
          props: 'resource, date, time, status',
          variants: 'Upcoming, Past, Cancelled'
        },
        { 
          name: 'CH/Review Card', 
          file: '/components/ReviewCard.tsx',
          description: 'User review card',
          props: 'rating, comment, author, date',
          variants: 'Default'
        },
      ]
    },
    {
      category: 'Forms',
      items: [
        { 
          name: 'CH/Input', 
          file: '/components/FormControls.tsx',
          description: 'Text input with label and validation',
          props: 'label, value, error, type',
          variants: 'Text, Email, Password, Number'
        },
        { 
          name: 'CH/Select', 
          file: '/components/FormControls.tsx',
          description: 'Dropdown select or combobox',
          props: 'label, options, value',
          variants: 'Select, Combobox'
        },
        { 
          name: 'CH/DateTime', 
          file: '/components/FormControls.tsx',
          description: 'Date and time picker',
          props: 'label, value, type',
          variants: 'Date, Time'
        },
        { 
          name: 'CH/Toggle', 
          file: '/components/FormControls.tsx',
          description: 'Switch or checkbox toggle',
          props: 'label, checked, onChange',
          variants: 'Switch, Checkbox'
        },
      ]
    },
    {
      category: 'Buttons',
      items: [
        { 
          name: 'CH/Button', 
          file: '/components/IUButton.tsx',
          description: 'Primary action button',
          props: 'variant, size, disabled, children',
          variants: 'Primary, Secondary, Ghost, Destructive'
        },
      ]
    },
    {
      category: 'Feedback',
      items: [
        { 
          name: 'CH/Alert', 
          file: '/components/ui/alert.tsx',
          description: 'Alert banner or notification',
          props: 'variant, title, description',
          variants: 'Success, Warning, Danger, Info'
        },
        { 
          name: 'CH/Toast', 
          file: '/components/ui/sonner.tsx',
          description: 'Toast notification',
          props: 'type, message, duration',
          variants: 'Success, Error, Info, Warning'
        },
      ]
    },
    {
      category: 'Overlays',
      items: [
        { 
          name: 'CH/Modal', 
          file: '/components/Modal.tsx',
          description: 'Modal dialog with focus trap',
          props: 'isOpen, onClose, size, children',
          variants: 'SM (480px), MD (640px), LG (800px)'
        },
        { 
          name: 'CH/Drawer', 
          file: '/components/FilterDrawer.tsx',
          description: 'Slide-in filter drawer',
          props: 'isOpen, onClose, children',
          variants: 'Right slide-in'
        },
      ]
    },
    {
      category: 'Charts',
      items: [
        { 
          name: 'CH/Chart Container', 
          file: '/components/ChartContainer.tsx',
          description: 'Chart wrapper with Recharts',
          props: 'title, data, type',
          variants: 'Line, Bar, Doughnut'
        },
      ]
    },
  ];
  
  const filteredComponents = components.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 mb-2">Campus Hub / Library</h1>
        <p className="text-body text-fg-muted">
          Complete component library with CH/ prefix. All components use Auto Layout and token-based styling.
        </p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-subtle" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface border border-default rounded-md text-body focus:outline-none focus:ring-2 focus:ring-brand-crimson"
        />
      </div>
      
      {/* Component Categories */}
      {filteredComponents.map((category) => (
        <section key={category.category} className="section-spacing">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-brand-crimson rounded-md flex items-center justify-center">
              <Package className="w-4 h-4 text-brand-white" />
            </div>
            <h2 className="text-h3">{category.category}</h2>
            <IUBadge variant="default">{category.items.length}</IUBadge>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {category.items.map((component) => (
              <IUCard key={component.name}>
                <IUCardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <IUCardTitle>{component.name}</IUCardTitle>
                      <p className="text-caption text-fg-muted mt-1">{component.description}</p>
                    </div>
                    <IUBadge variant="default">{component.variants.split(',').length} variants</IUBadge>
                  </div>
                </IUCardHeader>
                <IUCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-caption-semibold text-fg-muted mb-1">File Path</p>
                      <p className="text-micro font-mono text-fg-subtle">{component.file}</p>
                    </div>
                    <div>
                      <p className="text-caption-semibold text-fg-muted mb-1">Props</p>
                      <p className="text-micro text-fg-default">{component.props}</p>
                    </div>
                    <div>
                      <p className="text-caption-semibold text-fg-muted mb-1">Variants</p>
                      <div className="flex flex-wrap gap-2">
                        {component.variants.split(',').map((variant, idx) => (
                          <IUBadge key={idx} variant="default">{variant.trim()}</IUBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                </IUCardContent>
              </IUCard>
            ))}
          </div>
        </section>
      ))}
      
      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-fg-subtle mx-auto mb-4" />
          <p className="text-body text-fg-muted">No components found matching "{searchQuery}"</p>
        </div>
      )}
      
      {/* Summary */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Component Summary</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-subtle rounded-md">
              <p className="text-display text-brand-crimson">{components.reduce((sum, cat) => sum + cat.items.length, 0)}</p>
              <p className="text-caption text-fg-muted mt-1">Total Components</p>
            </div>
            <div className="text-center p-4 bg-subtle rounded-md">
              <p className="text-display text-brand-crimson">{components.length}</p>
              <p className="text-caption text-fg-muted mt-1">Categories</p>
            </div>
            <div className="text-center p-4 bg-subtle rounded-md">
              <p className="text-display text-brand-crimson">100%</p>
              <p className="text-caption text-fg-muted mt-1">Auto Layout</p>
            </div>
            <div className="text-center p-4 bg-subtle rounded-md">
              <p className="text-display text-brand-crimson">100%</p>
              <p className="text-caption text-fg-muted mt-1">Tokenized</p>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
    </div>
  );
}
