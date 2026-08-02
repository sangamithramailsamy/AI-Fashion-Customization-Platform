import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helper?: string;
  id: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helper, id, className = '', ...props }, ref) => {
    const describedBy = error ? `${id}-error` : helper ? `${id}-help` : undefined;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="font-body text-xs uppercase tracking-[0.2em] text-muted">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full px-4 py-3 bg-token-alt border font-body text-base text-token outline-none transition-colors placeholder:text-muted/60 ${
            error ? 'border-red-400' : 'border-token focus:border-primary'
          } ${className}`}
          style={error ? { borderColor: '#c0392b' } : {}}
          {...props}
        />
        {helper && !error && (
          <p id={`${id}-help`} className="font-body text-xs text-muted">{helper}</p>
        )}
        {error && (
          <p id={`${id}-error`} className="flex items-center gap-1.5 font-body text-xs" style={{ color: '#c0392b' }}>
            <AlertCircle size={12} /> {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

interface PasswordFieldProps extends FormFieldProps {
  show: boolean;
  onToggleShow: () => void;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ show, onToggleShow, ...props }, ref) => {
    return (
      <div className="relative">
        <FormField ref={ref} type={show ? 'text' : 'password'} {...props} />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-[38px] font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    );
  }
);
PasswordField.displayName = 'PasswordField';
