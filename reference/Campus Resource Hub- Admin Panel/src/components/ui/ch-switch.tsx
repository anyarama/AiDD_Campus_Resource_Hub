import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * CH/Switch
 * Switch toggle component with helper/error text
 */

export interface CHSwitchProps {
  label?: string;
  helperText?: string;
  error?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function CHSwitch({
  label,
  helperText,
  error,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: CHSwitchProps) {
  const hasError = !!error;
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Switch and Label */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onCheckedChange(!checked)}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 items-center
            rounded-full transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-brand-crimson focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${checked ? 'bg-brand-crimson' : 'bg-subtle border border-default'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full
              bg-brand-white shadow-sm transition-transform duration-200 ease-in-out
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        
        {label && (
          <label 
            className="text-caption-medium text-fg-default cursor-pointer select-none"
            onClick={() => !disabled && onCheckedChange(!checked)}
          >
            {label}
          </label>
        )}
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
