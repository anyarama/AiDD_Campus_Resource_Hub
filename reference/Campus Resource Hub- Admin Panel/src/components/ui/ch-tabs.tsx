import React, { useState } from 'react';
import { CHBadge } from './ch-badge';

/**
 * CH/Tabs
 * Tabs component with fitted underline indicator and count badges
 */

export interface CHTab {
  value: string;
  label: string;
  count?: number;
}

export interface CHTabsProps {
  tabs: CHTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function CHTabs({
  tabs,
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
}: CHTabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || tabs[0]?.value);
  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleTabChange = (value: string) => {
    if (controlledValue === undefined) {
      setInternalValue(value);
    }
    onValueChange?.(value);
  };
  
  return (
    <div className="flex flex-col gap-6">
      {/* Tab List */}
      <div className="border-b border-default">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const isActive = tab.value === activeValue;
            
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`
                  relative flex items-center gap-2 px-1 py-3
                  text-caption-medium transition-colors duration-150
                  border-b-2 -mb-px
                  ${
                    isActive
                      ? 'text-brand-crimson border-brand-crimson'
                      : 'text-fg-muted border-transparent hover:text-fg-default'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <CHBadge variant="neutral">{tab.count}</CHBadge>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}

export interface CHTabsContentProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
}

export function CHTabsContent({
  value,
  activeValue,
  children,
}: CHTabsContentProps) {
  if (value !== activeValue) return null;
  
  return <div className="animate-fade-in">{children}</div>;
}
