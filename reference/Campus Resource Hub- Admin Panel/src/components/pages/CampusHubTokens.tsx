import React from 'react';
import { Palette, Type, Layers, Grid as GridIcon, Circle } from 'lucide-react';

/**
 * CAMPUS HUB / TOKENS
 * Complete design token reference for Indiana University Campus Hub
 */

export function CampusHubTokens() {
  // Color tokens
  const brandColors = [
    { name: 'brand.crimson', value: '#990000', var: '--brand-crimson', usage: 'Primary brand color, CTAs, links' },
    { name: 'brand.cream', value: '#EEDEDB', var: '--brand-cream', usage: 'Secondary brand color, backgrounds' },
    { name: 'brand.black', value: '#000000', var: '--brand-black', usage: 'Pure black for high contrast' },
    { name: 'brand.white', value: '#FFFFFF', var: '--brand-white', usage: 'Pure white for contrast' },
  ];
  
  const textColors = [
    { name: 'fg.default', value: '#1F1F1F', var: '--fg-default', usage: 'Primary text, headings' },
    { name: 'fg.muted', value: '#4B4B4B', var: '--fg-muted', usage: 'Secondary text, labels' },
    { name: 'fg.subtle', value: '#666666', var: '--fg-subtle', usage: 'Tertiary text, captions' },
  ];
  
  const backgroundColors = [
    { name: 'bg.canvas', value: '#F7F6F4', var: '--bg-canvas', usage: 'Page background' },
    { name: 'bg.surface', value: '#FFFFFF', var: '--bg-surface', usage: 'Card/panel surface' },
    { name: 'bg.subtle', value: '#F1EFEC', var: '--bg-subtle', usage: 'Muted backgrounds, hover states' },
  ];
  
  const borderColors = [
    { name: 'border.default', value: '#E5E1DC', var: '--border-default', usage: 'Standard borders' },
    { name: 'border.muted', value: '#EEE9E3', var: '--border-muted', usage: 'Subtle borders, dividers' },
  ];
  
  const statusColors = [
    { name: 'status.success', value: '#1B7D37', var: '--status-success', usage: 'Success states, confirmations' },
    { name: 'status.warning', value: '#A05A00', var: '--status-warning', usage: 'Warning states, alerts' },
    { name: 'status.danger', value: '#9B1C1C', var: '--status-danger', usage: 'Error states, destructive actions' },
    { name: 'status.info', value: '#0B5CAD', var: '--status-info', usage: 'Info states, help text' },
  ];
  
  const chartColors = [
    { name: 'chart.1', value: '#990000', var: '--chart-1', usage: 'Primary data series (Crimson)' },
    { name: 'chart.2', value: '#B53A3A', var: '--chart-2', usage: 'Secondary data series' },
    { name: 'chart.3', value: '#D56A6A', var: '--chart-3', usage: 'Tertiary data series' },
    { name: 'chart.4', value: '#F0A5A5', var: '--chart-4', usage: 'Quaternary data series' },
    { name: 'chart.5', value: '#6B7280', var: '--chart-5', usage: 'Neutral data series' },
    { name: 'chart.6', value: '#A1A1AA', var: '--chart-6', usage: 'Light neutral series' },
  ];
  
  // Typography scale
  const typeScale = [
    { name: 'Display', size: '40px', lineHeight: '48px', weight: '600', className: 'text-display', usage: 'Hero headlines' },
    { name: 'H1', size: '32px', lineHeight: '40px', weight: '600', className: 'text-h1', usage: 'Page titles' },
    { name: 'H2', size: '28px', lineHeight: '36px', weight: '600', className: 'text-h2', usage: 'Section headings' },
    { name: 'H3', size: '24px', lineHeight: '32px', weight: '600', className: 'text-h3', usage: 'Subsection headings' },
    { name: 'H4', size: '20px', lineHeight: '28px', weight: '600', className: 'text-h4', usage: 'Card titles' },
    { name: 'Body', size: '16px', lineHeight: '24px', weight: '400', className: 'text-body', usage: 'Body text (base)' },
    { name: 'Caption', size: '14px', lineHeight: '20px', weight: '400', className: 'text-caption', usage: 'Supporting text' },
    { name: 'Micro', size: '12px', lineHeight: '16px', weight: '400', className: 'text-micro', usage: 'Fine print, labels' },
  ];
  
  const typeWeights = [
    { weight: '400', name: 'Regular', usage: 'Body text, captions' },
    { weight: '500', name: 'Medium', usage: 'Emphasis, labels' },
    { weight: '600', name: 'Semibold', usage: 'Headings, buttons' },
  ];
  
  // Spacing tokens
  const spacingTokens = [
    { name: 'space.1', value: '4px', var: '--space-1', usage: 'Tight spacing' },
    { name: 'space.2', value: '8px', var: '--space-2', usage: 'Compact spacing' },
    { name: 'space.3', value: '12px', var: '--space-3', usage: 'Small spacing' },
    { name: 'space.4', value: '16px', var: '--space-4', usage: 'Base spacing' },
    { name: 'space.5', value: '20px', var: '--space-5', usage: 'Medium spacing' },
    { name: 'space.6', value: '24px', var: '--space-6', usage: 'Large spacing (sections)' },
    { name: 'space.7', value: '28px', var: '--space-7', usage: 'XL spacing' },
    { name: 'space.8', value: '32px', var: '--space-8', usage: '2XL spacing' },
    { name: 'space.10', value: '40px', var: '--space-10', usage: '3XL spacing' },
    { name: 'space.12', value: '48px', var: '--space-12', usage: '4XL spacing' },
  ];
  
  // Radius tokens
  const radiusTokens = [
    { name: 'radius.sm', value: '6px', var: '--radius-sm', usage: 'Small elements (badges, chips)' },
    { name: 'radius.md', value: '10px', var: '--radius-md', usage: 'Medium elements (buttons, inputs)' },
    { name: 'radius.lg', value: '14px', var: '--radius-lg', usage: 'Large elements (cards)' },
    { name: 'radius.xl', value: '20px', var: '--radius-xl', usage: 'XL elements (modals, containers)' },
  ];
  
  // Shadow tokens
  const shadowTokens = [
    { name: 'shadow.sm', value: '0 1px 2px 0 rgba(0,0,0,0.10)', var: '--shadow-sm', usage: 'Subtle elevation' },
    { name: 'shadow.md', value: '0 4px 10px 0 rgba(0,0,0,0.12)', var: '--shadow-md', usage: 'Card elevation' },
    { name: 'shadow.lg', value: '0 10px 30px 0 rgba(0,0,0,0.14)', var: '--shadow-lg', usage: 'Modal/dropdown elevation' },
  ];
  
  // Layout grid specs
  const layoutSpecs = [
    { breakpoint: 'Desktop', frameWidth: '1440px', contentMax: '1280px', columns: '12', gutters: '24px', margins: '80px' },
    { breakpoint: 'Tablet', frameWidth: '1024px', contentMax: '100%', columns: '12', gutters: '16px', margins: '40px' },
    { breakpoint: 'Mobile', frameWidth: '390px', contentMax: '100%', columns: '4', gutters: '12px', margins: '16px' },
  ];
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 mb-2">Campus Hub / Tokens</h1>
        <p className="text-body text-fg-muted">
          Complete design token reference for Indiana University Campus Hub. Use these named variables throughout the system.
        </p>
      </div>
      
      {/* Colors Section */}
      <section className="section-spacing">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-crimson rounded-md flex items-center justify-center">
            <Palette className="w-5 h-5 text-brand-white" />
          </div>
          <h2 className="text-h2">Color Tokens</h2>
        </div>
        
        {/* Brand Colors */}
        <div className="mb-8">
          <h3 className="text-h4 mb-4">Brand Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {brandColors.map((color) => (
              <div key={color.name} className="bg-surface border border-default rounded-lg p-4">
                <div 
                  className="w-full h-20 rounded-md mb-3 border border-muted"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-caption-semibold mb-1">{color.name}</p>
                <p className="text-micro text-fg-subtle mb-1">{color.value}</p>
                <p className="text-micro text-fg-subtle mb-2">var({color.var})</p>
                <p className="text-caption text-fg-muted">{color.usage}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Text Colors */}
        <div className="mb-8">
          <h3 className="text-h4 mb-4">Text / Foreground</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {textColors.map((color) => (
              <div key={color.name} className="bg-surface border border-default rounded-lg p-4">
                <div 
                  className="w-full h-20 rounded-md mb-3 border border-muted"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-caption-semibold mb-1">{color.name}</p>
                <p className="text-micro text-fg-subtle mb-1">{color.value}</p>
                <p className="text-micro text-fg-subtle mb-2">var({color.var})</p>
                <p className="text-caption text-fg-muted">{color.usage}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background Colors */}
        <div className="mb-8">
          <h3 className="text-h4 mb-4">Backgrounds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {backgroundColors.map((color) => (
              <div key={color.name} className="bg-surface border border-default rounded-lg p-4">
                <div 
                  className="w-full h-20 rounded-md mb-3 border border-muted"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-caption-semibold mb-1">{color.name}</p>
                <p className="text-micro text-fg-subtle mb-1">{color.value}</p>
                <p className="text-micro text-fg-subtle mb-2">var({color.var})</p>
                <p className="text-caption text-fg-muted">{color.usage}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Border Colors */}
        <div className="mb-8">
          <h3 className="text-h4 mb-4">Borders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {borderColors.map((color) => (
              <div key={color.name} className="bg-surface border border-default rounded-lg p-4">
                <div 
                  className="w-full h-20 rounded-md mb-3"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-caption-semibold mb-1">{color.name}</p>
                <p className="text-micro text-fg-subtle mb-1">{color.value}</p>
                <p className="text-micro text-fg-subtle mb-2">var({color.var})</p>
                <p className="text-caption text-fg-muted">{color.usage}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Status Colors */}
        <div className="mb-8">
          <h3 className="text-h4 mb-4">Status Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColors.map((color) => (
              <div key={color.name} className="bg-surface border border-default rounded-lg p-4">
                <div 
                  className="w-full h-20 rounded-md mb-3 border border-muted"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-caption-semibold mb-1">{color.name}</p>
                <p className="text-micro text-fg-subtle mb-1">{color.value}</p>
                <p className="text-micro text-fg-subtle mb-2">var({color.var})</p>
                <p className="text-caption text-fg-muted">{color.usage}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chart Colors */}
        <div className="mb-8">
          <h3 className="text-h4 mb-4">Chart Palette (6-step)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {chartColors.map((color) => (
              <div key={color.name} className="bg-surface border border-default rounded-lg p-4">
                <div 
                  className="w-full h-20 rounded-md mb-3 border border-muted"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-caption-semibold mb-1">{color.name}</p>
                <p className="text-micro text-fg-subtle mb-1">{color.value}</p>
                <p className="text-caption text-fg-muted mt-2">{color.usage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Typography Section */}
      <section className="section-spacing">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-crimson rounded-md flex items-center justify-center">
            <Type className="w-5 h-5 text-brand-white" />
          </div>
          <h2 className="text-h2">Typography</h2>
        </div>
        
        <div className="bg-surface border border-default rounded-lg p-6 mb-6">
          <p className="text-caption text-fg-muted mb-4">
            Font Family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
          </p>
          <p className="text-caption text-fg-muted mb-4">
            Scale: 12, 14, 16 (base), 20, 24, 28, 32, 40
          </p>
          <p className="text-caption text-fg-muted">
            Weights: 400 (Regular), 500 (Medium), 600 (Semibold)
          </p>
        </div>
        
        {/* Type Scale */}
        <div className="mb-8">
          <h3 className="text-h4 mb-4">Type Scale</h3>
          <div className="bg-surface border border-default rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-subtle">
                <tr>
                  <th className="text-left p-4 text-caption-semibold">Style</th>
                  <th className="text-left p-4 text-caption-semibold">Size / Line Height</th>
                  <th className="text-left p-4 text-caption-semibold">Weight</th>
                  <th className="text-left p-4 text-caption-semibold">Class</th>
                  <th className="text-left p-4 text-caption-semibold">Usage</th>
                  <th className="text-left p-4 text-caption-semibold">Preview</th>
                </tr>
              </thead>
              <tbody>
                {typeScale.map((type, idx) => (
                  <tr key={type.name} className={idx !== typeScale.length - 1 ? 'border-b border-muted' : ''}>
                    <td className="p-4 text-caption-medium">{type.name}</td>
                    <td className="p-4 text-micro text-fg-subtle">{type.size} / {type.lineHeight}</td>
                    <td className="p-4 text-micro text-fg-subtle">{type.weight}</td>
                    <td className="p-4 text-micro font-mono text-fg-subtle">.{type.className}</td>
                    <td className="p-4 text-caption text-fg-muted">{type.usage}</td>
                    <td className="p-4">
                      <span className={type.className}>Aa</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Type Weights */}
        <div>
          <h3 className="text-h4 mb-4">Font Weights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {typeWeights.map((w) => (
              <div key={w.weight} className="bg-surface border border-default rounded-lg p-4">
                <p className="text-h3 mb-2" style={{ fontWeight: w.weight }}>Aa Bb Cc</p>
                <p className="text-caption-semibold mb-1">{w.name} ({w.weight})</p>
                <p className="text-caption text-fg-muted">{w.usage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Spacing Section */}
      <section className="section-spacing">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-crimson rounded-md flex items-center justify-center">
            <Layers className="w-5 h-5 text-brand-white" />
          </div>
          <h2 className="text-h2">Spacing (4pt Grid)</h2>
        </div>
        
        <div className="bg-surface border border-default rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-subtle">
              <tr>
                <th className="text-left p-4 text-caption-semibold">Token</th>
                <th className="text-left p-4 text-caption-semibold">Value</th>
                <th className="text-left p-4 text-caption-semibold">Variable</th>
                <th className="text-left p-4 text-caption-semibold">Usage</th>
                <th className="text-left p-4 text-caption-semibold">Visual</th>
              </tr>
            </thead>
            <tbody>
              {spacingTokens.map((token, idx) => (
                <tr key={token.name} className={idx !== spacingTokens.length - 1 ? 'border-b border-muted' : ''}>
                  <td className="p-4 text-caption-medium">{token.name}</td>
                  <td className="p-4 text-micro text-fg-subtle">{token.value}</td>
                  <td className="p-4 text-micro font-mono text-fg-subtle">var({token.var})</td>
                  <td className="p-4 text-caption text-fg-muted">{token.usage}</td>
                  <td className="p-4">
                    <div className="bg-brand-crimson rounded" style={{ width: token.value, height: '16px' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-surface border border-default rounded-lg p-4 mt-4">
          <p className="text-caption-semibold mb-2">Section Spacing</p>
          <p className="text-caption text-fg-muted">
            Consistent 24px spacing between major page sections (var(--section-spacing))
          </p>
        </div>
      </section>
      
      {/* Radius Section */}
      <section className="section-spacing">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-crimson rounded-md flex items-center justify-center">
            <Circle className="w-5 h-5 text-brand-white" />
          </div>
          <h2 className="text-h2">Border Radius</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {radiusTokens.map((token) => (
            <div key={token.name} className="bg-surface border border-default rounded-lg p-4">
              <div 
                className="w-full h-24 bg-brand-crimson mb-3"
                style={{ borderRadius: token.value }}
              />
              <p className="text-caption-semibold mb-1">{token.name}</p>
              <p className="text-micro text-fg-subtle mb-1">{token.value}</p>
              <p className="text-micro text-fg-subtle mb-2">var({token.var})</p>
              <p className="text-caption text-fg-muted">{token.usage}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Shadow Section */}
      <section className="section-spacing">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-crimson rounded-md flex items-center justify-center">
            <Layers className="w-5 h-5 text-brand-white" />
          </div>
          <h2 className="text-h2">Shadows</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shadowTokens.map((token) => (
            <div key={token.name} className="bg-canvas p-8 rounded-lg">
              <div 
                className="w-full h-32 bg-surface rounded-lg mb-3"
                style={{ boxShadow: token.value }}
              />
              <p className="text-caption-semibold mb-1">{token.name}</p>
              <p className="text-micro text-fg-subtle mb-2">var({token.var})</p>
              <p className="text-caption text-fg-muted">{token.usage}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Layout Grid Section */}
      <section className="section-spacing">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-crimson rounded-md flex items-center justify-center">
            <GridIcon className="w-5 h-5 text-brand-white" />
          </div>
          <h2 className="text-h2">Layout Grid</h2>
        </div>
        
        <div className="bg-surface border border-default rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-subtle">
              <tr>
                <th className="text-left p-4 text-caption-semibold">Breakpoint</th>
                <th className="text-left p-4 text-caption-semibold">Frame Width</th>
                <th className="text-left p-4 text-caption-semibold">Content Max</th>
                <th className="text-left p-4 text-caption-semibold">Columns</th>
                <th className="text-left p-4 text-caption-semibold">Gutters</th>
                <th className="text-left p-4 text-caption-semibold">Margins</th>
              </tr>
            </thead>
            <tbody>
              {layoutSpecs.map((spec, idx) => (
                <tr key={spec.breakpoint} className={idx !== layoutSpecs.length - 1 ? 'border-b border-muted' : ''}>
                  <td className="p-4 text-caption-medium">{spec.breakpoint}</td>
                  <td className="p-4 text-micro text-fg-subtle">{spec.frameWidth}</td>
                  <td className="p-4 text-micro text-fg-subtle">{spec.contentMax}</td>
                  <td className="p-4 text-micro text-fg-subtle">{spec.columns}</td>
                  <td className="p-4 text-micro text-fg-subtle">{spec.gutters}</td>
                  <td className="p-4 text-micro text-fg-subtle">{spec.margins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
