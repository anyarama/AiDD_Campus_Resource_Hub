import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Clock, Check, X, Search } from 'lucide-react';

/**
 * Form Control Sizes
 * - sm: 40px
 * - md: 44px (default)
 * - lg: 48px
 */
export type ControlSize = 'sm' | 'md' | 'lg';

/**
 * Base Form Field Props
 */
interface BaseFieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: ControlSize;
  className?: string;
}

/**
 * Field Wrapper
 * 
 * Spacing:
 * - label → control: 8px (gap-2)
 * - control → helper: 6px (mt-1.5)
 * - field → field: 16px (gap-4 in form)
 */
interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

function FieldWrapper({ label, required, error, helperText, children, htmlFor }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={htmlFor} className="admin-small text-role-primary">
          {label}
          {required && <span className="text-[var(--iu-danger)] ml-1">*</span>}
        </label>
      )}
      {children}
      {(error || helperText) && (
        <div className="mt-1.5">
          {error ? (
            <p className="admin-caption text-[var(--iu-danger)]" role="alert" aria-live="polite">
              {error}
            </p>
          ) : helperText ? (
            <p className="admin-caption text-role-secondary">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * Control height classes
 */
const controlHeights = {
  sm: 'h-10',  // 40px
  md: 'h-11',  // 44px
  lg: 'h-12'   // 48px
};

/**
 * Base control classes
 */
const baseControlClasses = (size: ControlSize, error?: string, disabled?: boolean) => `
  ${controlHeights[size]}
  px-3
  bg-role-surface
  border
  ${error ? 'border-[var(--iu-danger)]' : 'border-role-border'}
  rounded-token-md
  admin-small
  text-role-primary
  placeholder:text-role-secondary
  transition-colors
  ${disabled 
    ? 'opacity-50 cursor-not-allowed bg-role-surface-muted' 
    : `
      hover:border-role-accent
      focus:border-[var(--iu-focus)]
      focus:ring-2
      focus:ring-[var(--iu-focus)]/20
      focus:outline-none
    `
  }
`.trim().replace(/\s+/g, ' ');

/**
 * Text Input
 */
interface TextInputProps extends BaseFieldProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  onChange?: (value: string) => void;
}

export function TextInput({
  id,
  name,
  label,
  value,
  placeholder,
  type = 'text',
  helperText,
  error,
  required,
  disabled,
  size = 'md',
  onChange,
  className = ''
}: TextInputProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText} htmlFor={id}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${baseControlClasses(size, error, disabled)} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
      />
    </FieldWrapper>
  );
}

/**
 * Textarea
 */
interface TextareaProps extends BaseFieldProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  onChange?: (value: string) => void;
}

export function Textarea({
  id,
  name,
  label,
  value,
  placeholder,
  rows = 4,
  helperText,
  error,
  required,
  disabled,
  onChange,
  className = ''
}: TextareaProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText} htmlFor={id}>
      <textarea
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          px-3 py-2
          bg-role-surface
          border
          ${error ? 'border-[var(--iu-danger)]' : 'border-role-border'}
          rounded-token-md
          admin-small
          text-role-primary
          placeholder:text-role-secondary
          transition-colors
          resize-y
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-role-surface-muted' 
            : `
              hover:border-role-accent
              focus:border-[var(--iu-focus)]
              focus:ring-2
              focus:ring-[var(--iu-focus)]/20
              focus:outline-none
            `
          }
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
      />
    </FieldWrapper>
  );
}

/**
 * Select Dropdown
 */
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends BaseFieldProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export function Select({
  id,
  name,
  label,
  value,
  placeholder,
  options,
  helperText,
  error,
  required,
  disabled,
  size = 'md',
  onChange,
  className = ''
}: SelectProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText} htmlFor={id}>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${baseControlClasses(size, error, disabled)} w-full appearance-none pr-10 ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-role-secondary pointer-events-none" />
      </div>
    </FieldWrapper>
  );
}

/**
 * Combobox (Searchable Select)
 */
