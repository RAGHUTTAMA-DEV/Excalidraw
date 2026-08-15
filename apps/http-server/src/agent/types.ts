export type ShapeType =
  | "rectangle"
  | "circle"
  | "diamond"
  | "arrow"
  | "line"
  | "text"
  | "pen"
  | "icon";

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  text?: string;
  fontSize?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  roughness: number;
  seed: number;
  startBinding?: string | null;
  endBinding?: string | null;
  iconId?: string;
  iconSvg?: string;
};

export type CompactShape = {
  id: string;
  type: ShapeType;
  text: string;
  iconId?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startBinding: string | null;
  endBinding: string | null;
};

export type LaneRole = "client" | "edge" | "app" | "data" | "ops" | "other";
export type NodeKind = "user" | "service" | "store" | "queue" | "gateway" | "external";
export type EdgeKind = "sync" | "async" | "data";
export type DiagramDirection = "leftRight" | "topDown";
export type AgentIntent = "mutate" | "compose";
export type Placement = "replaceBoard" | "replaceSelection" | "append";

export type DiagramLane = {
  id: string;
  label: string;
  role: LaneRole;
};

export type DiagramNode = {
  id: string;
  lane: string;
  kind: NodeKind;
  label: string;
  detail?: string;
  iconId?: string;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  kind: EdgeKind;
};

export type DiagramSpec = {
  title: string;
  subtitle?: string;
  direction: DiagramDirection;
  lanes: DiagramLane[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

export type MutateOp =
  | { op: "setType"; id: string; type: ShapeType }
  | { op: "setText"; id: string; text: string }
  | { op: "setStyle"; id: string; fill?: string; stroke?: string; strokeWidth?: number }
  | { op: "delete"; ids: string[] }
  | { op: "connect"; from: string; to: string; label?: string };

export type AgentPlan = {
  intent: AgentIntent;
  placement: Placement;
  note?: string;
  ops?: MutateOp[];
  diagram?: DiagramSpec;
};

export type ViewportHint = {
  width: number;
  height: number;
  scale: number;
  stageX: number;
  stageY: number;
};
