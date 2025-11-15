import React from 'react';

interface IUCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function IUCard({ children, className = '', padding = 'md' }: IUCardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`bg-iu-surface rounded-[var(--radius-lg)] shadow-iu-sm border border-iu ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface IUCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function IUCardHeader({ children, className = '' }: IUCardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface IUCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function IUCardTitle({ children, className = '' }: IUCardTitleProps) {
  return (
    <h4 className={className}>
      {children}
    </h4>
  );
}

interface IUCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function IUCardContent({ children, className = '' }: IUCardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
