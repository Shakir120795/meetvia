'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

type InputProps = {
  label?: string;
  error?: string;
  as?: 'input' | 'textarea';
  register?: UseFormRegisterReturn;
} & InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Input({
  label,
  error,
  as = 'input',
  register,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const baseClasses =
    'w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200';

  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50'
    : '';

  const combinedClasses = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground/80"
        >
          {label}
        </label>
      )}

      {as === 'textarea' ? (
        <textarea
          id={inputId}
          className={`${combinedClasses} min-h-[120px] resize-y`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...register}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          className={combinedClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...register}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
