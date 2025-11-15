import React from 'react';

/**
 * CH/Badge (Unified Chips/Badges)
 * Badge component with unified accent color system
 * Variants: neutral, success, warning, danger, info
 * Sizes: sm, md
 * 
 * Success: accent.green.bg + accent.green text
 * Warning: accent.amber.bg + accent.amber text
 * Danger: accent.red.bg + accent.red text
 */

export interface CHBadgeProps {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function CHBadge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}: CHBadgeProps) {
  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-micro-semibold',           // 8px H, 4px V, 12px text
    md: 'px-2.5 py-1.5 text-caption-semibold',     // 10px H, 6px V, 13px text
  };
  
  // Base styles - Auto Layout with tokens
  const baseStyles = 'inline-flex items-center justify-center rounded-sm whitespace-nowrap';
  
  // Variant styles - unified accent color system
  const variantStyles = {
    neutral: 'bg-subtle text-fg-default border border-muted',
    
    // Success: accent.green.bg (#E8F5E9) + accent.green text (#1B5E20)
    success: 'bg-accent-green-light text-accent-green border border-accent-green/20',
    
    // Warning: accent.amber.bg (#FFF4E0) + accent.amber text (#8A5A00)
    warning: 'bg-accent-amber-light text-accent-amber border border-accent-amber/20',
    
    // Danger: accent.red.bg (#FFEBEE) + accent.red text (#B71C1C)
    danger: 'bg-accent-red-light text-accent-red border border-accent-red/20',
    
    // Info: Blue accent (legacy)
    info: 'bg-info-light text-info border border-info/20',
  };
  
  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
