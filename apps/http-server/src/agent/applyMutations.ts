import { isBindable, recomputeConnectors } from "./connectors.js";
import type { MutateOp, Shape, ShapeType } from "./types.js";

const TYPES: ShapeType[] = [
  "rectangle",
  "circle",
  "diamond",
  "arrow",
  "line",
  "text",
  "pen",
  "icon",
];

function uid() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function sanitizeOps(raw: unknown): MutateOp[] {
  if (!Array.isArray(raw)) return [];
  const ops: MutateOp[] = [];
  for (const item of raw.slice(0, 40)) {
    if (!item || typeof item !== "object") continue;
    const value = item as Record<string, unknown>;
    const op = String(value.op || "");
    if (op === "setType" && typeof value.id === "string" && TYPES.includes(value.type as ShapeType)) {
      ops.push({ op: "setType", id: value.id, type: value.type as ShapeType });
      continue;
    }
    if (op === "setText" && typeof value.id === "string" && typeof value.text === "string") {
      ops.push({ op: "setText", id: value.id, text: value.text.slice(0, 80) });
      continue;
    }
    if (op === "setStyle" && typeof value.id === "string") {
      ops.push({
        op: "setStyle",
        id: value.id,
        fill: typeof value.fill === "string" ? value.fill.slice(0, 32) : undefined,
        stroke: typeof value.stroke === "string" ? value.stroke.slice(0, 32) : undefined,
        strokeWidth:
          typeof value.strokeWidth === "number" ? Math.min(12, Math.max(1, value.strokeWidth)) : undefined,
      });
      continue;
    }
    if (op === "delete") {
      const ids = Array.isArray(value.ids)
        ? value.ids.filter((id): id is string => typeof id === "string").slice(0, 40)
        : typeof value.id === "string"
          ? [value.id]
          : [];
      if (ids.length) ops.push({ op: "delete", ids });
      continue;
    }
    if (op === "connect" && typeof value.from === "string" && typeof value.to === "string") {
      ops.push({
        op: "connect",
        from: value.from,
        to: value.to,
        label: typeof value.label === "string" ? value.label.slice(0, 22) : undefined,
      });
    }
  }
  return ops;
}

export function applyMutations(shapes: Shape[], ops: MutateOp[], selectionIds: string[]): Shape[] {
  let next = shapes.map((shape) => ({ ...shape }));
  const byId = () => new Map(next.map((shape) => [shape.id, shape]));

  for (const op of ops) {
    if (op.op === "setType") {
      next = next.map((shape) => (shape.id === op.id ? { ...shape, type: op.type } : shape));
      continue;
    }
    if (op.op === "setText") {
      next = next.map((shape) => (shape.id === op.id ? { ...shape, text: op.text } : shape));
      continue;
    }
    if (op.op === "setStyle") {
      next = next.map((shape) => {
        if (shape.id !== op.id) return shape;
        return {
          ...shape,
          fill: op.fill ?? shape.fill,
          stroke: op.stroke ?? shape.stroke,
          strokeWidth: op.strokeWidth ?? shape.strokeWidth,
        };
      });
      continue;
    }
    if (op.op === "delete") {
      const drop = new Set(op.ids.length ? op.ids : selectionIds);
      for (const shape of next) {
        if (
          (shape.type === "arrow" || shape.type === "line") &&
          ((shape.startBinding && drop.has(shape.startBinding)) ||
            (shape.endBinding && drop.has(shape.endBinding)))
        ) {
          drop.add(shape.id);
        }
      }
      next = next.filter((shape) => !drop.has(shape.id));
      continue;
    }
    if (op.op === "connect") {
      const map = byId();
      const from = map.get(op.from);
      const to = map.get(op.to);
      if (!from || !to || from.id === to.id) continue;
      if (!isBindable(from) || !isBindable(to)) continue;
      next.push({
        id: uid(),
        type: "arrow",
        x: from.x,
        y: from.y,
        points: [from.x, from.y, to.x, to.y],
        fill: "#1c1917",
        stroke: "#1c1917",
        strokeWidth: 2,
        roughness: 1,
        seed: Math.floor(Math.random() * 800) + 1,
        startBinding: from.id,
        endBinding: to.id,
        text: op.label,
      });
    }
  }

  return recomputeConnectors(next);
}
