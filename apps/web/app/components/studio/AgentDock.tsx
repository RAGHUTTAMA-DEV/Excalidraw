"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

type AgentDockProps = {
  open: boolean;
  busy: boolean;
  status: string;
  canUndo: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  onUndo: () => void;
  className?: string;
};

export function AgentDock({
  open,
  busy,
  status,
  canUndo,
  onOpen,
  onClose,
  onSubmit,
  onUndo,
  className,
}: AgentDockProps) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const next = prompt.trim();
    if (!next || busy) return;
    onSubmit(next);
    setPrompt("");
  };

  if (!open) {
    return (
      <div className={cn("pointer-events-auto flex items-center gap-2", className)}>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 rounded-full border border-line bg-paper/95 px-3 py-1.5 text-sm text-ink shadow-[0_10px_30px_-16px_rgba(28,25,23,0.55)] backdrop-blur hover:bg-paper-deep"
        >
          <SparkIcon />
          <span className="hidden sm:inline">Ask the board</span>
          <kbd className="hidden rounded-full border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-soft md:inline">
            ⌘K
          </kbd>
        </button>
        {canUndo ? (
          <button
            type="button"
            onClick={onUndo}
            className="rounded-full border border-line bg-paper/95 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-soft backdrop-blur hover:text-ink"
          >
            Undo AI
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "pointer-events-auto w-[min(36rem,calc(100vw-1.5rem))] rounded-2xl border border-line bg-paper/95 p-2 shadow-[0_16px_40px_-20px_rgba(28,25,23,0.55)] backdrop-blur",
        className
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <span className="text-copper">
          <SparkIcon />
        </span>
        <input
          ref={inputRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={busy}
          placeholder="Change this to a circle, or draw Next.js + Postgres…"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60 disabled:opacity-60"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            }
          }}
        />
        <button
          type="submit"
          disabled={busy || !prompt.trim()}
          className="rounded-full bg-ink px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-paper disabled:opacity-40"
        >
          {busy ? "…" : "Draw"}
        </button>
      </div>
      <p className="px-8 pb-1 pt-1 text-[11px] text-ink-soft">
        {busy ? status || "Reading board…" : "The agent layouts lanes, icons, and arrows — it does not dump boxes."}
      </p>
    </form>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.2 6.2l2.5 2.5M15.3 15.3l2.5 2.5M17.8 6.2l-2.5 2.5M8.7 15.3l-2.5 2.5" />
    </svg>
  );
}
