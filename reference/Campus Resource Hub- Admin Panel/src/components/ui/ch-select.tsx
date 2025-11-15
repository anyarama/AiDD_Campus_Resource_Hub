import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * CH/Select
 * Select component with helper/error text
 * 
 * Default border: brand.cream.border
 * Focus: focus.ring (0 0 0 2px rgba(153,0,0,0.18))
 */

export interface CHSelectOption {
  value: string;
  label: string;
}

export interface CHSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: CHSelectOption[];
  placeholder?: string;
}

export const CHSelect = React.forwardRef<HTMLSelectElement, CHSelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder = 'Select an option...',
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Label */}
        {label && (
          <label className="text-caption-medium text-fg-default">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        
        {/* Select Field */}
        <div className="relative">
          <select
            ref={ref}
            className={`
              h-10 px-3 py-2 pr-10 w-full
              bg-surface rounded-md
              text-body text-fg-default
              appearance-none cursor-pointer
              transition-all duration-150
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError 
                ? 'border border-danger focus:ring-2 focus:ring-danger focus:border-danger' 
                : 'border border-cream focus:shadow-[0_0_0_2px_rgba(153,0,0,0.18)] focus:border-brand-crimson'
              }
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Chevron Icon */}
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
        </div>
        
        {/* Helper/Error Text */}
        {error && (
          <div className="flex items-center gap-1 text-caption text-danger">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!error && helperText && (
          <p className="text-caption text-fg-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

CHSelect.displayName = 'CHSelect';