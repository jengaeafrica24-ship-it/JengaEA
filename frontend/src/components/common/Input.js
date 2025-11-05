import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  type = 'text',
  children,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = cn(
    'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors transform duration-150 sm:text-sm',
    error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
    className
  );

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          >
            {children}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            ref={ref}
            id={inputId}
            className={inputClasses}
            rows={4}
            {...props}
          />
        );
      default:
        return (
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputClasses}
            {...props}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      {renderInput()}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;



