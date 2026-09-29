import type { Shape } from "./types";

export type Point = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

export const BINDABLE = new Set(["rectangle", "circle", "diamond", "text", "icon"]);
export const PATH_TYPES = new Set(["arrow", "line", "pen"]);

export function isBindable(shape: Shape) {
  return BINDABLE.has(shape.type);
}

export function isPath(shape: Shape) {
  return PATH_TYPES.has(shape.type);
}

export function isLabelable(shape: Shape) {
  return BINDABLE.has(shape.type);
}

export function rectRadius(width: number, height: number) {
  return Math.min(22, Math.max(10, Math.min(width, height) * 0.18));
}

export function aabb(shape: Shape): Box {
  if (shape.type === "arrow" || shape.type === "line") {
    const pts = connectorPoints(shape);
    const x1 = pts[0];
    const y1 = pts[1];
    const x2 = pts[2];
    const y2 = pts[3];
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      w: Math.abs(x2 - x1),
      h: Math.abs(y2 - y1),
    };
  }
  if (shape.type === "pen") {
    const pts = shape.points || [];
    if (pts.length < 2) return { x: shape.x, y: shape.y, w: 0, h: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pts.length; i += 2) {
      const px = pts[i];
      const py = pts[i + 1];
      if (px !== undefined && py !== undefined) {
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      }
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
  return {
    x: shape.x,
    y: shape.y,
    w: shape.width || 0,
    h: shape.height || 0,
  };
}

export function centerOf(box: Box): Point {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

export function connectorPoints(shape: Shape): [number, number, number, number] {
  if (shape.points && shape.points.length >= 4) {
    const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = shape.points;
    return [x1, y1, x2, y2];
  }
  return [shape.x, shape.y, shape.x + (shape.width || 0), shape.y + (shape.height || 0)];
}

export function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function boxesIntersect(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInBox(p: Point, box: Box, pad = 0) {
  return (
    p.x >= box.x - pad &&
    p.x <= box.x + box.w + pad &&
    p.y >= box.y - pad &&
    p.y <= box.y + box.h + pad
  );
}

function distToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  if (len === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

export function distToPolyline(p: Point, points: number[]) {
  if (points.length < 2) return Infinity;
  const p0 = points[0];
  const p1 = points[1];
  if (points.length < 4) {
    if (p0 !== undefined && p1 !== undefined) {
      return dist(p, { x: p0, y: p1 });
    }
    return Infinity;
  }
  let best = Infinity;
  for (let i = 0; i < points.length - 2; i += 2) {
    const ax = points[i];
    const ay = points[i + 1];
    const bx = points[i + 2];
    const by = points[i + 3];
    if (ax !== undefined && ay !== undefined && bx !== undefined && by !== undefined) {
      best = Math.min(best, distToSegment(p, { x: ax, y: ay }, { x: bx, y: by }));
    }
  }
  return best;
}

export function hitShapeAt(shapes: Shape[], point: Point, threshold = 20): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (!shape) continue;
    if (shape.type === "pen") {
      if (distToPolyline(point, shape.points || []) <= Math.max(threshold, (shape.strokeWidth || 2) + 12)) {
        return shape;
      }
      continue;
    }
    if (shape.type === "arrow" || shape.type === "line") {
      if (distToPolyline(point, connectorPoints(shape)) <= Math.max(threshold, (shape.strokeWidth || 2) + 12)) {
        return shape;
      }
      continue;
    }
    if (shape.type === "circle") {
      const box = aabb(shape);
      const c = centerOf(box);
      const r = Math.min(box.w, box.h) / 2;
      if (Math.abs(dist(point, c) - r) <= threshold || dist(point, c) <= r) return shape;
      continue;
    }
    if (pointInBox(point, aabb(shape), 6)) return shape;
  }
  return null;
}

export function boundaryPoint(shape: Shape, toward: Point): Point {
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

export function nearestBindable(
  shapes: Shape[],
  point: Point,
  excludeId?: string | null,
  threshold = 36
): Shape | null {
  let best: Shape | null = null;
  let bestScore = threshold;
  for (const shape of shapes) {
    if (!isBindable(shape) || shape.id === excludeId) continue;
    const box = aabb(shape);
    if (pointInBox(point, box, 10)) {
      const score = dist(point, centerOf(box)) * 0.35;
      if (score < bestScore) {
        best = shape;
        bestScore = score;
      }
      continue;
    }
    const edge = boundaryPoint(shape, point);
    const d = dist(point, edge);
    if (d < bestScore) {
      best = shape;
      bestScore = d;
    }
  }
  return best;
}

export function constrainAngle(origin: Point, target: Point): Point {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
  const len = Math.hypot(dx, dy);
  return { x: origin.x + Math.cos(angle) * len, y: origin.y + Math.sin(angle) * len };
}

export function connectorEndpoints(
  shapesById: Map<string, Shape>,
  shape: Shape,
  fallback: [number, number, number, number]
): [number, number, number, number] {
  const start = shape.startBinding ? shapesById.get(shape.startBinding) : undefined;
  const end = shape.endBinding ? shapesById.get(shape.endBinding) : undefined;
  let p1 = { x: fallback[0], y: fallback[1] };
  let p2 = { x: fallback[2], y: fallback[3] };

  if (start && end && start.id !== end.id) {
    const c1 = centerOf(aabb(start));
    const c2 = centerOf(aabb(end));
    p1 = boundaryPoint(start, c2);
    p2 = boundaryPoint(end, c1);
  } else if (start) {
    p1 = boundaryPoint(start, p2);
  } else if (end) {
    p2 = boundaryPoint(end, p1);
  }

  return [p1.x, p1.y, p2.x, p2.y];
}

export function recomputeConnectors(shapes: Shape[]): Shape[] {
  const byId = new Map(shapes.map((shape) => [shape.id, shape]));
  return shapes.map((shape) => {
    if (shape.type !== "arrow" && shape.type !== "line") return shape;
    const startBinding = shape.startBinding && byId.has(shape.startBinding) ? shape.startBinding : null;
    const endBinding = shape.endBinding && byId.has(shape.endBinding) ? shape.endBinding : null;
    const cleaned =
      startBinding !== shape.startBinding || endBinding !== shape.endBinding
        ? { ...shape, startBinding, endBinding }
        : shape;
    if (!cleaned.startBinding && !cleaned.endBinding) return cleaned;
    const pts = connectorPoints(cleaned);
    const next = connectorEndpoints(byId, cleaned, pts);
    if (
      next[0] === pts[0] &&
      next[1] === pts[1] &&
      next[2] === pts[2] &&
      next[3] === pts[3] &&
      cleaned === shape
    ) {
      return shape;
    }
    return { ...cleaned, points: next, x: next[0], y: next[1] };
  });
}

export function normalizeShape(raw: Partial<Shape> & { id: string; type: Shape["type"] }): Shape {
  const shape: Shape = {
    id: raw.id,
    type: raw.type,
    x: raw.x ?? 0,
    y: raw.y ?? 0,
    width: raw.width,
    height: raw.height,
    points: raw.points,
    text: raw.text,
    fontSize: raw.fontSize,
    fill: raw.fill ?? "transparent",
    stroke: raw.stroke ?? "#1c1917",
    strokeWidth: raw.strokeWidth ?? 2,
    roughness: raw.roughness ?? 1,
    seed: raw.seed ?? 1,
    startBinding: raw.startBinding ?? null,
    endBinding: raw.endBinding ?? null,
    iconId: raw.iconId,
    iconSvg: raw.iconSvg,
  };

  if ((shape.type === "arrow" || shape.type === "line") && (!shape.points || shape.points.length < 4)) {
    shape.points = connectorPoints(shape);
  }
  return shape;
}
