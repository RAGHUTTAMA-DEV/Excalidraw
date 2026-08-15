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
  return value.filter((item): item is Shape => {
    if (!item || typeof item !== "object") return false;
    const shape = item as Partial<Shape>;
    return Boolean(shape.id && shape.type);
  });
}
