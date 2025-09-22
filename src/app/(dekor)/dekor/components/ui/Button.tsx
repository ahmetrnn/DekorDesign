'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--cta)] text-white shadow-md hover:shadow-lg focus-visible:outline-[var(--cta)]',
  ghost:
    'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-soft)] focus-visible:outline-[var(--accent)]'
};

const MotionButton = motion.button;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, loading, disabled, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      variantStyles[variant],
      disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      className
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <MotionButton
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={baseClasses}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };
