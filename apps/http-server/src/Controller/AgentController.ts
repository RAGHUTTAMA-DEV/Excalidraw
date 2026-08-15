import type { Request, Response } from "express";
import { prisma } from "@repo/db";
import { applyMutations, sanitizeOps } from "../agent/applyMutations.js";
import { stripSvgs, toCompact } from "../agent/compactBoard.js";
import { compileDiagram, composeOrigin, mergeCompose, sanitizeDiagram } from "../agent/compileDiagram.js";
import { geminiReady, planWithGemini } from "../agent/gemini.js";
import { beginAgentRequest, endAgentRequest } from "../agent/rateLimit.js";
import type { Shape, ViewportHint } from "../agent/types.js";

type AuthReq = Request & { user?: { id: number } };

function asShapes(raw: unknown): Shape[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const shape = item as Partial<Shape>;
    if (!shape.id || !shape.type) return [];
    return [
      {
        id: String(shape.id),
        type: shape.type,
        x: Number(shape.x) || 0,
        y: Number(shape.y) || 0,
        width: shape.width,
        height: shape.height,
        points: shape.points,
        text: shape.text,
        fontSize: shape.fontSize,
        fill: shape.fill ?? "transparent",
        stroke: shape.stroke ?? "#1c1917",
        strokeWidth: shape.strokeWidth ?? 2,
        roughness: shape.roughness ?? 1,
        seed: shape.seed ?? 1,
        startBinding: shape.startBinding ?? null,
        endBinding: shape.endBinding ?? null,
        iconId: shape.iconId,
      },
    ];
  });
}

function jpegPayload(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  const trimmed = raw.replace(/^data:image\/jpeg;base64,/, "");
  if (trimmed.length > 1_400_000) return undefined;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(trimmed.slice(0, 80))) return undefined;
  return trimmed;
}

export async function RunAgent(req: AuthReq, res: Response) {
  const userId = Number(req.user?.id);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!geminiReady()) {
    res.status(503).json({ message: "The agent is not wired — missing GEMINI_API_KEY." });
    return;
  }

  const roomId = Number(req.params.id);
  if (!roomId || Number.isNaN(roomId)) {
    res.status(400).json({ message: "Invalid or missing room id" });
    return;
  }

  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt || prompt.length > 4000) {
    res.status(400).json({ message: "Give the agent a prompt." });
    return;
  }

  const gate = beginAgentRequest(userId);
  if (!gate.ok) {
    res.status(gate.status).json({ message: gate.message });
    return;
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: { where: { id: userId }, select: { id: true } } },
    });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    if (!room.members.length) {
      res.status(403).json({ message: "Join this board first." });
      return;
    }

    const shapes = stripSvgs(asShapes(req.body?.shapes));
    const selectionIds = Array.isArray(req.body?.selectionIds)
      ? req.body.selectionIds.filter((id: unknown): id is string => typeof id === "string").slice(0, 40)
      : [];
    const compact = toCompact(shapes, selectionIds);
    const imageBase64 = jpegPayload(req.body?.imageBase64);
    const viewport = req.body?.viewport as ViewportHint | undefined;

    const plan = await planWithGemini({
      prompt,
      selectionIds,
      board: compact.items,
      truncated: compact.truncated,
      total: compact.total,
      imageBase64,
    });

    if (plan.intent === "mutate") {
      const ops = sanitizeOps(plan.ops);
      if (!ops.length) {
        res.status(422).json({ message: "Could not turn that into an edit." });
        return;
      }
      const next = applyMutations(shapes, ops, selectionIds);
      res.status(200).json({
        intent: "mutate",
        shapes: next,
        newIds: [],
        note: plan.note,
      });
      return;
    }

    const diagram = sanitizeDiagram(plan.diagram);
    if (!diagram) {
      res.status(422).json({ message: "The diagram came back empty." });
      return;
    }
    const origin = composeOrigin(shapes, plan.placement, selectionIds, viewport);
    const compiled = compileDiagram(diagram, origin);
    const merged = mergeCompose(shapes, compiled, plan.placement, selectionIds);
    res.status(200).json({
      intent: "compose",
      shapes: merged.shapes,
      newIds: merged.newIds,
      note: plan.note,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent failed";
    console.error("Agent error:", err);
    res.status(500).json({ message: message.includes("API") ? "Gemini refused the request." : "The agent stalled." });
  } finally {
    endAgentRequest(userId);
  }
}
