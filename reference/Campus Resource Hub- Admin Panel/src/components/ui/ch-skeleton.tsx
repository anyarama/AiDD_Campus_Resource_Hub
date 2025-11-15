import React from 'react';

/**
 * CH/Skeleton
 * Skeleton loading component with IU token-based styling
 */

export interface CHSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function CHSkeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: CHSkeletonProps) {
  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };
  
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
  };
  
  return (
    <div
      className={`
        bg-subtle animate-pulse
        ${variantStyles[variant]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton presets for common UI elements
 */

export function CHSkeletonCard() {
  return (
    <div className="bg-surface border border-default rounded-lg p-5">
      <CHSkeleton variant="rectangular" height="140px" className="mb-4" />
      <CHSkeleton variant="text" className="mb-2" width="60%" />
      <CHSkeleton variant="text" width="40%" />
    </div>
  );
}

export function CHSkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-subtle border-b border-default p-4 flex gap-4">
        <CHSkeleton variant="text" width="20%" />
        <CHSkeleton variant="text" width="30%" />
        <CHSkeleton variant="text" width="25%" />
        <CHSkeleton variant="text" width="15%" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="border-b border-muted last:border-0 p-4 flex gap-4">
          <CHSkeleton variant="text" width="20%" />
          <CHSkeleton variant="text" width="30%" />
          <CHSkeleton variant="text" width="25%" />
          <CHSkeleton variant="text" width="15%" />
        </div>
      ))}
    </div>
  );
}

export function CHSkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, idx) => (
        <CHSkeleton
          key={idx}
          variant="text"
          width={idx === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}
