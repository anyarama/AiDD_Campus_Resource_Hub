import React from 'react';

interface IUInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function IUInput({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  ...props
}: IUInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-iu-primary">
          {label}
          {required && <span className="text-iu-crimson ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`px-3 py-2.5 rounded-[var(--radius-md)] border transition-all min-h-[44px]
          ${error 
            ? 'border-[var(--iu-danger)] focus:border-[var(--iu-danger)] focus:ring-2 focus:ring-[var(--iu-danger)]/20' 
            : 'border-iu focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20'
          }
          bg-iu-surface text-iu-primary outline-none
          disabled:bg-[var(--iu-surface-muted)] disabled:cursor-not-allowed
          ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-sm text-[var(--iu-danger)]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="text-sm text-iu-secondary">
          {helperText}
        </span>
      )}
    </div>
  );
}

interface IUTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function IUTextarea({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  ...props
}: IUTextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-iu-primary">
          {label}
          {required && <span className="text-iu-crimson ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={`px-3 py-2.5 rounded-[var(--radius-md)] border transition-all min-h-[120px]
          ${error 
            ? 'border-[var(--iu-danger)] focus:border-[var(--iu-danger)] focus:ring-2 focus:ring-[var(--iu-danger)]/20' 
            : 'border-iu focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20'
          }
          bg-iu-surface text-iu-primary outline-none
          disabled:bg-[var(--iu-surface-muted)] disabled:cursor-not-allowed
          ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-sm text-[var(--iu-danger)]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="text-sm text-iu-secondary">
          {helperText}
        </span>
      )}
    </div>
  );
}

interface IUSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function IUSelect({
  label,
  error,
  helperText,
  required,
  options,
  className = '',
  id,
  ...props
}: IUSelectProps) {
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm text-iu-primary">
          {label}
          {required && <span className="text-iu-crimson ml-1">*</span>}
        </label>
      )}
      <select
        id={inputId}
        className={`px-3 py-2.5 rounded-[var(--radius-md)] border transition-all min-h-[44px]
          ${error 
            ? 'border-[var(--iu-danger)] focus:border-[var(--iu-danger)] focus:ring-2 focus:ring-[var(--iu-danger)]/20' 
            : 'border-iu focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20'
          }
          bg-iu-surface text-iu-primary outline-none
          disabled:bg-[var(--iu-surface-muted)] disabled:cursor-not-allowed
          ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${inputId}-error`} className="text-sm text-[var(--iu-danger)]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="text-sm text-iu-secondary">
          {helperText}
        </span>
      )}
    </div>
  );
}
