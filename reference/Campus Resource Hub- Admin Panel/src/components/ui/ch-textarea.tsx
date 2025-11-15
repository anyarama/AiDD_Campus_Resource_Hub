import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * CH/Textarea
 * Textarea component with helper/error text and character counter
 * 
 * Default border: brand.cream.border
 * Focus: focus.ring (0 0 0 2px rgba(153,0,0,0.18))
 */

export interface CHTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  showCharacterCount?: boolean;
  maxCharacters?: number;
}

export const CHTextarea = React.forwardRef<HTMLTextAreaElement, CHTextareaProps>(
  (
    {
      label,
      helperText,
      error,
      showCharacterCount = false,
      maxCharacters,
      className = '',
      value = '',
      rows = 4,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const currentLength = String(value).length;
    
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Label */}
        {label && (
          <label className="text-caption-medium text-fg-default">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        
        {/* Textarea Field */}
        <textarea
          ref={ref}
          value={value}
          rows={rows}
          className={`
            px-3 py-2 
            bg-surface rounded-md
            text-body text-fg-default placeholder:text-fg-subtle
            resize-vertical
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
        />
        
        {/* Helper/Error Text and Character Count */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
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
          
          {showCharacterCount && maxCharacters && (
            <span className="text-micro text-fg-subtle flex-shrink-0">
              {currentLength}/{maxCharacters}
            </span>
          )}
        </div>
      </div>
    );
  }
);

CHTextarea.displayName = 'CHTextarea';