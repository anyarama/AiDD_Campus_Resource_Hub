import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { CHBadge } from './ch-badge';
import { motion } from 'motion/react';

/**
 * CH/StatCard - Standardized KPI Card
 * 
 * Features:
 * - Card header: left = label+title stack, right = mini trend icon
 * - KPI number uses h1 token
 * - Delta pill uses CHBadge with arrow icon (up green, down red)
 * - Hover elevation with cursor pointer only if clickable
 * - 120ms ease-in transitions
 * - Consistent icon stroke weight
 */

export interface CHStatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    caption?: string;
  };
  trend?: number[]; // Mini sparkline data
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CHStatCard({
  label,
  value,
  delta,
  trend,
  icon,
  onClick,
  className = '',
}: CHStatCardProps) {
  // Sparkline renderer
  const renderSparkline = (data: number[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 50;
    const height = 24;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 48 + 1;
      const y = 23 - ((val - min) / range) * 22;
      return `${i === 0 ? '' : 'L '}${x},${y}`;
    }).join(' ');

    const pathD = `M ${points}`;

    return (
      <svg width={width} height={height} className="shrink-0" aria-hidden="true">
        {/* Area fill */}
        <path
          d={`${pathD} L ${width - 1},${height - 1} L 1,${height - 1} Z`}
          fill="var(--brand-crimson)"
          opacity="0.08"
        />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--brand-crimson)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last point */}
        <circle
          cx={48 + 1}
          cy={23 - ((data[data.length - 1] - min) / range) * 22}
          r="2"
          fill="var(--brand-crimson)"
        />
      </svg>
    );
  };

  return (
    <motion.div
      className={`
        bg-surface border border-default rounded-lg p-5
        transition-all duration-[120ms] ease-in
        hover:shadow-card hover:border-brand-crimson/20
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { y: -2 } : {}}
    >
      {/* Card Header: Left = Label, Right = Mini Trend */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Left: Icon + Label Stack */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {icon && (
            <div className="shrink-0 w-10 h-10 rounded-md bg-brand-crimson/5 flex items-center justify-center text-brand-crimson">
              {icon}
            </div>
          )}
          <div className="min-w-0 pt-1">
            <span className="text-caption text-fg-muted block">
              {label}
            </span>
          </div>
        </div>

        {/* Right: Mini Trend Icon */}
        {trend && (
          <div className="shrink-0 mt-1">
            {renderSparkline(trend)}
          </div>
        )}
      </div>

      {/* KPI Number - Uses h1 token */}
      <div className="mb-3">
        <motion.div
          className="text-h1 text-fg-default"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {value}
        </motion.div>
      </div>

      {/* Delta Pill - Uses CHBadge with arrow icon */}
      {delta && (
        <div className="flex items-center gap-2">
          <CHBadge
            variant={
              delta.direction === 'up' 
                ? 'success' 
                : delta.direction === 'down' 
                ? 'danger' 
                : 'neutral'
            }
            size="sm"
          >
            <div className="flex items-center gap-1">
              {delta.direction === 'up' && <ArrowUp className="w-3 h-3" strokeWidth={2.5} />}
              {delta.direction === 'down' && <ArrowDown className="w-3 h-3" strokeWidth={2.5} />}
              <span>{delta.value}</span>
            </div>
          </CHBadge>
          {delta.caption && (
            <span className="text-caption text-fg-muted">
              {delta.caption}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}