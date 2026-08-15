import { normalizeShape, recomputeConnectors } from "./geometry";
import type { Shape } from "./types";

export function normalizeShapes(raw: unknown): Shape[] {
  if (!raw) return [];
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const shapes = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const shape = item as Partial<Shape>;
    if (!shape.id || !shape.type) return [];
    return [normalizeShape(shape as Partial<Shape> & { id: string; type: Shape["type"] })];
  });
  return recomputeConnectors(shapes);
}
