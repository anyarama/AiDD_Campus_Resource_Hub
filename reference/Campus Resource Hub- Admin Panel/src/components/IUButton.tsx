import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface IUButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export function IUButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: IUButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-iu-crimson text-white hover:bg-[var(--iu-crimson-700)] focus-visible:outline-[var(--iu-focus)]',
    secondary: 'bg-[var(--iu-surface)] text-iu-primary border border-iu hover:bg-[var(--iu-surface-muted)] focus-visible:outline-[var(--iu-focus)]',
    ghost: 'bg-transparent text-iu-primary hover:bg-[var(--iu-surface-muted)] focus-visible:outline-[var(--iu-focus)]',
    destructive: 'bg-[var(--iu-danger)] text-white hover:bg-[#8B0018] focus-visible:outline-[var(--iu-focus)]'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)] min-h-[36px]',
    md: 'px-4 py-2.5 rounded-[var(--radius-md)] min-h-[44px]',
    lg: 'px-6 py-3 text-lg rounded-[var(--radius-md)] min-h-[48px]'
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
