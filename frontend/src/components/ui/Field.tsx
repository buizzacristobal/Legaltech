"use client";
import { useId } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  wide?: boolean;
}

export function Field({ label, hint, wide, className = "", ...rest }: Props) {
  const id = useId();
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} className={`input ${className}`} {...rest} />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function SelectField({ label, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className="input" {...rest}>{children}</select>
    </div>
  );
}
