import type { Shape } from "./types.js";

type Point = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };

const BINDABLE = new Set(["rectangle", "circle", "diamond", "text", "icon"]);

function aabb(shape: Shape): Box {
  if (shape.type === "arrow" || shape.type === "line") {
    const pts = connectorPoints(shape);
    return {
      x: Math.min(pts[0], pts[2]),
      y: Math.min(pts[1], pts[3]),
      w: Math.abs(pts[2] - pts[0]),
      h: Math.abs(pts[3] - pts[1]),
    };
  }
  return { x: shape.x, y: shape.y, w: shape.width || 0, h: shape.height || 0 };
}

function centerOf(box: Box): Point {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

export function connectorPoints(shape: Shape): [number, number, number, number] {
  if (shape.points && shape.points.length >= 4) {
    return [shape.points[0], shape.points[1], shape.points[2], shape.points[3]];
  }
  return [shape.x, shape.y, shape.x + (shape.width || 0), shape.y + (shape.height || 0)];
}

function boundaryPoint(shape: Shape, toward: Point): Point {
  const box = aabb(shape);
  const c = centerOf(box);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;

  if (shape.type === "circle") {
    const r = Math.min(box.w, box.h) / 2;
    const len = Math.hypot(dx, dy) || 1;
    return { x: c.x + (dx / len) * r, y: c.y + (dy / len) * r };
  }

  if (shape.type === "diamond") {
    const hw = box.w / 2 || 1;
    const hh = box.h / 2 || 1;
    const len = Math.abs(dx) / hw + Math.abs(dy) / hh || 1;
    return { x: c.x + dx / len, y: c.y + dy / len };
  }

  const hw = box.w / 2;
  const hh = box.h / 2;
  const sx = Math.abs(dx) < 0.001 ? Infinity : hw / Math.abs(dx);
  const sy = Math.abs(dy) < 0.001 ? Infinity : hh / Math.abs(dy);
  const t = Math.min(sx, sy);
  return { x: c.x + dx * t, y: c.y + dy * t };
}

export function recomputeConnectors(shapes: Shape[]): Shape[] {
  const byId = new Map(shapes.map((shape) => [shape.id, shape]));
  return shapes.map((shape) => {
    if (shape.type !== "arrow" && shape.type !== "line") return shape;
    const startBinding = shape.startBinding && byId.has(shape.startBinding) ? shape.startBinding : null;
    const endBinding = shape.endBinding && byId.has(shape.endBinding) ? shape.endBinding : null;
    const cleaned = { ...shape, startBinding, endBinding };
    if (!cleaned.startBinding && !cleaned.endBinding) return cleaned;
    const start = cleaned.startBinding ? byId.get(cleaned.startBinding) : undefined;
    const end = cleaned.endBinding ? byId.get(cleaned.endBinding) : undefined;
    const pts = connectorPoints(cleaned);
    let p1 = { x: pts[0], y: pts[1] };
    let p2 = { x: pts[2], y: pts[3] };
    if (start && end && start.id !== end.id) {
      p1 = boundaryPoint(start, centerOf(aabb(end)));
      p2 = boundaryPoint(end, centerOf(aabb(start)));
    } else if (start) {
      p1 = boundaryPoint(start, p2);
    } else if (end) {
      p2 = boundaryPoint(end, p1);
    }
    return { ...cleaned, points: [p1.x, p1.y, p2.x, p2.y], x: p1.x, y: p1.y };
  });
}

export function isBindable(shape: Shape) {
  return BINDABLE.has(shape.type);
}

export function shapeBounds(shapes: Shape[]): Box | null {
  if (!shapes.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const shape of shapes) {
    const box = aabb(shape);
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.w);
    maxY = Math.max(maxY, box.y + box.h);
  }
  if (!Number.isFinite(minX)) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