interface ComboboxProps extends BaseFieldProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export function Combobox({
  id,
  name,
  label,
  value,
  placeholder,
  options,
  helperText,
  error,
  required,
  disabled,
  size = 'md',
  onChange,
  className = ''
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText} htmlFor={id}>
      <div ref={containerRef} className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`${baseControlClasses(size, error, disabled)} w-full flex items-center justify-between ${className}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={selectedOption ? 'text-role-primary' : 'text-role-secondary'}>
            {selectedOption?.label || placeholder || 'Select...'}
          </span>
          <ChevronDown className="w-4 h-4 text-role-secondary" />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-role-surface border border-role-border rounded-token-md shadow-iu-lg max-h-60 overflow-auto">
            <div className="p-2 border-b border-role-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-role-secondary" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 bg-role-surface border border-role-border rounded-token-md admin-small
                    focus:border-[var(--iu-focus)] focus:ring-2 focus:ring-[var(--iu-focus)]/20 focus:outline-none"
                />
              </div>
            </div>
            
            <div role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-left admin-small transition-colors
                      ${option.value === value ? 'bg-[var(--iu-accent)]/10 text-role-accent' : 'text-role-primary hover:bg-role-surface-muted'}
                    `}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center admin-small text-role-secondary">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

/**
 * Date Input
 */
interface DateInputProps extends BaseFieldProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function DateInput({
  id,
  name,
  label,
  value,
  placeholder,
  helperText,
  error,
  required,
  disabled,
  size = 'md',
  onChange,
  className = ''
}: DateInputProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="date"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${baseControlClasses(size, error, disabled)} w-full pr-10 ${className}`}
          aria-invalid={!!error}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-role-secondary pointer-events-none" />
      </div>
    </FieldWrapper>
  );
}

/**
 * Time Input
 */
interface TimeInputProps extends BaseFieldProps {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function TimeInput({
  id,
  name,
  label,
  value,
  placeholder,
  helperText,
  error,
  required,
  disabled,
  size = 'md',
  onChange,
  className = ''
}: TimeInputProps) {
  return (
    <FieldWrapper label={label} required={required} error={error} helperText={helperText} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="time"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange?.(e.target.value)}
          className={`${baseControlClasses(size, error, disabled)} w-full pr-10 ${className}`}
          aria-invalid={!!error}
        />
        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-role-secondary pointer-events-none" />
      </div>
    </FieldWrapper>
  );
}

/**
 * Toggle Switch
 */
interface ToggleProps {
  id?: string;
  name?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Toggle({
  id,
  name,
  label,
  checked = false,
  disabled,
  onChange,
  className = ''
}: ToggleProps) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`
          w-11 h-6 
          bg-role-surface-muted 
          rounded-full 
          peer-checked:bg-role-accent
          peer-focus-visible:ring-2 
          peer-focus-visible:ring-[var(--iu-focus)]
          peer-focus-visible:ring-offset-2
          transition-colors
          ${disabled ? 'cursor-not-allowed' : ''}
        `} />
        <div className={`
          absolute left-0.5 top-0.5 
          w-5 h-5 
          bg-white 
          rounded-full 
          shadow-iu-sm
          peer-checked:translate-x-5
          transition-transform
        `} />
      </div>
      {label && <span className="admin-small text-role-primary">{label}</span>}
    </label>
  );
}

/**
 * Checkbox
 */
interface CheckboxProps {
  id?: string;
  name?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  id,
  name,
  label,
  checked = false,
  disabled,
  required,
  onChange,
  className = ''
}: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-4 h-4 text-role-accent rounded border-role-border 
          focus:ring-2 focus:ring-[var(--iu-focus)] focus:ring-offset-2
          cursor-pointer disabled:cursor-not-allowed"
      />
      {label && (
        <span className="admin-small text-role-primary">
          {label}
          {required && <span className="text-[var(--iu-danger)] ml-1">*</span>}
        </span>
      )}
    </label>
  );
}

/**
 * Form Actions Footer
 */
interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled,
  loading,
  className = ''
}: FormActionsProps) {
  return (
    <div className={`flex items-center justify-end gap-3 pt-6 border-t border-role-border ${className}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 h-11 bg-role-surface border border-role-border text-role-primary rounded-token-md admin-small
            hover:bg-role-surface-muted transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={submitDisabled || loading}
        className="px-4 h-11 bg-role-accent text-white rounded-token-md admin-small
          hover:bg-[var(--iu-accent-hover)] transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iu-focus)] focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}
