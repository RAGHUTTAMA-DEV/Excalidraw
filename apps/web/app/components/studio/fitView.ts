import { aabb } from "./geometry";
import type { Shape } from "./types";

export function fitShapesInView(
  shapes: Shape[],
  size: { width: number; height: number }
): { scale: number; stagePos: { x: number; y: number } } | null {
  if (!shapes.length || size.width < 8 || size.height < 8) return null;
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
  const pad = 96;
  const w = Math.max(120, maxX - minX + pad * 2);
  const h = Math.max(120, maxY - minY + pad * 2);
  const scale = Math.min(1.15, Math.max(0.28, Math.min(size.width / w, size.height / h)));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    scale,
    stagePos: {
      x: size.width / 2 - cx * scale,
      y: size.height / 2 - cy * scale,
    },
  };
}
