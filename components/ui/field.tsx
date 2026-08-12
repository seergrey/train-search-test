import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Labelled form control wrapper — one label style for the whole app. */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-content-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

const CONTROL =
  'h-10 w-full rounded-control border border-border-strong px-2 text-sm text-content ' +
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, 'bg-surface', className)} {...rest}>
      {children}
    </select>
  );
}
