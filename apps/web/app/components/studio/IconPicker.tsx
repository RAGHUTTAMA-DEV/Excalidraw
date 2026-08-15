"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import {
  ICON_CATALOG,
  ICON_CATEGORIES,
  iconifyUrl,
  iconMatches,
  searchRemoteIcons,
  type CatalogIcon,
  type IconCategory,
} from "./iconCatalog";

type IconPickerProps = {
  onPick: (icon: CatalogIcon) => void;
  onClose: () => void;
};

export function IconPicker({ onPick, onClose }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | "all">("all");
  const [remote, setRemote] = useState<CatalogIcon[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setRemote([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void searchRemoteIcons(trimmed).then((icons) => {
        if (!cancelled) setRemote(icons);
      });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const local = useMemo(() => {
    return ICON_CATALOG.filter((icon) => {
      if (category !== "all" && icon.category !== category) return false;
      return iconMatches(icon, query);
    });
  }, [category, query]);

  const seen = new Set(local.map((icon) => icon.id));
  const extras = remote.filter((icon) => !seen.has(icon.id));
  const icons = query.trim().length >= 2 ? [...local, ...extras] : local;

  return (
    <div className="pointer-events-auto w-[min(34rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-line bg-paper/97 shadow-[0_18px_50px_-24px_rgba(28,25,23,0.55)] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons — ec2, postgres, user…"
          className="h-9 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/70"
        />
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ink-soft sm:block">
          /
        </kbd>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-1 text-xs text-ink-soft hover:bg-paper-deep hover:text-ink"
        >
          Esc
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 py-2">
        {ICON_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]",
              category === item.id ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep hover:text-ink"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid max-h-72 grid-cols-4 gap-1 overflow-y-auto p-2 sm:grid-cols-6">
        {icons.map((icon) => (
          <button
            key={icon.id}
            type="button"
            title={icon.label}
            onClick={() => onPick(icon)}
            className="flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-ink-soft hover:bg-paper-deep hover:text-ink"
          >
            <img src={iconifyUrl(icon.id, 28)} alt="" className="h-7 w-7 object-contain" />
            <span className="w-full truncate text-center text-[10px] leading-tight">{icon.label}</span>
          </button>
        ))}
        {icons.length === 0 ? (
          <p className="col-span-full px-2 py-8 text-center text-sm text-ink-soft">No icons for that search.</p>
        ) : null}
      </div>
    </div>
  );
}
