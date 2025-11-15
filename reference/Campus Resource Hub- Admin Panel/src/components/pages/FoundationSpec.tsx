import React from 'react';
import { IUCard, IUCardHeader, IUCardTitle, IUCardContent } from '../IUCard';

export function FoundationSpec() {
  return (
    <div className="flex flex-col gap-token-8">
      <div>
        <h3 className="admin-h1 mb-2">Foundation Specification Board</h3>
        <p className="admin-body text-role-secondary">
          Complete reference for all design tokens used in the Admin experience
        </p>
      </div>
      
      {/* Semantic Role Tokens */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Semantic Role Tokens</IUCardTitle>
          <p className="admin-small mt-1">Theme-aware color roles mapped to brand colors</p>
        </IUCardHeader>
        <IUCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-token-6">
            {/* Light Theme */}
            <div>
              <h5 className="admin-subtitle mb-4">Light Theme (Default)</h5>
              <div className="flex flex-col gap-token-3">
                {[
                  { token: 'Role/Background', value: 'var(--iu-cream)', hex: '#EEEDEB', className: 'bg-role-background' },
                  { token: 'Role/Surface', value: 'var(--iu-neutral-000)', hex: '#FFFFFF', className: 'bg-role-surface' },
                  { token: 'Role/SurfaceMuted', value: 'var(--iu-neutral-100)', hex: '#F3F4F6', className: 'bg-role-surface-muted' },
                  { token: 'Role/Border', value: 'var(--iu-neutral-300)', hex: '#D1D5DB', className: 'border-role-border' },
                  { token: 'Role/TextPrimary', value: 'var(--iu-neutral-900)', hex: '#111111', className: 'text-role-primary' },
                  { token: 'Role/TextSecondary', value: 'var(--iu-neutral-600)', hex: '#4B5563', className: 'text-role-secondary' },
                  { token: 'Role/Accent', value: 'var(--iu-crimson)', hex: '#990000', className: 'bg-role-accent' },
                  { token: 'Role/AccentHover', value: 'var(--iu-crimson-700)', hex: '#7D0000', className: 'bg-role-accent-hover' },
                  { token: 'Role/Focus', value: '#0EA5E9', hex: '#0EA5E9', className: 'focus-role-focus' },
                ].map(item => (
                  <div key={item.token} className="flex items-center justify-between p-token-4 bg-role-surface-muted rounded-token-md border border-role-border">
                    <div className="flex items-center gap-token-3">
                      <div 
                        className={`w-12 h-12 rounded-token-sm border border-role-border ${item.className}`}
                        style={item.token.includes('Text') ? { backgroundColor: item.value } : {}}
                      />
                      <div>
                        <p className="admin-body-medium">{item.token}</p>
                        <code className="admin-caption font-mono text-role-secondary">{item.value}</code>
                      </div>
                    </div>
                    <span className="admin-caption font-mono">{item.hex}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dark Theme */}
            <div>
              <h5 className="admin-subtitle mb-4">Dark Theme</h5>
              <div className="flex flex-col gap-token-3">
                {[
                  { token: 'Role/Background', value: 'var(--iu-neutral-900)', hex: '#111111' },
                  { token: 'Role/Surface', value: 'var(--iu-neutral-800)', hex: '#1F2937' },
                  { token: 'Role/SurfaceMuted', value: 'var(--iu-neutral-700)', hex: '#374151' },
                  { token: 'Role/Border', value: 'var(--iu-neutral-600)', hex: '#4B5563' },
                  { token: 'Role/TextPrimary', value: 'var(--iu-neutral-050)', hex: '#FAFAFA' },
                  { token: 'Role/TextSecondary', value: 'var(--iu-neutral-400)', hex: '#9CA3AF' },
                  { token: 'Role/Accent', value: 'var(--iu-crimson)', hex: '#990000 (unchanged)' },
                  { token: 'Role/AccentHover', value: 'var(--iu-crimson-700)', hex: '#7D0000 (unchanged)' },
                  { token: 'Role/Focus', value: '#0EA5E9', hex: '#0EA5E9 (unchanged)' },
                ].map(item => (
                  <div key={item.token} className="flex items-center justify-between p-token-4 bg-role-surface-muted rounded-token-md border border-role-border">
                    <div>
                      <p className="admin-body-medium">{item.token}</p>
                      <code className="admin-caption font-mono text-role-secondary">{item.value}</code>
                    </div>
                    <span className="admin-caption font-mono">{item.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Spacing Tokens */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Spacing Scale</IUCardTitle>
          <p className="admin-small mt-1">Consistent spacing tokens for layout and components</p>
        </IUCardHeader>
        <IUCardContent>
          <div className="flex flex-col gap-token-3">
            {[
              { token: 'space-1', px: 4, usage: 'Tight spacing, icon padding' },
              { token: 'space-2', px: 8, usage: 'Small gaps, compact layouts' },
              { token: 'space-3', px: 12, usage: 'Default gap in dense components' },
              { token: 'space-4', px: 16, usage: 'Standard gap, input padding' },
              { token: 'space-5', px: 20, usage: 'Medium spacing' },
              { token: 'space-6', px: 24, usage: 'Card padding, section spacing' },
              { token: 'space-8', px: 32, usage: 'Large section gaps' },
              { token: 'space-10', px: 40, usage: 'Extra large spacing' },
              { token: 'space-12', px: 48, usage: 'Major section breaks' },
              { token: 'space-16', px: 64, usage: 'Page section spacing' },
            ].map(item => (
              <div key={item.token} className="flex items-center gap-token-4 p-token-4 bg-role-surface-muted rounded-token-md">
                <div className="flex items-center gap-token-4 flex-1">
                  <div className="h-12 bg-role-accent rounded-token-sm" style={{ width: `${item.px}px` }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-token-2 mb-1">
                      <code className="admin-body-medium font-mono">--{item.token}</code>
                      <span className="admin-caption">({item.px}px)</span>
                    </div>
                    <p className="admin-small">{item.usage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Radius Tokens */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Border Radius Tokens</IUCardTitle>
          <p className="admin-small mt-1">Standardized corner radius values</p>
        </IUCardHeader>
        <IUCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-token-6">
            {[
              { token: 'radius-sm', px: 4, usage: 'Badges, chips, tight components' },
              { token: 'radius-md', px: 8, usage: 'Buttons, inputs, standard cards' },
              { token: 'radius-lg', px: 12, usage: 'Large cards, modals, containers' },
            ].map(item => (
              <div key={item.token} className="flex flex-col items-center gap-token-4 p-token-6 bg-role-surface-muted rounded-token-md">
                <div 
                  className="w-24 h-24 bg-role-accent"
                  style={{ borderRadius: `${item.px}px` }}
                />
                <div className="text-center">
                  <code className="admin-body-medium font-mono">--{item.token}</code>
                  <p className="admin-caption mt-1">{item.px}px</p>
                  <p className="admin-small mt-2">{item.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Shadow Tokens */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Shadow Tokens</IUCardTitle>
          <p className="admin-small mt-1">Elevation system for depth and hierarchy</p>
        </IUCardHeader>
        <IUCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-token-6">
            {[
              { token: 'shadow-sm', value: '0 1px 2px rgba(0,0,0,0.06)', usage: 'Subtle elevation, cards', className: 'shadow-iu-sm' },
              { token: 'shadow-md', value: '0 4px 12px rgba(0,0,0,0.10)', usage: 'Medium elevation, dropdowns', className: 'shadow-iu-md' },
              { token: 'shadow-lg', value: '0 8px 24px rgba(0,0,0,0.14)', usage: 'High elevation, modals', className: 'shadow-iu-lg' },
            ].map(item => (
              <div key={item.token} className="flex flex-col items-center gap-token-4 p-token-6 bg-role-surface-muted rounded-token-md">
                <div 
                  className={`w-24 h-24 bg-role-surface rounded-token-md ${item.className}`}
                />
                <div className="text-center">
                  <code className="admin-body-medium font-mono">--{item.token}</code>
                  <p className="admin-caption mt-1 break-all">{item.value}</p>
                  <p className="admin-small mt-2">{item.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Typography Styles */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Admin Typography System</IUCardTitle>
          <p className="admin-small mt-1">Text styles optimized for admin interfaces</p>
        </IUCardHeader>
        <IUCardContent>
          <div className="flex flex-col gap-token-4">
            {[
              { name: 'Admin/H1', className: 'admin-h1', size: '32px', lineHeight: '44px', weight: '700', sample: 'Page Title' },
              { name: 'Admin/H2', className: 'admin-h2', size: '24px', lineHeight: '34px', weight: '600', sample: 'Section Heading' },
              { name: 'Admin/Subtitle', className: 'admin-subtitle', size: '18px', lineHeight: '28px', weight: '600', sample: 'Subsection Title' },
              { name: 'Admin/Body', className: 'admin-body', size: '16px', lineHeight: '26px', weight: '400', sample: 'Body text for readable content' },
              { name: 'Admin/Body-M', className: 'admin-body-medium', size: '16px', lineHeight: '26px', weight: '500', sample: 'Medium weight body text' },
              { name: 'Admin/Small', className: 'admin-small', size: '14px', lineHeight: '22px', weight: '400', sample: 'Secondary information and helper text' },
              { name: 'Admin/Caption', className: 'admin-caption', size: '12px', lineHeight: '18px', weight: '500', sample: 'METADATA AND LABELS' },
            ].map(style => (
              <div key={style.name} className="p-token-6 bg-role-surface-muted rounded-token-md border border-role-border">
                <div className="flex items-baseline justify-between mb-3">
                  <code className="admin-body-medium font-mono">{style.name}</code>
                  <div className="flex gap-token-4 admin-caption">
                    <span>{style.size}/{style.lineHeight}</span>
                    <span>Weight: {style.weight}</span>
                  </div>
                </div>
                <p className={style.className}>{style.sample}</p>
              </div>
            ))}
          </div>
        </IUCardContent>
      </IUCard>
      
      {/* Usage Guidelines */}
      <IUCard>
        <IUCardHeader>
          <IUCardTitle>Admin Layout Guidelines</IUCardTitle>
          <p className="admin-small mt-1">Standardized spacing for admin pages</p>
        </IUCardHeader>
        <IUCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-token-6">
            <div className="flex flex-col gap-token-3">
              <h5 className="admin-subtitle">Container Padding</h5>
              <div className="p-token-4 bg-role-surface-muted rounded-token-md">
                <p className="admin-body-medium mb-2">Page content container</p>
                <code className="admin-small font-mono">padding: var(--space-6) (24px)</code>
              </div>
              <div className="p-token-4 bg-role-surface-muted rounded-token-md">
                <p className="admin-body-medium mb-2">Card padding</p>
                <code className="admin-small font-mono">padding: var(--space-5) to var(--space-6) (20-24px)</code>
              </div>
            </div>
            
            <div className="flex flex-col gap-token-3">
              <h5 className="admin-subtitle">Element Spacing</h5>
              <div className="p-token-4 bg-role-surface-muted rounded-token-md">
                <p className="admin-body-medium mb-2">Card-to-card gap</p>
                <code className="admin-small font-mono">gap: var(--space-6) (24px)</code>
              </div>
              <div className="p-token-4 bg-role-surface-muted rounded-token-md">
                <p className="admin-body-medium mb-2">Section gap</p>
                <code className="admin-small font-mono">gap: var(--space-8) to var(--space-12) (32-48px)</code>
              </div>
            </div>
          </div>
        </IUCardContent>
      </IUCard>
    </div>
  );
}
