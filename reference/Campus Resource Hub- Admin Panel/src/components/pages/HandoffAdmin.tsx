import React, { useState } from 'react';
import { Copy, CheckCircle2, Download, Code, Ruler, Palette } from 'lucide-react';
import { IUCard, IUCardHeader, IUCardTitle, IUCardContent } from '../IUCard';
import { IUBadge } from '../IUBadge';
import { IUButton } from '../IUButton';

/**
 * Handoff (Admin) Documentation Page
 * 
 * Developer handoff documentation including:
 * - Design token reference
 * - Component naming conventions
 * - Redline specifications
 * - Chart.js implementation notes
 */

export function HandoffAdmin() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };
  
  // Color Styles Reference
  const colorStyles = [
    { name: 'Brand/Crimson', value: '#990000', token: '--iu-crimson', usage: 'Primary brand, CTAs, accent' },
    { name: 'Brand/Crimson-700', value: '#7D0000', token: '--iu-crimson-700', usage: 'Button hover states' },
    { name: 'Brand/Crimson-300', value: '#C94F4F', token: '--iu-crimson-300', usage: 'Lighter accents' },
    { name: 'Brand/Cream', value: '#EEEDEB', token: '--iu-cream', usage: 'Background color' },
    { name: 'Neutral/900', value: '#111111', token: '--iu-neutral-900', usage: 'Primary text' },
    { name: 'Neutral/800', value: '#1F2937', token: '--iu-neutral-800', usage: 'Dark surface (dark mode)' },
    { name: 'Neutral/700', value: '#374151', token: '--iu-neutral-700', usage: 'Medium dark text' },
    { name: 'Neutral/600', value: '#4B5563', token: '--iu-neutral-600', usage: 'Secondary text' },
    { name: 'Neutral/500', value: '#6B7280', token: '--iu-neutral-500', usage: 'Tertiary text' },
    { name: 'Neutral/400', value: '#9CA3AF', token: '--iu-neutral-400', usage: 'Placeholder text' },
    { name: 'Neutral/300', value: '#D1D5DB', token: '--iu-neutral-300', usage: 'Borders, dividers' },
    { name: 'Neutral/200', value: '#E5E7EB', token: '--iu-neutral-200', usage: 'Subtle borders' },
    { name: 'Neutral/100', value: '#F3F4F6', token: '--iu-neutral-100', usage: 'Muted surfaces' },
    { name: 'Neutral/050', value: '#FAFAFA', token: '--iu-neutral-050', usage: 'Lightest surface' },
    { name: 'Neutral/000', value: '#FFFFFF', token: '--iu-neutral-000', usage: 'White, cards' },
    { name: 'State/Success', value: '#1F9D55', token: '--iu-success', usage: 'Success states, approved' },
    { name: 'State/Warning', value: '#DC8A00', token: '--iu-warning', usage: 'Warning states, pending' },
    { name: 'State/Danger', value: '#B00020', token: '--iu-danger', usage: 'Error states, destructive' },
    { name: 'State/Info', value: '#1D4ED8', token: '--iu-info', usage: 'Info states, links' },
    { name: 'Focus', value: '#0EA5E9', token: '--iu-focus', usage: 'Focus rings, active state' },
  ];
  
  // Text Styles Reference
  const textStyles = [
    { name: 'Display/Large', size: '64px', lineHeight: '76px', weight: 700, letterSpacing: '-0.01em', usage: 'Hero headlines' },
    { name: 'Display/Medium', size: '48px', lineHeight: '60px', weight: 700, letterSpacing: '-0.01em', usage: 'Page titles' },
    { name: 'Display/Small', size: '36px', lineHeight: '48px', weight: 700, letterSpacing: '-0.01em', usage: 'Section headers' },
    { name: 'Heading/H1', size: '32px', lineHeight: '40px', weight: 700, letterSpacing: '0', usage: 'Main headings' },
    { name: 'Heading/H2', size: '24px', lineHeight: '32px', weight: 600, letterSpacing: '0', usage: 'Sub headings' },
    { name: 'Heading/H3', size: '20px', lineHeight: '28px', weight: 600, letterSpacing: '0', usage: 'Card titles' },
    { name: 'Body/Large', size: '18px', lineHeight: '28px', weight: 400, letterSpacing: '0', usage: 'Intro paragraphs' },
    { name: 'Body/Medium', size: '16px', lineHeight: '26px', weight: 400, letterSpacing: '0', usage: 'Body text (default)' },
    { name: 'Body/Small', size: '14px', lineHeight: '22px', weight: 400, letterSpacing: '0', usage: 'Compact body text' },
    { name: 'Admin/H1', size: '28px', lineHeight: '36px', weight: 700, letterSpacing: '0', usage: 'Admin page titles' },
    { name: 'Admin/H2', size: '20px', lineHeight: '28px', weight: 600, letterSpacing: '0', usage: 'Admin section titles' },
    { name: 'Admin/Subtitle', size: '16px', lineHeight: '24px', weight: 600, letterSpacing: '0', usage: 'Admin subsections' },
    { name: 'Admin/Body-Medium', size: '15px', lineHeight: '24px', weight: 400, letterSpacing: '0', usage: 'Admin body text' },
    { name: 'Admin/Small', size: '14px', lineHeight: '20px', weight: 400, letterSpacing: '0', usage: 'Admin labels, captions' },
    { name: 'Admin/Caption', size: '12px', lineHeight: '16px', weight: 400, letterSpacing: '0', usage: 'Admin helper text' },
  ];
  
  // Effect Styles Reference
  const effectStyles = [
    { name: 'Shadow/SM', value: '0 1px 2px rgba(0,0,0,0.06)', token: '--shadow-sm', usage: 'Subtle elevation (inputs, chips)' },
    { name: 'Shadow/MD', value: '0 4px 12px rgba(0,0,0,0.10)', token: '--shadow-md', usage: 'Cards, dropdowns' },
    { name: 'Shadow/LG', value: '0 8px 24px rgba(0,0,0,0.14)', token: '--shadow-lg', usage: 'Modals, popovers' },
    { name: 'Shadow/XL', value: '0 16px 48px rgba(0,0,0,0.20)', token: '--shadow-xl', usage: 'Large modals, dialogs' },
    { name: 'Radius/SM', value: '4px', token: '--radius-sm', usage: 'Small elements (badges)' },
    { name: 'Radius/MD', value: '8px', token: '--radius-md', usage: 'Default (cards, inputs, buttons)' },
    { name: 'Radius/LG', value: '12px', token: '--radius-lg', usage: 'Large panels, modals' },
  ];
  
  // Component Library
  const components = [
    { name: 'Nav/Sidebar', file: '/components/Sidebar.tsx', props: 'activePage, onPageChange', variants: 'Default' },
    { name: 'Nav/Topbar', file: '/components/Topbar.tsx', props: 'title, actions', variants: 'Default, with breadcrumbs' },
    { name: 'Data/KPI Card', file: '/components/KPICard.tsx', props: 'title, value, change, icon', variants: 'Positive, Negative, Neutral' },
    { name: 'Data/Table', file: '/components/DataTable.tsx', props: 'columns, data, density, selectable', variants: 'Comfortable, Compact' },
    { name: 'Data/Badge', file: '/components/IUBadge.tsx', props: 'variant, children', variants: 'Success, Warning, Danger, Info, Default' },
    { name: 'Chart/Container', file: '/components/ChartContainer.tsx', props: 'title, data, type', variants: 'Line, Bar, Doughnut' },
    { name: 'Panel/Filters', file: '/components/FilterDrawer.tsx', props: 'isOpen, onClose, filters', variants: 'Drawer (slide-in)' },
    { name: 'Card/Resource', file: '/components/ResourceCard.tsx', props: 'name, type, status, image', variants: 'Available, Booked, Maintenance' },
    { name: 'Card/Booking', file: '/components/BookingCard.tsx', props: 'resource, date, time, status', variants: 'Upcoming, Past, Cancelled' },
    { name: 'Card/Review', file: '/components/ReviewCard.tsx', props: 'rating, comment, author, date', variants: 'Default' },
    { name: 'Form/Input', file: '/components/FormControls.tsx', props: 'label, value, error, size', variants: 'Text, Email, Password, Number' },
    { name: 'Form/Select', file: '/components/FormControls.tsx', props: 'label, options, value', variants: 'Default, Combobox' },
    { name: 'Form/DateTime', file: '/components/FormControls.tsx', props: 'label, value, type', variants: 'Date, Time' },
    { name: 'Form/Toggle', file: '/components/FormControls.tsx', props: 'label, checked, onChange', variants: 'Switch, Checkbox' },
    { name: 'Feedback/Alert', file: '/components/ui/alert.tsx', props: 'variant, title, description', variants: 'Success, Warning, Danger, Info' },
    { name: 'Feedback/Toast', file: '/components/ui/sonner.tsx', props: 'type, message, duration', variants: 'Success, Error, Info, Warning' },
    { name: 'Overlay/Modal', file: '/components/Modal.tsx', props: 'isOpen, onClose, size', variants: 'SM (480px), MD (640px), LG (800px)' },
    { name: 'Button/Primary', file: '/components/IUButton.tsx', props: 'variant, size, disabled', variants: 'Default, Outline, Ghost, Destructive' },
  ];
  
  return (
    <div className="flex flex-col gap-token-8">
      {/* Header */}
      <div>
        <h3 className="admin-h1 mb-2">Handoff (Admin)</h3>
        <p className="admin-body-medium text-role-secondary">
          Developer handoff documentation with design tokens, component specs, and implementation notes
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-3">
        <IUButton variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Tokens (JSON)
        </IUButton>
        <IUButton variant="outline">
          <Code className="w-4 h-4 mr-2" />
          Export Components List
        </IUButton>
        <IUButton variant="outline">
          <Ruler className="w-4 h-4 mr-2" />
          View Redlines
        </IUButton>
      </div>
      
      {/* Color Styles */}
      <IUCard>
        <IUCardHeader>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-role-accent" />
            <IUCardTitle>Color Styles (Copy Names Exactly)</IUCardTitle>
          </div>
        </IUCardHeader>
        <IUCardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-role-border">
                  <th className="admin-small text-left p-3">Style Name</th>
                  <th className="admin-small text-left p-3">Preview</th>
                  <th className="admin-small text-left p-3">Hex Value</th>
                  <th className="admin-small text-left p-3">CSS Token</th>
                  <th className="admin-small text-left p-3">Usage</th>
                  <th className="admin-small text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {colorStyles.map((style, idx) => (
                  <tr key={idx} className="border-b border-role-border hover:bg-role-surface-muted transition-colors">
                    <td className="p-3 admin-small font-mono">{style.name}</td>
                    <td className="p-3">
                      <div 
                        className="w-12 h-6 rounded border border-role-border"
                        style={{ backgroundColor: style.value }}
                      />
                    </td>
                    <td className="p-3 admin-small font-mono">{style.value}</td>
                    <td className="p-3 admin-caption font-mono text-role-secondary">var({style.token})</td>
                    <td className="p-3 admin-caption text-role-secondary">{style.usage}</td>
                    <td className="p-3">
                      <button
                        onClick={() => copyToClipboard(style.value, style.name)}
                        className="p-2 hover:bg-role-surface-muted rounded transition-colors"
                      >
                        {copiedItem === style.name ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--iu-success)]" />
                        ) : (
                          <Copy className="w-4 h-4 text-role-secondary" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Text Styles */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Text Styles (Copy Names Exactly)</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-role-border">
                  <th className="admin-small text-left p-3">Style Name</th>
                  <th className="admin-small text-left p-3">Preview</th>
                  <th className="admin-small text-left p-3">Size / Line Height</th>
                  <th className="admin-small text-left p-3">Weight</th>
                  <th className="admin-small text-left p-3">Letter Spacing</th>
                  <th className="admin-small text-left p-3">Usage</th>
                </tr>
              </thead>
              <tbody>
                {textStyles.map((style, idx) => (
                  <tr key={idx} className="border-b border-role-border hover:bg-role-surface-muted transition-colors">
                    <td className="p-3 admin-small font-mono">{style.name}</td>
                    <td className="p-3">
                      <span 
                        style={{ 
                          fontSize: parseInt(style.size) > 32 ? '24px' : parseInt(style.size) > 20 ? '18px' : '14px',
                          fontWeight: style.weight 
                        }}
                      >
                        Aa
                      </span>
                    </td>
                    <td className="p-3 admin-caption font-mono">{style.size} / {style.lineHeight}</td>
                    <td className="p-3 admin-caption">{style.weight}</td>
                    <td className="p-3 admin-caption font-mono">{style.letterSpacing}</td>
                    <td className="p-3 admin-caption text-role-secondary">{style.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Effect Styles */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Effect Styles (Shadows & Radius)</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-role-border">
                  <th className="admin-small text-left p-3">Style Name</th>
                  <th className="admin-small text-left p-3">Preview</th>
                  <th className="admin-small text-left p-3">CSS Value</th>
                  <th className="admin-small text-left p-3">CSS Token</th>
                  <th className="admin-small text-left p-3">Usage</th>
                </tr>
              </thead>
              <tbody>
                {effectStyles.map((style, idx) => (
                  <tr key={idx} className="border-b border-role-border hover:bg-role-surface-muted transition-colors">
                    <td className="p-3 admin-small font-mono">{style.name}</td>
                    <td className="p-3">
                      <div 
                        className="w-16 h-8 bg-role-surface border border-role-border"
                        style={{ 
                          boxShadow: style.name.includes('Shadow') ? style.value : undefined,
                          borderRadius: style.name.includes('Radius') ? style.value : undefined
                        }}
                      />
                    </td>
                    <td className="p-3 admin-caption font-mono">{style.value}</td>
                    <td className="p-3 admin-caption font-mono text-role-secondary">var({style.token})</td>
                    <td className="p-3 admin-caption text-role-secondary">{style.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Component Library */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Component Library (18 Components)</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-role-border">
                  <th className="admin-small text-left p-3">Component Name</th>
                  <th className="admin-small text-left p-3">File Path</th>
                  <th className="admin-small text-left p-3">Key Props</th>
                  <th className="admin-small text-left p-3">Variants</th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp, idx) => (
                  <tr key={idx} className="border-b border-role-border hover:bg-role-surface-muted transition-colors">
                    <td className="p-3 admin-small font-mono text-role-accent">{comp.name}</td>
                    <td className="p-3 admin-caption font-mono text-role-secondary">{comp.file}</td>
                    <td className="p-3 admin-caption">{comp.props}</td>
                    <td className="p-3 admin-caption text-role-secondary">{comp.variants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Redline: KPI Card */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Redline Spec: Admin Dashboard KPI Card</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="flex flex-col gap-6">
            {/* Visual */}
            <div className="p-8 bg-role-surface-muted rounded-token-md border border-role-border">
              <div className="max-w-xs bg-role-surface p-6 rounded-token-md border border-role-border shadow-iu-md relative">
                {/* Dimension markers */}
                <div className="absolute -top-8 left-0 right-0 flex justify-center">
                  <div className="px-2 py-1 bg-[var(--iu-info)] text-white text-xs rounded">
                    Width: 100% (responsive)
                  </div>
                </div>
                <div className="absolute -left-12 top-0 bottom-0 flex items-center">
                  <div className="px-2 py-1 bg-[var(--iu-info)] text-white text-xs rounded -rotate-90 whitespace-nowrap">
                    Auto height
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex items-start justify-between mb-4">
                  <p className="admin-small text-role-secondary">Total Bookings</p>
                  <div className="w-10 h-10 bg-[var(--iu-accent)]/10 rounded-token-lg flex items-center justify-center">
                    <div className="w-5 h-5 bg-[var(--iu-accent)] rounded"></div>
                  </div>
                </div>
                <h4 className="admin-h1 mb-2">1,234</h4>
                <div className="flex items-center gap-2">
                  <IUBadge variant="success">+12.5%</IUBadge>
                  <p className="admin-caption text-role-secondary">vs last month</p>
                </div>
              </div>
            </div>
            
            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Structure</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Container: bg-role-surface, border-role-border</li>
                  <li>• Padding: 24px all sides (p-6)</li>
                  <li>• Border radius: 8px (rounded-token-md)</li>
                  <li>• Shadow: shadow-iu-md</li>
                  <li>• Gap between elements: 16px (gap-4)</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Typography</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Label: admin-small, text-role-secondary</li>
                  <li>• Value: admin-h1, text-role-primary</li>
                  <li>• Badge: IUBadge component</li>
                  <li>• Change text: admin-caption, text-role-secondary</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Icon</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Container: 40×40px (w-10 h-10)</li>
                  <li>• Background: accent/10 opacity</li>
                  <li>• Border radius: 12px (rounded-token-lg)</li>
                  <li>• Icon size: 20×20px (w-5 h-5)</li>
                  <li>• Icon color: var(--iu-accent)</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">States</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Positive change: Success badge (green)</li>
                  <li>• Negative change: Danger badge (red)</li>
                  <li>• Neutral: Default badge (gray)</li>
                  <li>• Hover: Slight elevation increase (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Redline: Table Row */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Redline Spec: Admin Users Table Row</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="flex flex-col gap-6">
            {/* Visual */}
            <div className="p-8 bg-role-surface-muted rounded-token-md border border-role-border overflow-x-auto">
              <div className="bg-role-surface border border-role-border rounded-token-md overflow-hidden min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-role-surface-muted border-b border-role-border">
                  <div className="col-span-1 flex items-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                  <div className="col-span-3 admin-small">Name</div>
                  <div className="col-span-3 admin-small">Email</div>
                  <div className="col-span-2 admin-small">Role</div>
                  <div className="col-span-2 admin-small">Status</div>
                  <div className="col-span-1 admin-small">Actions</div>
                </div>
                
                {/* Row - Comfortable */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-role-border hover:bg-role-surface-muted transition-colors relative">
                  <div className="absolute -top-6 left-0 right-0 flex justify-center">
                    <div className="px-2 py-1 bg-[var(--iu-info)] text-white text-xs rounded">
                      Comfortable: 56px height
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                  <div className="col-span-3 admin-body-medium">John Doe</div>
                  <div className="col-span-3 admin-small text-role-secondary">john.doe@iu.edu</div>
                  <div className="col-span-2">
                    <IUBadge>Student</IUBadge>
                  </div>
                  <div className="col-span-2">
                    <IUBadge variant="success">Active</IUBadge>
                  </div>
                  <div className="col-span-1">
                    <button className="p-2 hover:bg-role-surface-muted rounded">⋮</button>
                  </div>
                </div>
                
                {/* Row - Compact */}
                <div className="grid grid-cols-12 gap-4 p-2 border-b border-role-border hover:bg-role-surface-muted transition-colors relative">
                  <div className="absolute -top-6 left-0 right-0 flex justify-center">
                    <div className="px-2 py-1 bg-[var(--iu-info)] text-white text-xs rounded">
                      Compact: 40px height
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                  <div className="col-span-3 admin-small">Jane Smith</div>
                  <div className="col-span-3 admin-caption text-role-secondary">jane.smith@iu.edu</div>
                  <div className="col-span-2">
                    <IUBadge>Staff</IUBadge>
                  </div>
                  <div className="col-span-2">
                    <IUBadge variant="success">Active</IUBadge>
                  </div>
                  <div className="col-span-1">
                    <button className="p-1 hover:bg-role-surface-muted rounded text-xs">⋮</button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Row Heights</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Comfortable: 56px (py-4)</li>
                  <li>• Compact: 40px (py-2)</li>
                  <li>• Header: 48px (py-3)</li>
                  <li>• Border: 1px solid border-role-border</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Typography</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Header: admin-small, font-weight 600</li>
                  <li>• Primary cell (comfortable): admin-body-medium</li>
                  <li>• Secondary cell (comfortable): admin-small</li>
                  <li>• Compact cells: admin-small or admin-caption</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Interactive States</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Hover: bg-role-surface-muted</li>
                  <li>• Selected: border-left 2px accent</li>
                  <li>• Focus: 2px cyan ring on interactive elements</li>
                  <li>• Transition: 150ms ease</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Column Spacing</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Gap between columns: 16px (gap-4)</li>
                  <li>• Checkbox column: 1/12 width</li>
                  <li>• Name column: 3/12 width</li>
                  <li>• Email column: 3/12 width</li>
                </ul>
              </div>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Redline: Filter Drawer */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Redline Spec: Filter Drawer</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="flex flex-col gap-6">
            {/* Visual representation */}
            <div className="p-8 bg-role-surface-muted rounded-token-md border border-role-border">
              <div className="relative h-96 bg-role-surface border border-role-border rounded-token-md overflow-hidden">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <p className="admin-caption text-white">60% black scrim</p>
                </div>
                
                {/* Drawer */}
                <div className="absolute right-0 top-0 bottom-0 w-96 bg-role-surface border-l border-role-border shadow-iu-xl">
                  <div className="p-6 border-b border-role-border flex items-center justify-between">
                    <h4 className="admin-h2">Filters</h4>
                    <button className="p-2 hover:bg-role-surface-muted rounded">×</button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <p className="admin-small mb-2">Status</p>
                      <div className="flex gap-2">
                        <IUBadge>All</IUBadge>
                        <IUBadge variant="success">Active</IUBadge>
                      </div>
                    </div>
                    <div>
                      <p className="admin-small mb-2">Role</p>
                      <div className="flex gap-2">
                        <IUBadge>Student</IUBadge>
                        <IUBadge>Staff</IUBadge>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-role-border">
                    <div className="flex gap-3">
                      <IUButton variant="outline" className="flex-1">Clear</IUButton>
                      <IUButton className="flex-1">Apply</IUButton>
                    </div>
                  </div>
                </div>
                
                {/* Dimension markers */}
                <div className="absolute top-4 right-96 flex items-center gap-2">
                  <div className="px-2 py-1 bg-[var(--iu-info)] text-white text-xs rounded">
                    Width: 384px (w-96)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Dimensions</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Width: 384px (w-96)</li>
                  <li>• Height: 100vh (full viewport)</li>
                  <li>• Position: Fixed right</li>
                  <li>• Z-index: 40 (drawer), 50 (scrim)</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Animation</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Slide-in: 300ms ease-out from right</li>
                  <li>• Scrim fade: 200ms</li>
                  <li>• Transform: translateX(100%) to 0</li>
                  <li>• ESC key closes drawer</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Structure</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Header: 24px padding, border-b</li>
                  <li>• Content: 24px padding, scrollable</li>
                  <li>• Footer: 24px padding, border-t, sticky bottom</li>
                  <li>• Background: bg-role-surface</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Accessibility</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• role="dialog" on drawer</li>
                  <li>• Focus trap within drawer</li>
                  <li>• ESC closes (if not loading)</li>
                  <li>• Return focus to trigger on close</li>
                </ul>
              </div>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Chart.js Implementation Notes */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Chart.js Container Specifications</IUCardTitle>
        </IUCardHeader>
        <IUCardContent>
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-[var(--iu-info)]/10 border border-[var(--iu-info)]/20 rounded-token-md">
              <h6 className="admin-subtitle mb-3">⚠️ Important Implementation Notes</h6>
              <p className="admin-small text-role-secondary">
                Charts use Recharts library, not Chart.js. The implementation details below apply to all chart components.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Canvas Sizes</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Line Chart: 100% width × 300px height</li>
                  <li>• Bar Chart: 100% width × 300px height</li>
                  <li>• Doughnut Chart: 100% width × 300px height</li>
                  <li>• Responsive: maintainAspectRatio: false</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Container Padding</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Card padding: 24px (p-6)</li>
                  <li>• Chart margin: 0 (handled by Recharts)</li>
                  <li>• Legend spacing: 16px top (mt-4)</li>
                  <li>• Title spacing: 16px bottom (mb-4)</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Legend Area</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Position: Below chart (bottom)</li>
                  <li>• Layout: Horizontal center-aligned</li>
                  <li>• Font: admin-caption (12px)</li>
                  <li>• Icon: 12px circle or square</li>
                  <li>• Gap: 16px between legend items</li>
                </ul>
              </div>
              <div className="p-4 bg-role-surface-muted rounded-token-md">
                <h6 className="admin-subtitle mb-3">Dataset Labels & Colors</h6>
                <ul className="admin-caption text-role-secondary space-y-2">
                  <li>• Primary: var(--iu-accent) #990000</li>
                  <li>• Secondary: var(--iu-info) #1D4ED8</li>
                  <li>• Tertiary: var(--iu-success) #1F9D55</li>
                  <li>• Quaternary: var(--iu-warning) #DC8A00</li>
                  <li>• Grid lines: var(--iu-neutral-300)</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-role-surface-muted rounded-token-md">
              <h6 className="admin-subtitle mb-3">Code Example (Recharts)</h6>
              <pre className="admin-caption font-mono text-role-secondary bg-role-surface p-4 rounded-token-md overflow-x-auto">
{`<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--iu-neutral-300)" />
    <XAxis dataKey="name" stroke="var(--iu-neutral-600)" />
    <YAxis stroke="var(--iu-neutral-600)" />
    <Tooltip />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="var(--iu-accent)" 
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>`}
              </pre>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
    </div>
  );
}
