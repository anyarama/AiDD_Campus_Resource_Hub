import React from 'react';

/**
 * CH/Card
 * Card component with header, content, footer
 * Radius: lg (14px), Padding: 20px, Elevation: sm|md
 * Hover elevation: shadow-card, 120ms ease-in transition
 * Cursor pointer only if onClick provided
 */

export interface CHCardProps {
  children: React.ReactNode;
  elevation?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export function CHCard({
  children,
  elevation = 'sm',
  className = '',
  onClick,
}: CHCardProps) {
  const elevationStyles = {
    sm: 'shadow-sm',
    md: 'shadow-md',
  };
  
  return (
    <div 
      className={`
        bg-surface border border-default rounded-lg 
        ${elevationStyles[elevation]} 
        transition-all duration-[120ms] ease-in
        hover:shadow-card hover:border-brand-crimson/20
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export interface CHCardHeaderProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function CHCardHeader({
  children,
  actions,
  className = '',
}: CHCardHeaderProps) {
  return (
    <div className={`flex items-start justify-between p-5 border-b border-muted ${className}`}>
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
    </div>
  );
}

export interface CHCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CHCardTitle({
  children,
  className = '',
}: CHCardTitleProps) {
  return (
    <h3 className={`text-h4 text-fg-default ${className}`}>
      {children}
    </h3>
  );
}

export interface CHCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CHCardContent({
  children,
  className = '',
}: CHCardContentProps) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

export interface CHCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CHCardFooter({
  children,
  className = '',
}: CHCardFooterProps) {
  return (
    <div className={`flex items-center gap-3 p-5 border-t border-muted ${className}`}>
      {children}
    </div>
  );
}