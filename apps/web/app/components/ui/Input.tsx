"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  trailing?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, label, error, id, trailing, ...props }, ref) {
    const inputId = id ?? props.name;
    return (
      <label className="flex w-full flex-col gap-1.5 text-sm">
        {label ? (
          <span className="font-medium text-ink-soft">{label}</span>
        ) : null}
        <span className="relative block">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-md border bg-paper px-3 py-2.5 text-ink outline-none transition-colors",
              "placeholder:text-ink-soft/50",
              Boolean(trailing) && "pr-12",
              error
                ? "border-danger focus:border-danger"
                : "border-line focus:border-ink",
              className
            )}
            {...props}
          />
          {trailing ? (
            <span className="absolute inset-y-0 right-1 flex items-center">
              {trailing}
            </span>
          ) : null}
        </span>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </label>
    );
  }
);
