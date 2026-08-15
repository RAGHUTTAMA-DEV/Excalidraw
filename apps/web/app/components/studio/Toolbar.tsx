"use client";

import { ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { Tool } from "./types";
import {
  ArrowIcon,
  CircleIcon,
  ClearIcon,
  DiamondIcon,
  LineIcon,
  PenIcon,
  RectIcon,
  SelectIcon,
  TextIcon,
  TrashIcon,
} from "./ToolIcons";

const tools: { id: Tool; label: string; icon: ReactNode }[] = [
  { id: "select", label: "Select", icon: <SelectIcon /> },
  { id: "rectangle", label: "Rectangle", icon: <RectIcon /> },
  { id: "circle", label: "Circle", icon: <CircleIcon /> },
  { id: "diamond", label: "Diamond", icon: <DiamondIcon /> },
  { id: "arrow", label: "Arrow", icon: <ArrowIcon /> },
  { id: "line", label: "Line", icon: <LineIcon /> },
  { id: "text", label: "Text", icon: <TextIcon /> },
  { id: "pen", label: "Pen", icon: <PenIcon /> },
];

type ToolbarProps = {
  tool: Tool;
  onTool: (tool: Tool) => void;
  onDelete: () => void;
  onClear: () => void;
  canDelete: boolean;
};

export function Toolbar({ tool, onTool, onDelete, onClear, canDelete }: ToolbarProps) {
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-paper/95 px-2 py-1.5 shadow-[0_10px_30px_-16px_rgba(28,25,23,0.55)] backdrop-blur">
      {tools.map((item) => (
        <button
          key={item.id}
          type="button"
          title={item.label}
          onClick={() => onTool(item.id)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            tool === item.id
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-paper-deep hover:text-ink"
          )}
        >
          {item.icon}
        </button>
      ))}
      <span className="mx-1 h-6 w-px bg-line" />
      <button
        type="button"
        title="Delete selected"
        onClick={onDelete}
        disabled={!canDelete}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-danger/10 hover:text-danger disabled:opacity-30"
      >
        <TrashIcon />
      </button>
      <button
        type="button"
        title="Clear board"
        onClick={onClear}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-paper-deep hover:text-ink"
      >
        <ClearIcon />
      </button>
    </div>
  );
}
