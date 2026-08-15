import type { CompactShape, Shape } from "./types.js";

export function stripSvgs(shapes: Shape[]): Shape[] {
  return shapes.map(({ iconSvg: _svg, ...shape }) => shape);
}

export function toCompact(shapes: Shape[], selectionIds: string[], max = 120): {
  items: CompactShape[];
  truncated: number;
  total: number;
} {
  const items = shapes.map((shape) => ({
    id: shape.id,
    type: shape.type,
    text: shape.text || "",
    iconId: shape.iconId,
    x: Math.round(shape.x),
    y: Math.round(shape.y),
    w: Math.round(shape.width || 0),
    h: Math.round(shape.height || 0),
    startBinding: shape.startBinding ?? null,
    endBinding: shape.endBinding ?? null,
  }));

  if (items.length <= max) {
    return { items, truncated: 0, total: items.length };
  }

  const selected = new Set(selectionIds);
  const keep = new Set(selectionIds);
  for (const item of items) {
    if (item.startBinding && selected.has(item.startBinding)) keep.add(item.id);
    if (item.endBinding && selected.has(item.endBinding)) keep.add(item.id);
    if (item.startBinding && keep.has(item.id)) keep.add(item.startBinding);
    if (item.endBinding && keep.has(item.id)) keep.add(item.endBinding);
  }

  const prioritized = items.filter((item) => keep.has(item.id));
  const rest = items.filter((item) => !keep.has(item.id));
  const next = [...prioritized, ...rest].slice(0, max);
  return { items: next, truncated: items.length - next.length, total: items.length };
}
