export type Tool =
  | "select"
  | "rectangle"
  | "circle"
  | "diamond"
  | "arrow"
  | "line"
  | "text"
  | "pen";

export type ShapeType = Exclude<Tool, "select">;

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
};

export type RoomMember = {
  id: number;
  name?: string;
  lastName?: string | null;
  email?: string;
};

export type ChatMessage = {
  id?: number | string;
  content: string;
  createdAt?: string;
  sender?: { name?: string; lastName?: string | null };
};
