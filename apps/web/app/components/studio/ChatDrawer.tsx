"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "./types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { cn } from "../../lib/cn";

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
};

export function ChatDrawer({
  open,
  onClose,
  messages,
  draft,
  onDraft,
  onSend,
}: ChatDrawerProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (!mounted && !open) return null;

  return (
    <aside
      className={cn(
        "absolute inset-y-0 right-0 z-20 flex w-full max-w-sm flex-col border-l border-line bg-paper shadow-[-18px_0_40px_-24px_rgba(28,25,23,0.45)] transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}
      onTransitionEnd={() => {
        if (!open) setMounted(false);
      }}
    >
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-copper">Gutter</p>
          <h2 className="font-display text-xl italic">Chat</h2>
        </div>
        <Button variant="ghost" className="px-2 py-1" onClick={onClose}>
          Close
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="text-sm text-ink-soft">No notes in the margin yet.</p>
        ) : (
          messages.map((item, idx) => (
            <div key={item.id || `${idx}-${item.content}`} className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-copper">
                  {item.sender?.name || "Someone"} {item.sender?.lastName || ""}
                </span>
                <span className="text-[10px] text-ink-soft">
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : "now"}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{item.content}</p>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder="A note in the gutter…"
        />
        <Button type="submit">Send</Button>
      </form>
    </aside>
  );
}
