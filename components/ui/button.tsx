import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The only place a button's look is defined. Variants map onto the design
 * tokens in app/globals.css, so "primary" is one colour everywhere — the
 * search page and the train page can't drift apart.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success';
export type ButtonSize = 'sm' | 'md' | 'full';

const BASE =
  'inline-flex items-center justify-center gap-1 rounded-control font-medium transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  secondary: 'border border-border-strong bg-surface text-content hover:bg-surface-muted',
  ghost: 'text-content-muted hover:text-content hover:underline underline-offset-2',
  danger: 'border border-danger-border bg-surface text-danger-content hover:bg-danger-subtle',
  warning: 'bg-warning text-primary-foreground hover:bg-warning-hover',
  success: 'bg-success text-primary-foreground hover:bg-success-hover',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  full: 'w-full px-4 py-2.5 text-sm',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return cn(BASE, VARIANTS[variant], SIZES[size]);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cn(buttonClasses(variant, size), className)} {...rest} />;
}

/** A `next/link` that looks exactly like a Button — same variants, same tokens. */
export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonClasses(variant, size), className)}>
      {children}
    </Link>
  );
}
