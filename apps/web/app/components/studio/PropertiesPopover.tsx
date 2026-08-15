"use client";

type PropertiesPopoverProps = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  selectedLabel?: string;
  onStrokeColor: (value: string) => void;
  onFillColor: (value: string) => void;
  onStrokeWidth: (value: number) => void;
};

export function PropertiesPopover({
  strokeColor,
  fillColor,
  strokeWidth,
  selectedLabel,
  onStrokeColor,
  onFillColor,
  onStrokeWidth,
}: PropertiesPopoverProps) {
  return (
    <div className="pointer-events-auto w-56 rounded-xl border border-line bg-paper/95 p-3 shadow-[0_10px_30px_-16px_rgba(28,25,23,0.55)] backdrop-blur">
      <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {selectedLabel ? `Ink · ${selectedLabel}` : "Ink"}
      </p>
      <label className="mb-3 flex items-center justify-between gap-2 text-xs text-ink-soft">
        Stroke
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => onStrokeColor(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-line bg-paper"
        />
      </label>
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-ink-soft">
        Fill
        <span className="flex items-center gap-1">
          <input
            type="color"
            value={fillColor === "transparent" ? "#f4efe4" : fillColor}
            onChange={(e) => onFillColor(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-line bg-paper"
          />
          <button
            type="button"
            onClick={() => onFillColor("transparent")}
            className={`rounded px-1.5 py-1 ${
              fillColor === "transparent" ? "bg-ink text-paper" : "hover:bg-paper-deep"
            }`}
          >
            None
          </button>
        </span>
      </div>
      <label className="block text-xs text-ink-soft">
        Weight {strokeWidth}px
        <input
          type="range"
          min={1}
          max={10}
          value={strokeWidth}
          onChange={(e) => onStrokeWidth(Number(e.target.value))}
          className="mt-1 w-full accent-copper"
        />
      </label>
    </div>
  );
}
