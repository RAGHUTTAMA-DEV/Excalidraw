import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "./prompt.js";
import { AGENT_RESPONSE_SCHEMA } from "./schema.js";
import type { AgentPlan, CompactShape } from "./types.js";

let client: GoogleGenAI | null = null;

export function geminiReady() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function ai() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export async function planWithGemini(input: {
  prompt: string;
  selectionIds: string[];
  board: CompactShape[];
  truncated: number;
  total: number;
  imageBase64?: string;
}): Promise<AgentPlan> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const userText = [
    `Prompt: ${input.prompt}`,
    `Selected ids: ${input.selectionIds.join(", ") || "(none)"}`,
    `Board shape count: ${input.total}${input.truncated ? ` (showing ${input.board.length})` : ""}`,
    `Board JSON: ${JSON.stringify(input.board)}`,
  ].join("\n");

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: userText },
  ];
  if (input.imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: input.imageBase64,
      },
    });
  }

  const response = await ai().models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: systemPrompt(),
      responseMimeType: "application/json",
      responseSchema: AGENT_RESPONSE_SCHEMA,
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty model response");
  const parsed = JSON.parse(text) as AgentPlan;
  if (parsed.intent !== "mutate" && parsed.intent !== "compose") {
    throw new Error("Invalid intent");
  }
  if (
    parsed.placement !== "replaceBoard" &&
    parsed.placement !== "replaceSelection" &&
    parsed.placement !== "append"
  ) {
    parsed.placement = input.selectionIds.length ? "replaceSelection" : "append";
  }
  return parsed;
}
