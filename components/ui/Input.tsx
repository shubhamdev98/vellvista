import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    fullWidth = false,
    id,
    ...props 
  }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-xs font-light text-secondary mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-colors",
            error && "border-error focus:ring-error",
            fullWidth && "w-full",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
