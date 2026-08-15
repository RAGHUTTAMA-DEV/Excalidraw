"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { Toolbar } from "./Toolbar";
import { PropertiesPopover } from "./PropertiesPopover";
import { KonvaStage } from "./KonvaStage";
import { normalizeShapes } from "./normalizeShapes";
import {
  aabb,
  boxesIntersect,
  boundaryPoint,
  centerOf,
  connectorPoints,
  constrainAngle,
  dist,
  isBindable,
  hitShapeAt,
  isLabelable,
  isPath,
  nearestBindable,
  recomputeConnectors,
} from "./geometry";
import { api } from "../../lib/api";
import type { Shape, ShapeType, Tool } from "./types";

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9);

const toolKeys: Record<string, Tool> = {
  v: "select",
  r: "rectangle",
  o: "circle",
  d: "diamond",
  a: "arrow",
  l: "line",
  t: "text",
  p: "pen",
};

type WhiteboardProps = {
  roomId: number;
  socket: Socket | null;
};

export default function Whiteboard({ roomId, socket }: WhiteboardProps) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snapId, setSnapId] = useState<string | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [inputPosition, setInputPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    color?: string;
  } | null>(null);
  const [strokeColor, setStrokeColor] = useState("#1c1917");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showInk, setShowInk] = useState(false);
  const [panMode, setPanMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const persistTimer = useRef<number | undefined>(undefined);
  const shapesRef = useRef<Shape[]>([]);
  shapesRef.current = shapes;
  const applyingRemote = useRef(false);
  const hasLocalEdits = useRef(false);
  const drawingRef = useRef(false);
  const draftRef = useRef<Shape | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const panRef = useRef(panMode);
  panRef.current = panMode;
  const selectedRef = useRef(selectedIds);
  selectedRef.current = selectedIds;
  const shiftRef = useRef(false);
  const draftRaf = useRef(0);
  const dragRaf = useRef(0);
  const pendingDrag = useRef<{ id: string; x: number; y: number } | null>(null);
  const marqueeStart = useRef<{ x: number; y: number } | null>(null);
  const marqueeRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const persistNow = useCallback(
    (next: Shape[]) => {
      if (!roomId) return;
      socket?.emit("drawing:update", roomId, next);
      void api.post(`/api/room/save/${roomId}`, { canvas: next }).catch(() => {});
    },
    [roomId, socket]
  );

  const schedulePersist = useCallback(
    (next: Shape[]) => {
      if (applyingRemote.current) return;
      window.clearTimeout(persistTimer.current);
      persistTimer.current = window.setTimeout(() => persistNow(next), 400);
    },
    [persistNow]
  );

  const updateShapes = useCallback(
    (updater: (prev: Shape[]) => Shape[], persist = true) => {
      setShapes((prev) => {
        const next = updater(prev);
        if (persist) {
          hasLocalEdits.current = true;
          schedulePersist(next);
        }
        return next;
      });
    },
    [schedulePersist]
  );

  const startEditing = useCallback((shape: Shape) => {
    if (isPath(shape)) return;
    setTool("select");
    setSelectedIds([shape.id]);
    setEditingId(shape.id);
    setEditingValue(shape.text || "");
    setInputPosition({
      x: shape.x,
      y: shape.y,
      width: shape.width || 160,
      height: shape.height || 36,
      fontSize: shape.fontSize || 18,
      color: shape.stroke,
    });
  }, []);

  const pushDraft = (next: Shape | null) => {
    draftRef.current = next;
    if (!next) {
      setCurrentShape(null);
      return;
    }
    if (!draftRaf.current) {
      draftRaf.current = requestAnimationFrame(() => {
        draftRaf.current = 0;
        setCurrentShape(draftRef.current);
      });
    }
  };

  useEffect(() => {
    let cancelled = false;
    void api
      .get(`/api/room/canvas/${roomId}`)
      .then((response) => {
        if (cancelled || hasLocalEdits.current) return;
        applyingRemote.current = true;
        setShapes(normalizeShapes(response.data.canvasState));
        applyingRemote.current = false;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;
    const applyRemote = (raw: unknown) => {
      applyingRemote.current = true;
      setShapes(normalizeShapes(raw));
      applyingRemote.current = false;
    };
    const onUpdate = (elements: unknown) => applyRemote(elements);
    const onClear = () => applyRemote([]);
    const onRoomData = (data: { canvasState?: unknown }) => {
      if (hasLocalEdits.current) return;
      if (data.canvasState != null) applyRemote(data.canvasState);
    };
    socket.on("drawing:update", onUpdate);
    socket.on("drawing:clear", onClear);
    socket.on("room:data", onRoomData);
    return () => {
      socket.off("drawing:update", onUpdate);
      socket.off("drawing:clear", onClear);
      socket.off("room:data", onRoomData);
    };
  }, [socket]);

  useEffect(() => {
    const flush = () => persistNow(shapesRef.current);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearTimeout(persistTimer.current);
      flush();
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [persistNow]);

  useEffect(() => {
    const selected = shapesRef.current.find((shape) => shape.id === selectedIds[0]);
    if (!selected) return;
    setStrokeColor(selected.stroke);
    setFillColor(selected.fill);
    setStrokeWidth(selected.strokeWidth);
  }, [selectedIds]);

  useEffect(() => {
    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return Boolean(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") shiftRef.current = true;
      const typing = isTyping(event.target) || Boolean(editingId);
      if (typing) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPanMode(true);
        return;
      }
      const key = event.key.toLowerCase();
      if (toolKeys[key]) {
        event.preventDefault();
        setTool(toolKeys[key]);
        return;
      }
      if (event.key === "Enter" && selectedRef.current.length === 1) {
        const shape = shapesRef.current.find((item) => item.id === selectedRef.current[0]);
        if (shape && isLabelable(shape)) {
          event.preventDefault();
          startEditing(shape);
          return;
        }
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        const ids = new Set(selectedRef.current);
        if (!ids.size) return;
        updateShapes((prev) => prev.filter((shape) => !ids.has(shape.id)));
        setSelectedIds([]);
        return;
      }
      if (event.key === "Escape") {
        setTool("select");
        setSelectedIds([]);
        pushDraft(null);
        drawingRef.current = false;
        setMarquee(null);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") shiftRef.current = false;
      if (event.code === "Space") setPanMode(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [editingId, startEditing, updateShapes]);

  const getPointerPosition = () =>
    stageRef.current?.getRelativePointerPosition() ?? stageRef.current?.getPointerPosition();

  const paint = (type: ShapeType, x: number, y: number): Shape => ({
    id: generateId(),
    type,
    x,
    y,
    width: type === "text" ? 160 : 0,
    height: type === "text" ? 36 : 0,
    points: type === "pen" || type === "arrow" || type === "line" ? [x, y, x, y] : undefined,
    text: type === "text" ? "Text" : "",
    fontSize: 18,
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth,
    roughness: 1,
    seed: Math.floor(Math.random() * 1000),
    startBinding: null,
    endBinding: null,
  });

  const handleMouseDown = (e: any) => {
    if (panRef.current) return;
    if (e.evt?.detail === 2) return;
    const pos = getPointerPosition();
    if (!pos) return;

    const hit = hitShapeAt(shapesRef.current, pos);
    const connecting = toolRef.current === "arrow" || toolRef.current === "line";
    if (hit && !(connecting && isBindable(hit))) {
      setTool("select");
      setSelectedIds((prev) => {
        if (e.evt.shiftKey) {
          return prev.includes(hit.id) ? prev.filter((id) => id !== hit.id) : [...prev, hit.id];
        }
        if (prev.includes(hit.id)) return prev;
        return [hit.id];
      });
      return;
    }

    const clickedEmpty = e.target === e.target.getStage();

    if (toolRef.current === "select") {
      if (!clickedEmpty && hit) return;
      marqueeStart.current = pos;
      marqueeRef.current = { x: pos.x, y: pos.y, w: 0, h: 0 };
      setMarquee(marqueeRef.current);
      if (!e.evt.shiftKey) setSelectedIds([]);
      return;
    }

    drawingRef.current = true;
    startRef.current = pos;
    setSelectedIds([]);

    if (toolRef.current === "text") {
      const next = paint("text", pos.x, pos.y);
      drawingRef.current = false;
      updateShapes((prev) => [...prev, next]);
      startEditing(next);
      return;
    }

    const next = paint(toolRef.current as ShapeType, pos.x, pos.y);
    if (next.type === "arrow" || next.type === "line") {
      const snap = nearestBindable(shapesRef.current, pos);
      if (snap) {
        next.startBinding = snap.id;
        const edge = boundaryPoint(snap, pos);
        next.points = [edge.x, edge.y, edge.x, edge.y];
        next.x = edge.x;
        next.y = edge.y;
        setSnapId(snap.id);
      }
    }
    pushDraft(next);
  };

  const handleMouseMove = (event?: { evt?: { shiftKey?: boolean } }) => {
    if (event?.evt?.shiftKey) shiftRef.current = true;
    if (marqueeStart.current) {
      const pos = getPointerPosition();
      if (!pos) return;
      const start = marqueeStart.current;
      const next = {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        w: Math.abs(pos.x - start.x),
        h: Math.abs(pos.y - start.y),
      };
      marqueeRef.current = next;
      setMarquee(next);
      return;
    }

    if (panRef.current || !drawingRef.current || !draftRef.current) return;
    const pos = getPointerPosition();
    if (!pos) return;
    const current = draftRef.current;
    const origin = startRef.current;

    if (current.type === "pen") {
      const pts = current.points || [];
      const lastX = pts[pts.length - 2];
      const lastY = pts[pts.length - 1];
      if (lastX != null && Math.hypot(pos.x - lastX, pos.y - lastY) < 1.6) return;
      pushDraft({ ...current, points: [...pts, pos.x, pos.y] });
      return;
    }

    if (current.type === "arrow" || current.type === "line") {
      let end = pos;
      if (shiftRef.current) end = constrainAngle(origin, pos);
      const startBound = current.startBinding
        ? shapesRef.current.find((shape) => shape.id === current.startBinding)
        : undefined;
      const endBound = nearestBindable(shapesRef.current, end, current.startBinding);
      setSnapId(endBound?.id ?? current.startBinding ?? null);

      let p1 = origin;
      let p2 = end;
      if (startBound && endBound && startBound.id !== endBound.id) {
        p1 = boundaryPoint(startBound, centerOf(aabb(endBound)));
        p2 = boundaryPoint(endBound, centerOf(aabb(startBound)));
      } else if (startBound) {
        p1 = boundaryPoint(startBound, end);
        p2 = end;
      } else if (endBound) {
        p1 = origin;
        p2 = boundaryPoint(endBound, origin);
      }

      pushDraft({
        ...current,
        x: p1.x,
        y: p1.y,
        points: [p1.x, p1.y, p2.x, p2.y],
        endBinding: endBound?.id ?? null,
      });
      return;
    }

    let width = pos.x - origin.x;
    let height = pos.y - origin.y;
    if (shiftRef.current) {
      const side = Math.max(Math.abs(width), Math.abs(height));
      width = Math.sign(width || 1) * side;
      height = Math.sign(height || 1) * side;
    }
    pushDraft({
      ...current,
      width: Math.abs(width),
      height: Math.abs(height),
      x: width < 0 ? origin.x + width : origin.x,
      y: height < 0 ? origin.y + height : origin.y,
    });
  };

  const handleMouseUp = () => {
    if (marqueeStart.current) {
      const box = marqueeRef.current;
      marqueeStart.current = null;
      marqueeRef.current = null;
      setMarquee(null);
      if (box && (box.w > 6 || box.h > 6)) {
        const hits = shapesRef.current
          .filter((shape) => boxesIntersect(aabb(shape), box))
          .map((shape) => shape.id);
        setSelectedIds((prev) => (shiftRef.current ? [...new Set([...prev, ...hits])] : hits));
      }
      return;
    }

    if (!drawingRef.current || !draftRef.current) return;
    drawingRef.current = false;
    const draft = draftRef.current;
    pushDraft(null);
    setSnapId(null);

    let keep = false;
    if (draft.type === "pen") {
      keep = (draft.points?.length || 0) > 4;
    } else if (draft.type === "arrow" || draft.type === "line") {
      const pts = connectorPoints(draft);
      keep = dist({ x: pts[0], y: pts[1] }, { x: pts[2], y: pts[3] }) > 10;
    } else {
      keep = (draft.width || 0) > 6 || (draft.height || 0) > 6;
    }

    if (!keep) return;
    updateShapes((prev) => recomputeConnectors([...prev, draft]));
    setSelectedIds([draft.id]);
    if (isLabelable(draft) && draft.type !== "text") {
      startEditing(draft);
    }
  };

  const commitText = () => {
    if (!editingId) return;
    updateShapes((prev) =>
      prev.map((shape) => (shape.id === editingId ? { ...shape, text: editingValue } : shape))
    );
    setEditingId(null);
    setInputPosition(null);
  };

  const applyInk = (patch: Partial<Pick<Shape, "stroke" | "fill" | "strokeWidth">>) => {
    if (patch.stroke) setStrokeColor(patch.stroke);
    if (patch.fill !== undefined) setFillColor(patch.fill);
    if (patch.strokeWidth) setStrokeWidth(patch.strokeWidth);
    const ids = new Set(selectedRef.current);
    if (!ids.size) return;
    updateShapes((prev) => prev.map((shape) => (ids.has(shape.id) ? { ...shape, ...patch } : shape)));
  };

  const selected = shapes.find((shape) => shape.id === selectedIds[0]);

  const toolbar = (
    <Toolbar
      tool={tool}
      onTool={setTool}
      canDelete={selectedIds.length > 0}
      onDelete={() => {
        const ids = new Set(selectedRef.current);
        if (!ids.size) return;
        updateShapes((prev) => prev.filter((shape) => !ids.has(shape.id)));
        setSelectedIds([]);
      }}
      onClear={() => {
        updateShapes(() => []);
        setSelectedIds([]);
        socket?.emit("drawing:clear", roomId);
      }}
    />
  );

  return (
    <div className="relative h-full min-h-0 w-full">
      <KonvaStage
        shapes={shapes}
        currentShape={currentShape}
        tool={tool}
        selectedIds={selectedIds}
        snapId={snapId}
        marquee={marquee}
        panMode={panMode}
        scale={scale}
        stagePos={stagePos}
        onViewChange={({ scale: nextScale, stagePos: nextPos }) => {
          setScale(nextScale);
          setStagePos(nextPos);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onShapeMouseDown={(id, shift) => {
          const shape = shapesRef.current.find((item) => item.id === id);
          if (
            shape &&
            isBindable(shape) &&
            (toolRef.current === "arrow" || toolRef.current === "line")
          ) {
            return;
          }
          setTool("select");
          setSelectedIds((prev) => {
            if (shift) return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
            if (prev.includes(id)) return prev;
            return [id];
          });
        }}
        onShapeDblClick={(id) => {
          const shape = shapesRef.current.find((item) => item.id === id);
          if (!shape) return;
          startEditing(shape);
        }}
        onDragMove={(id, x, y) => {
          pendingDrag.current = { id, x, y };
          if (dragRaf.current) return;
          dragRaf.current = requestAnimationFrame(() => {
            dragRaf.current = 0;
            const pending = pendingDrag.current;
            if (!pending) return;
            const current = shapesRef.current.find((shape) => shape.id === pending.id);
            if (!current || isPath(current)) return;
            updateShapes(
              (prev) =>
                recomputeConnectors(
                  prev.map((shape) =>
                    shape.id === pending.id ? { ...shape, x: pending.x, y: pending.y } : shape
                  )
                ),
              false
            );
          });
        }}
        onDragEnd={(id, x, y) => {
          updateShapes((prev) =>
            recomputeConnectors(
              prev.map((shape) => {
                if (shape.id !== id) return shape;
                if (isPath(shape)) {
                  const pts = (shape.points || []).map((value, index) =>
                    index % 2 === 0 ? value + x : value + y
                  );
                  return { ...shape, points: pts, x: pts[0] ?? 0, y: pts[1] ?? 0 };
                }
                return { ...shape, x, y };
              })
            )
          );
        }}
        onTransformEnd={(id, next) => {
          updateShapes((prev) =>
            recomputeConnectors(prev.map((shape) => (shape.id === id ? { ...shape, ...next } : shape)))
          );
        }}
        onEndpointDrag={(id, which, x, y) => {
          const others = shapesRef.current.filter((shape) => shape.id !== id);
          const snap = nearestBindable(others, { x, y });
          setSnapId(snap?.id ?? null);
          updateShapes((prev) => {
            const next = prev.map((shape) => {
              if (shape.id !== id) return shape;
              const pts = connectorPoints(shape);
              if (which === "start") {
                return {
                  ...shape,
                  points: [x, y, pts[2], pts[3]],
                  x,
                  y,
                  startBinding: snap?.id ?? null,
                };
              }
              return {
                ...shape,
                points: [pts[0], pts[1], x, y],
                endBinding: snap?.id ?? null,
              };
            });
            return next;
          }, false);
        }}
        onEndpointDragEnd={() => {
          setSnapId(null);
          updateShapes((prev) => recomputeConnectors(prev));
        }}
        stageRef={stageRef}
        transformerRef={transformerRef}
        editingId={editingId}
        editingValue={editingValue}
        inputPosition={inputPosition}
        onEditingValue={setEditingValue}
        onCommitText={commitText}
        onCancelText={() => {
          setEditingId(null);
          setInputPosition(null);
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 hidden justify-center md:flex">
        {toolbar}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center pb-[env(safe-area-inset-bottom)] md:hidden">
        {toolbar}
      </div>
      {shapes.length === 0 && !currentShape ? (
        <div className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-2xl italic text-ink-soft/80 md:text-3xl">
            Draw a box, then write in it.
          </p>
          <p className="mt-2 hidden text-xs uppercase tracking-[0.16em] text-ink-soft/70 md:block">
            Double-click a box to label it · drag an arrow between boxes
          </p>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-20 left-4 z-10 md:bottom-4">
        {tool !== "select" || selectedIds.length || showInk ? (
          <PropertiesPopover
            strokeColor={strokeColor}
            fillColor={fillColor}
            strokeWidth={strokeWidth}
            selectedLabel={selected?.type}
            onStrokeColor={(value) => applyInk({ stroke: value })}
            onFillColor={(value) => applyInk({ fill: value })}
            onStrokeWidth={(value) => applyInk({ strokeWidth: value })}
          />
        ) : (
          <button
            type="button"
            className="pointer-events-auto rounded-full border border-line bg-paper px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-ink-soft"
            onClick={() => setShowInk(true)}
          >
            Ink
          </button>
        )}
      </div>
    </div>
  );
}
