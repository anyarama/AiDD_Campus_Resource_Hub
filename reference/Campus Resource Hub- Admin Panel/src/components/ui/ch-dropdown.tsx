import React, { useState, useRef, useEffect } from 'react';

/**
 * CH/Dropdown
 * Dropdown menu component with trigger and items
 */

export interface CHDropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  type?: 'item' | 'separator';
}

export interface CHDropdownProps {
  trigger: React.ReactNode;
  items: CHDropdownItem[];
  align?: 'left' | 'right';
}

export function CHDropdown({ trigger, items, align = 'right' }: CHDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Close on ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  const handleItemClick = (item: CHDropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };
  
  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-1 z-50
            min-w-[180px]
            bg-surface border border-default rounded-lg
            shadow-lg
            py-1
            animate-fade-in
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <div
                  key={`separator-${index}`}
                  className="h-px bg-border-muted my-1"
                />
              );
            }
            
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`
                  w-full px-3 py-2 text-left
                  text-caption transition-colors
                  ${item.danger 
                    ? 'text-status-danger hover:bg-[#FFF5F5]' 
                    : 'text-fg-default hover:bg-subtle'
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
