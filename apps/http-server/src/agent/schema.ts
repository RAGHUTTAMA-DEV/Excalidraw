import { Type } from "@google/genai";

export const AGENT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: ["intent", "placement"],
  properties: {
    intent: { type: Type.STRING, enum: ["mutate", "compose"] },
    placement: {
      type: Type.STRING,
      enum: ["replaceBoard", "replaceSelection", "append"],
    },
    note: { type: Type.STRING },
    ops: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["op"],
        properties: {
          op: {
            type: Type.STRING,
            enum: ["setType", "setText", "setStyle", "delete", "connect"],
          },
          id: { type: Type.STRING },
          ids: { type: Type.ARRAY, items: { type: Type.STRING } },
          type: {
            type: Type.STRING,
            enum: ["rectangle", "circle", "diamond", "arrow", "line", "text", "pen", "icon"],
          },
          text: { type: Type.STRING },
          fill: { type: Type.STRING },
          stroke: { type: Type.STRING },
          strokeWidth: { type: Type.NUMBER },
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          label: { type: Type.STRING },
        },
      },
    },
    diagram: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        direction: { type: Type.STRING, enum: ["leftRight", "topDown"] },
        lanes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "label", "role"],
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              role: {
                type: Type.STRING,
                enum: ["client", "edge", "app", "data", "ops", "other"],
              },
            },
          },
        },
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "lane", "kind", "label"],
            properties: {
              id: { type: Type.STRING },
              lane: { type: Type.STRING },
              kind: {
                type: Type.STRING,
                enum: ["user", "service", "store", "queue", "gateway", "external"],
              },
              label: { type: Type.STRING },
              detail: { type: Type.STRING },
              iconId: { type: Type.STRING },
            },
          },
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["from", "to", "kind"],
            properties: {
              from: { type: Type.STRING },
              to: { type: Type.STRING },
              label: { type: Type.STRING },
              kind: { type: Type.STRING, enum: ["sync", "async", "data"] },
            },
          },
        },
      },
    },
  },
};
