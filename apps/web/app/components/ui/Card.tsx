import { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-paper p-5 shadow-[0_10px_30px_-18px_rgba(28,25,23,0.45)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
