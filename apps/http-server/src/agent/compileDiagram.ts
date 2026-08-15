import { resolveIconId } from "./catalog.js";
import { recomputeConnectors, shapeBounds } from "./connectors.js";
import type {
  DiagramEdge,
  DiagramSpec,
  LaneRole,
  NodeKind,
  Placement,
  Shape,
  ViewportHint,
} from "./types.js";

const INK = "#1c1917";
const INK_SOFT = "#57534e";
const COPPER = "#c45c26";
const PAPER = "#f4efe4";

const CARD_W = 168;
const CARD_H = 148;
const GAP = 56;
const LANE_PAD_X = 40;
const LANE_PAD_TOP = 56;
const LANE_PAD_BOTTOM = 36;
const LANE_GAP = 32;
const TITLE_BLOCK = 86;

const LANE_FILL: Record<LaneRole, string> = {
  client: "#c45c2614",
  edge: "#c45c2610",
  app: "#1c19170a",
  data: "#1c191712",
  ops: "#c45c260f",
  other: "#1c191708",
};

const LANE_STROKE: Record<LaneRole, string> = {
  client: "#c45c2640",
  edge: "#c45c2633",
  app: "#1c19171f",
  data: "#1c191729",
  ops: "#c45c2633",
  other: "#1c19171a",
};

const KINDS: NodeKind[] = ["user", "service", "store", "queue", "gateway", "external"];
const ROLES: LaneRole[] = ["client", "edge", "app", "data", "ops", "other"];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function baseShape(partial: Partial<Shape> & { id: string; type: Shape["type"] }): Shape {
  return {
    x: 0,
    y: 0,
    fill: "transparent",
    stroke: INK,
    strokeWidth: 1.5,
    roughness: 1,
    seed: Math.floor(Math.random() * 800) + 1,
    startBinding: null,
    endBinding: null,
    ...partial,
  };
}

export function sanitizeDiagram(raw: unknown): DiagramSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const lanesIn = Array.isArray(value.lanes) ? value.lanes : [];
  const nodesIn = Array.isArray(value.nodes) ? value.nodes : [];
  const edgesIn = Array.isArray(value.edges) ? value.edges : [];

  const lanes = lanesIn
    .slice(0, 8)
    .flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const lane = item as Record<string, unknown>;
      const id = String(lane.id || `lane_${index}`).slice(0, 40);
      const label = String(lane.label || "Layer").slice(0, 28);
      const role = ROLES.includes(lane.role as LaneRole) ? (lane.role as LaneRole) : "other";
      return [{ id, label, role }];
    });

  if (!lanes.length) {
    lanes.push({ id: "app", label: "Application", role: "app" });
  }

  const laneIds = new Set(lanes.map((lane) => lane.id));
  const defaultLane = lanes[0].id;
  const seenNodes = new Set<string>();

  const nodes = nodesIn
    .slice(0, 16)
    .flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const node = item as Record<string, unknown>;
      let id = String(node.id || `n_${index}`).slice(0, 40);
      if (seenNodes.has(id)) id = `${id}_${index}`;
      seenNodes.add(id);
      const kind = KINDS.includes(node.kind as NodeKind) ? (node.kind as NodeKind) : "service";
      const lane = laneIds.has(String(node.lane)) ? String(node.lane) : defaultLane;
      const label = String(node.label || "Service").slice(0, 28);
      const detail = node.detail ? String(node.detail).slice(0, 40) : undefined;
      const iconId = resolveIconId(typeof node.iconId === "string" ? node.iconId : undefined, kind);
      return [{ id, lane, kind, label, detail, iconId }];
    });

  if (!nodes.length) return null;

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: DiagramEdge[] = [];
  for (const item of edgesIn.slice(0, 24)) {
    if (!item || typeof item !== "object") continue;
    const edge = item as Record<string, unknown>;
    const from = String(edge.from || "");
    const to = String(edge.to || "");
    if (!nodeIds.has(from) || !nodeIds.has(to) || from === to) continue;
    const kind = edge.kind === "async" || edge.kind === "data" ? edge.kind : "sync";
    const label = edge.label ? String(edge.label).slice(0, 22) : undefined;
    edges.push({ from, to, kind, label });
  }

  return {
    title: String(value.title || "Architecture").slice(0, 48),
    subtitle: value.subtitle ? String(value.subtitle).slice(0, 72) : undefined,
    direction: value.direction === "topDown" ? "topDown" : "leftRight",
    lanes,
    nodes,
    edges,
  };
}

