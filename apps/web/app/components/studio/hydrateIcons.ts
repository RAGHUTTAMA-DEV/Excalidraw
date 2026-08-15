import { fetchIconSvg } from "./iconCatalog";
import type { Shape } from "./types";

export async function hydrateIcons(shapes: Shape[], color = "#1c1917"): Promise<Shape[]> {
  return Promise.all(
    shapes.map(async (shape) => {
      if (shape.type !== "icon" || !shape.iconId || shape.iconSvg) return shape;
      try {
        const iconSvg = await fetchIconSvg(shape.iconId, color);
        return { ...shape, iconSvg };
      } catch {
        return shape;
      }
    })
  );
}
