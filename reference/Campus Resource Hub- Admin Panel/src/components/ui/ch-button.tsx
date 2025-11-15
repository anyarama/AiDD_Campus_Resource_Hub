import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * CH/Button
 * Unified button component with IU brand styling
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm (28h/12px), md (36h/14px), lg (44h/16px)
 * 
 * Primary: brand.crimson bg, white text; hover = darken 6%; active = scale 0.98
 * Secondary: white bg, brand.crimson border/text; hover = brand.cream.bg fill
 * Ghost: transparent bg; hover = rgba(153,0,0,0.08); text brand.crimson
 */

export interface CHButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function CHButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: CHButtonProps) {
  // Base styles - Auto Layout with tokens
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-medium transition-all duration-[120ms] ease-in
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-brand-crimson focus-visible:ring-offset-2
  `.trim().replace(/\s+/g, ' ');
  
  // Variant styles - unified interactive patterns
  const variantStyles = {
    // Primary: Crimson bg, white text, darken 6% on hover, scale 0.98 on active
    primary: `
      bg-brand-crimson text-brand-white 
      hover:brightness-[0.94] 
      active:scale-[0.98]
    `.trim().replace(/\s+/g, ' '),
    
    // Secondary: White bg, crimson border/text, cream bg on hover
    secondary: `
      bg-surface text-brand-crimson 
      border border-brand-crimson
      hover:bg-brand-cream-bg
      active:scale-[0.98]
    `.trim().replace(/\s+/g, ' '),
    
    // Ghost: Transparent, crimson text, subtle crimson bg on hover
    ghost: `
      bg-transparent text-brand-crimson 
      hover:bg-[rgba(153,0,0,0.08)]
      active:scale-[0.98]
    `.trim().replace(/\s+/g, ' '),
    
    // Danger: Red bg, white text, darken on hover, scale on active
    danger: `
      bg-danger text-brand-white 
      hover:brightness-[0.94]
      active:scale-[0.98]
    `.trim().replace(/\s+/g, ' '),
  };
  
  // Size styles - exact specifications
  const sizeStyles = {
    sm: 'h-[28px] px-3 text-micro rounded-sm',      // 28h / 12px / 8px radius
    md: 'h-[36px] px-4 text-caption rounded-sm',    // 36h / 13px / 8px radius
    lg: 'h-[44px] px-6 text-body rounded-sm',       // 44h / 15px / 8px radius
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}