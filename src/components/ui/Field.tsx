"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
}

function FieldWrapper({ label, hint, error, required, children }: WrapperProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-baskerville text-ink">
          {label}
          {required && <span className="text-rust"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="text-xs text-ink-soft">{hint}</span>}
      {error && <span className="text-xs text-rust font-baskerville">{error}</span>}
    </label>
  );
}

const baseInput =
  "w-full rounded-sm border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 outline-none transition-colors focus:border-teak disabled:opacity-50 disabled:bg-paper-deep";

type InputProps = InputHTMLAttributes<HTMLInputElement> & WrapperProps;
export function TextField({ label, hint, error, required, className, ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <input
        className={cn(baseInput, error ? "border-rust" : "border-line", className)}
        {...rest}
      />
    </FieldWrapper>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & WrapperProps;
export function TextareaField({ label, hint, error, required, className, ...rest }: TextareaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <textarea
        className={cn(baseInput, "min-h-24 resize-y", error ? "border-rust" : "border-line", className)}
        {...rest}
      />
    </FieldWrapper>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & WrapperProps;
export function SelectField({ label, hint, error, required, className, children, ...rest }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <select
        className={cn(baseInput, error ? "border-rust" : "border-line", className)}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
