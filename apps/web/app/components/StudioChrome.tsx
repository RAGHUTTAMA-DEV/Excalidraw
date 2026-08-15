"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { paths } from "../lib/paths";
import { cn } from "../lib/cn";

type StudioChromeProps = {
  title?: string;
  connected: boolean;
  members?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function StudioChrome({
  title,
  connected,
  members,
  actions,
  children,
  className,
}: StudioChromeProps) {
  return (
    <div className={cn("flex h-dvh flex-col bg-paper text-ink", className)}>
      <header className="z-20 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line bg-paper/90 px-2 backdrop-blur sm:gap-3 sm:px-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href={paths.rooms}
            className="rounded-md px-2 py-1 text-sm text-ink-soft hover:bg-paper-deep hover:text-ink"
          >
            <span className="sm:hidden">←</span>
            <span className="hidden sm:inline">← Boards</span>
          </Link>
          <h1 className="truncate font-display text-base italic sm:text-lg">
            {title || "Untitled board"}
          </h1>
          <span className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                connected ? "bg-emerald-700" : "bg-danger"
              )}
            />
            <span className="hidden sm:inline">{connected ? "Live" : "Offline"}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {members}
          {actions}
        </div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
