import React from 'react';
import { clsx } from 'clsx';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'btn',
          `btn-${variant}`,
          `btn-${size}`,
          fullWidth && 'btn-full-width',
          className
        )}
        {...props}
      >
        {leftIcon && <span className="btn-icon">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="btn-icon">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
