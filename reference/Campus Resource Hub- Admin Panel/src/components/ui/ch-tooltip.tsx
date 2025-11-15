import React, { useState, useRef, useEffect } from 'react';

/**
 * CH/Tooltip
 * Simple accessible tooltip for icon-only buttons
 * - Shows on hover and focus
 * - Positioned above element
 * - WCAG AA compliant
 */

export interface CHTooltipProps {
  content: string;
  children: React.ReactElement;
  delay?: number;
}

export function CHTooltip({ content, children, delay = 200 }: CHTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        setPosition({
          top: triggerRect.top - tooltipRect.height - 8,
          left: triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2),
        });
      }
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="
            fixed z-50 px-3 py-2
            bg-[#1E1E1E] text-white
            text-caption
            rounded-md
            pointer-events-none
            animate-fade-in
          "
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
