"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { Toolbar } from "./Toolbar";
import { PropertiesPopover } from "./PropertiesPopover";
import { KonvaStage } from "./KonvaStage";
import { normalizeShapes } from "./normalizeShapes";
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [inputPosition, setInputPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
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
    (updater: (prev: Shape[]) => Shape[]) => {
      setShapes((prev) => {
        const next = updater(prev);
        hasLocalEdits.current = true;
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

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
    const isTyping = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      return Boolean(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setPanMode(true);
        return;
      }
      if (isTyping(event.target) || editingId) return;
      const key = event.key.toLowerCase();
      if (toolKeys[key]) {
        event.preventDefault();
        setTool(toolKeys[key]);
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        if (!selectedId) return;
        updateShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
        setSelectedId(null);
        return;
      }
      if (event.key === "Escape") {
        setTool("select");
        setSelectedId(null);
        setCurrentShape(null);
        setIsDrawing(false);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setPanMode(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [editingId, selectedId, updateShapes]);

  const getPointerPosition = () =>
    stageRef.current?.getRelativePointerPosition() ?? stageRef.current?.getPointerPosition();

  const handleMouseDown = (e: any) => {
    if (panMode) return;
    if (tool === "select") {
      if (e.target === e.target.getStage()) setSelectedId(null);
      return;
    }
    const pos = getPointerPosition();
    if (!pos) return;
    setStartPos(pos);
    setIsDrawing(true);
    setCurrentShape({
      id: generateId(),
      type: tool as ShapeType,
      x: pos.x,
      y: pos.y,
      width: tool === "text" ? 120 : 0,
      height: tool === "text" ? 32 : 0,
      points: tool === "pen" ? [pos.x, pos.y] : undefined,
      text: tool === "text" ? "Text" : "",
      fontSize: 18,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      roughness: 1,
      seed: Math.floor(Math.random() * 1000),
    });
  };

  const handleMouseMove = () => {
    if (panMode || !isDrawing || !currentShape) return;
    const pos = getPointerPosition();
    if (!pos) return;
    if (tool === "pen") {
      setCurrentShape({
        ...currentShape,
        points: [...(currentShape.points || []), pos.x, pos.y],
      });
      return;
    }
    const width = pos.x - startPos.x;
    const height = pos.y - startPos.y;
    setCurrentShape({
      ...currentShape,
      width: Math.abs(width),
      height: Math.abs(height),
      x: width < 0 ? pos.x : startPos.x,
      y: height < 0 ? pos.y : startPos.y,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return;
    setIsDrawing(false);
    const keep =
      currentShape.type === "pen" ||
      currentShape.type === "text" ||
      (currentShape.width && currentShape.width > 5) ||
      (currentShape.height && currentShape.height > 5);
    if (keep) {
      updateShapes((prev) => [...prev, currentShape]);
      setSelectedId(currentShape.id);
      if (currentShape.type === "text") {
        setEditingId(currentShape.id);
        setEditingValue(currentShape.text || "");
        setInputPosition({
          x: currentShape.x,
          y: currentShape.y,
          width: currentShape.width || 120,
          height: currentShape.height || 32,
        });
      }
    }
    setCurrentShape(null);
  };

  const commitText = () => {
    if (!editingId) return;
    updateShapes((prev) =>
      prev.map((shape) => (shape.id === editingId ? { ...shape, text: editingValue } : shape))
    );
    setEditingId(null);
    setInputPosition(null);
  };

  const selected = shapes.find((shape) => shape.id === selectedId);

  const toolbar = (
    <Toolbar
      tool={tool}
      onTool={setTool}
      canDelete={Boolean(selectedId)}
      onDelete={() => {
        if (!selectedId) return;
        updateShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
        setSelectedId(null);
      }}
      onClear={() => {
        updateShapes(() => []);
        setSelectedId(null);
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
        selectedId={selectedId}
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
        onShapeClick={(id) => {
          if (tool === "select") setSelectedId(selectedId === id ? null : id);
        }}
        onShapeDblClick={(id) => {
          const shape = shapes.find((item) => item.id === id);
          if (!shape) return;
          setEditingId(id);
          setEditingValue(shape.text || "");
          setInputPosition({
            x: shape.x,
            y: shape.y,
            width: shape.width || 120,
            height: shape.height || 32,
          });
        }}
        onDragEnd={(id, x, y) => {
          updateShapes((prev) => prev.map((shape) => (shape.id === id ? { ...shape, x, y } : shape)));
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
            Drag to leave a mark.
          </p>
          <p className="mt-2 hidden text-xs uppercase tracking-[0.16em] text-ink-soft/70 md:block">
            Wheel zooms · Space pans
          </p>
        </div>
      ) : null}
      <div className="pointer-events-none absolute bottom-20 left-4 z-10 md:bottom-4">
        {tool !== "select" || selectedId || showInk ? (
          <PropertiesPopover
            strokeColor={strokeColor}
            fillColor={fillColor}
            strokeWidth={strokeWidth}
            selectedLabel={selected?.type}
            onStrokeColor={setStrokeColor}
            onFillColor={setFillColor}
            onStrokeWidth={setStrokeWidth}
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
