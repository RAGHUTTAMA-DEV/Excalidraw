import { ReactNode } from "react";
import { cn } from "../../lib/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-dashed border-line bg-paper-deep/60 px-6 py-10",
        className
      )}
    >
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