export function compileDiagram(spec: DiagramSpec, origin: { x: number; y: number }): Shape[] {
  const byLane = new Map<string, typeof spec.nodes>();
  for (const lane of spec.lanes) byLane.set(lane.id, []);
  for (const node of spec.nodes) {
    const list = byLane.get(node.lane) ?? [];
    list.push(node);
    byLane.set(node.lane, list);
  }

  const activeLanes = spec.lanes.filter((lane) => (byLane.get(lane.id) || []).length > 0);
  const leftRight = spec.direction !== "topDown";
  const shapes: Shape[] = [];
  const nodePos = new Map<string, { x: number; y: number }>();

  const maxCount = Math.max(...activeLanes.map((lane) => (byLane.get(lane.id) || []).length), 1);

  const title = baseShape({
    id: uid("title"),
    type: "text",
    x: origin.x,
    y: origin.y,
    width: 640,
    height: 40,
    text: spec.title,
    fontSize: 28,
    fill: "transparent",
    stroke: INK,
    strokeWidth: 1,
  });
  shapes.push(title);
  if (spec.subtitle) {
    shapes.push(
      baseShape({
        id: uid("sub"),
        type: "text",
        x: origin.x,
        y: origin.y + 38,
        width: 640,
        height: 28,
        text: spec.subtitle,
        fontSize: 15,
        fill: "transparent",
        stroke: INK_SOFT,
        strokeWidth: 1,
      })
    );
  }

  const contentY = origin.y + TITLE_BLOCK;
  const contentX = origin.x;

  if (leftRight) {
    const laneW = CARD_W + LANE_PAD_X * 2;
    const laneH = LANE_PAD_TOP + maxCount * CARD_H + Math.max(0, maxCount - 1) * GAP + LANE_PAD_BOTTOM;
    activeLanes.forEach((lane, laneIndex) => {
      const lx = contentX + laneIndex * (laneW + LANE_GAP);
      const ly = contentY;
      shapes.push(
        baseShape({
          id: uid(`lane_${lane.id}`),
          type: "rectangle",
          x: lx,
          y: ly,
          width: laneW,
          height: laneH,
          fill: LANE_FILL[lane.role],
          stroke: LANE_STROKE[lane.role],
          strokeWidth: 1,
          text: "",
        })
      );
      shapes.push(
        baseShape({
          id: uid(`ll_${lane.id}`),
          type: "text",
          x: lx + 18,
          y: ly + 14,
          width: laneW - 36,
          height: 24,
          text: lane.label.toUpperCase(),
          fontSize: 12,
          stroke: INK_SOFT,
          fill: "transparent",
          strokeWidth: 1,
        })
      );
      const nodes = byLane.get(lane.id) || [];
      nodes.forEach((node, nodeIndex) => {
        const nx = lx + LANE_PAD_X;
        const ny = ly + LANE_PAD_TOP + nodeIndex * (CARD_H + GAP);
        nodePos.set(node.id, { x: nx, y: ny });
        shapes.push(card(node.id, nx, ny, node.label, node.iconId || resolveIconId(undefined, node.kind)));
      });
    });
  } else {
    const laneH = CARD_H + LANE_PAD_TOP + LANE_PAD_BOTTOM;
    const laneW = LANE_PAD_X * 2 + maxCount * CARD_W + Math.max(0, maxCount - 1) * GAP;
    activeLanes.forEach((lane, laneIndex) => {
      const lx = contentX;
      const ly = contentY + laneIndex * (laneH + LANE_GAP);
      shapes.push(
        baseShape({
          id: uid(`lane_${lane.id}`),
          type: "rectangle",
          x: lx,
          y: ly,
          width: laneW,
          height: laneH,
          fill: LANE_FILL[lane.role],
          stroke: LANE_STROKE[lane.role],
          strokeWidth: 1,
          text: "",
        })
      );
      shapes.push(
        baseShape({
          id: uid(`ll_${lane.id}`),
          type: "text",
          x: lx + 18,
          y: ly + 14,
          width: laneW - 36,
          height: 24,
          text: lane.label.toUpperCase(),
          fontSize: 12,
          stroke: INK_SOFT,
          fill: "transparent",
          strokeWidth: 1,
        })
      );
      const nodes = byLane.get(lane.id) || [];
      nodes.forEach((node, nodeIndex) => {
        const nx = lx + LANE_PAD_X + nodeIndex * (CARD_W + GAP);
        const ny = ly + LANE_PAD_TOP;
        nodePos.set(node.id, { x: nx, y: ny });
        shapes.push(card(node.id, nx, ny, node.label, node.iconId || resolveIconId(undefined, node.kind)));
      });
    });
  }

  for (const edge of spec.edges) {
    const from = nodePos.get(edge.from);
    const to = nodePos.get(edge.to);
    if (!from || !to) continue;
    const stroke = edge.kind === "async" ? COPPER : INK;
    const strokeWidth = edge.kind === "async" ? 1.5 : edge.kind === "data" ? 1.75 : 2;
    shapes.push(
      baseShape({
        id: uid("arr"),
        type: "arrow",
        x: from.x + CARD_W / 2,
        y: from.y + CARD_H / 2,
        points: [from.x + CARD_W / 2, from.y + CARD_H / 2, to.x + CARD_W / 2, to.y + CARD_H / 2],
        fill: stroke,
        stroke,
        strokeWidth,
        startBinding: edge.from,
        endBinding: edge.to,
      })
    );
    if (edge.label) {
      const mx = (from.x + to.x) / 2 + CARD_W / 2 - 40;
      const my = (from.y + to.y) / 2 + CARD_H / 2 - 18;
      shapes.push(
        baseShape({
          id: uid("elbl"),
          type: "text",
          x: mx,
          y: my,
          width: 96,
          height: 22,
          text: edge.label,
          fontSize: 12,
          stroke: INK_SOFT,
          fill: PAPER,
          strokeWidth: 1,
        })
      );
    }
  }

  return recomputeConnectors(shapes);
}

