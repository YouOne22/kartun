import type { ReactNode } from 'react';

type FieldProps = {
  label: string;
  children: ReactNode;
  wide?: boolean;
  error?: string;
};

/**
 * Reusable form field wrapper component.
 * Provides consistent label + input spacing and optional inline error message.
 */
export default function Field({ label, children, wide = false, error }: FieldProps) {
  return (
    <label
      className={`block text-xs font-medium text-slate-600 ${wide ? 'sm:col-span-2' : ''}`}
    >
      {label}
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}