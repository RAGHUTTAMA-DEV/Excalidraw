"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-copper text-paper shadow-[0_1px_0_rgba(28,25,23,0.2)] hover:bg-copper-hot disabled:opacity-50",
  secondary:
    "bg-paper-deep text-ink border border-line hover:bg-line/70 disabled:opacity-50",
  ghost:
    "bg-transparent text-ink-soft hover:bg-paper-deep hover:text-ink disabled:opacity-50",
  danger:
    "bg-danger text-paper hover:bg-[#7f0f2e] disabled:opacity-50",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  fullWidth,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium tracking-wide transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper",
        fullWidth && "w-full",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