function card(id: string, x: number, y: number, label: string, iconId: string): Shape {
  return baseShape({
    id,
    type: "icon",
    x,
    y,
    width: CARD_W,
    height: CARD_H,
    text: label,
    fontSize: 14,
    fill: PAPER,
    stroke: INK,
    strokeWidth: 1.5,
    iconId,
  });
}

export function composeOrigin(
  existing: Shape[],
  placement: Placement,
  selectionIds: string[],
  viewport?: ViewportHint
): { x: number; y: number } {
  const viewCenter = () => {
    if (!viewport) return { x: 80, y: 80 };
    return {
      x: (viewport.width / 2 - viewport.stageX) / (viewport.scale || 1) - 420,
      y: (viewport.height / 2 - viewport.stageY) / (viewport.scale || 1) - 280,
    };
  };

  if (placement === "replaceBoard" || existing.length === 0) {
    return viewCenter();
  }

  if (placement === "replaceSelection" && selectionIds.length) {
    const selected = existing.filter((shape) => selectionIds.includes(shape.id));
    const box = shapeBounds(selected);
    if (box) return { x: box.x, y: box.y - TITLE_BLOCK };
  }

  const box = shapeBounds(existing);
  if (!box) return viewCenter();
  return { x: box.x + box.w + 96, y: box.y };
}

export function mergeCompose(
  existing: Shape[],
  compiled: Shape[],
  placement: Placement,
  selectionIds: string[]
): { shapes: Shape[]; newIds: string[] } {
  const newIds = compiled.map((shape) => shape.id);
  if (placement === "replaceBoard" || existing.length === 0) {
    return { shapes: compiled, newIds };
  }
  if (placement === "replaceSelection" && selectionIds.length) {
    const drop = new Set(selectionIds);
    for (const shape of existing) {
      if (
        (shape.type === "arrow" || shape.type === "line") &&
        ((shape.startBinding && drop.has(shape.startBinding)) ||
          (shape.endBinding && drop.has(shape.endBinding)))
      ) {
        drop.add(shape.id);
      }
    }
    const kept = existing.filter((shape) => !drop.has(shape.id));
    return { shapes: recomputeConnectors([...kept, ...compiled]), newIds };
  }
  return { shapes: recomputeConnectors([...existing, ...compiled]), newIds };
}
