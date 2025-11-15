import React from 'react';
import { Check, Star, Package, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { IUCard, IUCardHeader, IUCardTitle, IUCardContent } from '../IUCard';
import { IUButton } from '../IUButton';
import { IUInput, IUTextarea, IUSelect } from '../IUInput';
import { IUBadge, IUChip } from '../IUBadge';
import { KPICard } from '../KPICard';

export function DesignSystem() {
  return (
    <div className="space-y-12">
      {/* Color System */}
      <section>
        <h3 className="text-iu-primary mb-6">IU Color System</h3>
        
        {/* Brand Colors */}
        <div className="mb-8">
          <h5 className="text-iu-primary mb-4">Brand Colors</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-24 bg-iu-crimson rounded-[var(--radius-md)] mb-2 flex items-center justify-center text-white">
                #990000
              </div>
              <p className="text-sm text-iu-primary">IU Crimson</p>
              <p className="text-caption text-iu-secondary">Primary Brand</p>
            </div>
            <div>
              <div className="h-24 bg-iu-cream rounded-[var(--radius-md)] mb-2 border border-iu flex items-center justify-center">
                #EEEDEB
              </div>
              <p className="text-sm text-iu-primary">IU Cream</p>
              <p className="text-caption text-iu-secondary">Secondary Brand</p>
            </div>
            <div>
              <div className="h-24 bg-[var(--iu-crimson-700)] rounded-[var(--radius-md)] mb-2 flex items-center justify-center text-white">
                #7D0000
              </div>
              <p className="text-sm text-iu-primary">Crimson 700</p>
              <p className="text-caption text-iu-secondary">Hover/Pressed</p>
            </div>
            <div>
              <div className="h-24 bg-[var(--iu-crimson-300)] rounded-[var(--radius-md)] mb-2 flex items-center justify-center text-white">
                #C94F4F
              </div>
              <p className="text-sm text-iu-primary">Crimson 300</p>
              <p className="text-caption text-iu-secondary">Subtle Accent</p>
            </div>
          </div>
        </div>
        
        {/* Neutral Scale */}
        <div className="mb-8">
          <h5 className="text-iu-primary mb-4">Neutral Scale</h5>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {[
              { name: '900', color: 'var(--iu-neutral-900)' },
              { name: '800', color: 'var(--iu-neutral-800)' },
              { name: '700', color: 'var(--iu-neutral-700)' },
              { name: '600', color: 'var(--iu-neutral-600)' },
              { name: '500', color: 'var(--iu-neutral-500)' },
              { name: '400', color: 'var(--iu-neutral-400)' },
              { name: '300', color: 'var(--iu-neutral-300)' },
              { name: '200', color: 'var(--iu-neutral-200)' },
              { name: '100', color: 'var(--iu-neutral-100)' },
              { name: '050', color: 'var(--iu-neutral-050)' },
              { name: '000', color: 'var(--iu-neutral-000)' },
            ].map(({ name, color }) => (
              <div key={name}>
                <div className={`h-16 rounded-[var(--radius-sm)] mb-1 border border-iu`} style={{ backgroundColor: color }} />
                <p className="text-caption text-iu-secondary text-center">{name}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* State Colors */}
        <div>
          <h5 className="text-iu-primary mb-4">State Colors</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-16 bg-[var(--iu-success)] rounded-[var(--radius-md)] mb-2 flex items-center justify-center text-white">
                Success
              </div>
              <p className="text-caption text-iu-secondary">#1F9D55</p>
            </div>
            <div>
              <div className="h-16 bg-[var(--iu-warning)] rounded-[var(--radius-md)] mb-2 flex items-center justify-center text-white">
                Warning
              </div>
              <p className="text-caption text-iu-secondary">#DC8A00</p>
            </div>
            <div>
              <div className="h-16 bg-[var(--iu-danger)] rounded-[var(--radius-md)] mb-2 flex items-center justify-center text-white">
                Danger
              </div>
              <p className="text-caption text-iu-secondary">#B00020</p>
            </div>
            <div>
              <div className="h-16 bg-[var(--iu-info)] rounded-[var(--radius-md)] mb-2 flex items-center justify-center text-white">
                Info
              </div>
              <p className="text-caption text-iu-secondary">#1D4ED8</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Typography */}
      <section>
        <h3 className="text-iu-primary mb-6">Typography</h3>
        <IUCard>
          <div className="space-y-6">
            <div>
              <h1>Heading 1 - 64/76, Bold</h1>
              <p className="text-sm text-iu-secondary">IU/H1 - Used for hero sections and major page titles</p>
            </div>
            <div>
              <h2>Heading 2 - 48/60, Bold</h2>
              <p className="text-sm text-iu-secondary">IU/H2 - Used for section headings</p>
            </div>
            <div>
              <h3>Heading 3 - 32/44, Semibold</h3>
              <p className="text-sm text-iu-secondary">IU/H3 - Used for card titles and subsections</p>
            </div>
            <div>
              <h4>Heading 4 - 24/34, Semibold</h4>
              <p className="text-sm text-iu-secondary">IU/H4 - Used for component headings</p>
            </div>
            <div>
              <h5>Heading 5 - 20/30, Semibold</h5>
              <p className="text-sm text-iu-secondary">IU/Subtitle - Used for labels and subheadings</p>
            </div>
            <div>
              <p>Body - 16/26, Regular - This is the default body text used throughout the application for readable content.</p>
              <p className="text-sm text-iu-secondary mt-1">IU/Body - Primary text style</p>
            </div>
            <div>
              <small>Small - 14/22, Regular - Used for secondary information and helper text.</small>
              <p className="text-sm text-iu-secondary mt-1">IU/Small - Supporting text</p>
            </div>
            <div>
              <p className="text-caption">CAPTION - 12/18, Medium - Used for labels and metadata</p>
              <p className="text-sm text-iu-secondary mt-1">IU/Caption - Metadata and labels</p>
            </div>
          </div>
        </IUCard>
      </section>
      
      {/* Buttons */}
      <section>
        <h3 className="text-iu-primary mb-6">Buttons</h3>
        <IUCard>
          <div className="space-y-6">
            <div>
              <h5 className="mb-3">Variants</h5>
              <div className="flex flex-wrap items-center gap-3">
                <IUButton>Primary Button</IUButton>
                <IUButton variant="secondary">Secondary Button</IUButton>
                <IUButton variant="ghost">Ghost Button</IUButton>
                <IUButton variant="destructive">Destructive Button</IUButton>
                <IUButton disabled>Disabled Button</IUButton>
              </div>
            </div>
            
            <div>
              <h5 className="mb-3">Sizes</h5>
              <div className="flex flex-wrap items-center gap-3">
                <IUButton size="sm">Small</IUButton>
                <IUButton size="md">Medium</IUButton>
                <IUButton size="lg">Large</IUButton>
              </div>
            </div>
            
            <div>
              <h5 className="mb-3">With Icons</h5>
              <div className="flex flex-wrap items-center gap-3">
                <IUButton>
                  <Star className="w-4 h-4" />
                  With Icon
                </IUButton>
                <IUButton variant="secondary">
                  <Package className="w-4 h-4" />
                  Secondary with Icon
                </IUButton>
                <IUButton loading>Loading...</IUButton>
              </div>
            </div>
          </div>
        </IUCard>
      </section>
      
      {/* Form Inputs */}
      <section>
        <h3 className="text-iu-primary mb-6">Form Inputs</h3>
        <IUCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IUInput
              label="Text Input"
              placeholder="Enter text..."
              helperText="This is helper text"
            />
            <IUInput
              label="Required Field"
              placeholder="This field is required"
              required
            />
            <IUInput
              label="Input with Error"
              placeholder="Invalid value"
              error="This field has an error"
            />
            <IUInput
              label="Disabled Input"
              placeholder="Cannot edit"
              disabled
            />
            <IUSelect
              label="Select Input"
              options={[
                { value: '1', label: 'Option 1' },
                { value: '2', label: 'Option 2' },
                { value: '3', label: 'Option 3' }
              ]}
            />
            <div className="md:col-span-2">
              <IUTextarea
                label="Textarea"
                placeholder="Enter longer text here..."
                helperText="Up to 500 characters"
              />
            </div>
          </div>
        </IUCard>
      </section>
      
      {/* Badges & Chips */}
      <section>
        <h3 className="text-iu-primary mb-6">Badges & Chips</h3>
        <IUCard>
          <div className="space-y-6">
            <div>
              <h5 className="mb-3">Badges</h5>
              <div className="flex flex-wrap items-center gap-3">
                <IUBadge variant="default">Default</IUBadge>
                <IUBadge variant="success">Success</IUBadge>
                <IUBadge variant="warning">Warning</IUBadge>
                <IUBadge variant="danger">Danger</IUBadge>
                <IUBadge variant="info">Info</IUBadge>
                <IUBadge variant="neutral">Neutral</IUBadge>
              </div>
            </div>
            
            <div>
              <h5 className="mb-3">Chips (Removable)</h5>
              <div className="flex flex-wrap items-center gap-2">
                <IUChip onRemove={() => console.log('Remove')}>Filter: Study Room</IUChip>
                <IUChip onRemove={() => console.log('Remove')}>Location: Wells Library</IUChip>
                <IUChip onRemove={() => console.log('Remove')}>Capacity: 4-8</IUChip>
              </div>
            </div>
          </div>
        </IUCard>
      </section>
      
      {/* KPI Cards */}
      <section>
        <h3 className="text-iu-primary mb-6">KPI Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            icon={Package}
            label="Total Resources"
            value="247"
            delta={12}
            deltaType="up"
          />
          <KPICard
            icon={Calendar}
            label="Active Bookings"
            value="89"
            delta={5}
            deltaType="down"
          />
          <KPICard
            icon={MessageSquare}
            label="Messages"
            value="12"
            deltaType="flat"
          />
          <KPICard
            icon={Star}
            label="Avg Rating"
            value="4.7"
            delta={3}
            deltaType="up"
          />
        </div>
      </section>
      
      {/* Spacing & Shadows */}
      <section>
        <h3 className="text-iu-primary mb-6">Spacing, Radii & Shadows</h3>
        <IUCard>
          <div className="space-y-6">
            <div>
              <h5 className="mb-3">Spacing Scale (px)</h5>
              <div className="space-y-2">
                {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map(size => (
                  <div key={size} className="flex items-center gap-4">
                    <span className="text-sm text-iu-secondary w-12">{size}px</span>
                    <div className="h-8 bg-iu-crimson rounded-[var(--radius-sm)]" style={{ width: `${size}px` }} />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="mb-3">Border Radii</h5>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-[var(--iu-surface-muted)] rounded-[var(--radius-sm)]" />
                  <span className="text-sm text-iu-secondary">Small (4px)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-[var(--iu-surface-muted)] rounded-[var(--radius-md)]" />
                  <span className="text-sm text-iu-secondary">Medium (8px)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-[var(--iu-surface-muted)] rounded-[var(--radius-lg)]" />
                  <span className="text-sm text-iu-secondary">Large (12px)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="mb-3">Shadows</h5>
              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 bg-iu-surface shadow-iu-sm rounded-[var(--radius-md)]" />
                  <span className="text-sm text-iu-secondary">Small</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 bg-iu-surface shadow-iu-md rounded-[var(--radius-md)]" />
                  <span className="text-sm text-iu-secondary">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 bg-iu-surface shadow-iu-lg rounded-[var(--radius-md)]" />
                  <span className="text-sm text-iu-secondary">Large</span>
                </div>
              </div>
            </div>
          </div>
        </IUCard>
      </section>
      
      {/* Accessibility */}
      <section>
        <h3 className="text-iu-primary mb-6">Accessibility</h3>
        <IUCard>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--iu-success)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p><strong>WCAG 2.1 AA Compliant</strong></p>
                <p className="text-sm text-iu-secondary mt-1">All color combinations meet minimum contrast ratios for readability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--iu-success)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p><strong>Keyboard Navigation</strong></p>
                <p className="text-sm text-iu-secondary mt-1">All interactive elements are keyboard accessible with visible focus states</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--iu-success)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p><strong>Touch Targets</strong></p>
                <p className="text-sm text-iu-secondary mt-1">All interactive elements meet minimum 44×44px touch target size</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--iu-success)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p><strong>Focus Indicator</strong></p>
                <p className="text-sm text-iu-secondary mt-1">High-contrast focus ring (#0EA5E9) with 2px width and 2px offset</p>
                <div className="mt-2">
                  <button className="px-4 py-2 bg-iu-crimson text-white rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--iu-focus)]">
                    Focus me with Tab
                  </button>
                </div>
              </div>
            </div>
          </div>
        </IUCard>
      </section>
    </div>
  );
}
