"use client";

import { useRef, useState } from "react";
import { Toolbar } from "./Toolbar";
import { PropertiesPopover } from "./PropertiesPopover";
import { KonvaStage } from "./KonvaStage";
import type { Shape, ShapeType, Tool } from "./types";

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9);

export default function Whiteboard() {
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

  const getPointerPosition = () => stageRef.current?.getPointerPosition();

  const handleMouseDown = (e: any) => {
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
    if (!isDrawing || !currentShape) return;
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
      setShapes((prev) => [...prev, currentShape]);
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
    setShapes((prev) =>
      prev.map((shape) => (shape.id === editingId ? { ...shape, text: editingValue } : shape))
    );
    setEditingId(null);
    setInputPosition(null);
  };

  const selected = shapes.find((shape) => shape.id === selectedId);

  return (
    <div className="relative h-full min-h-0 w-full">
      <KonvaStage
        shapes={shapes}
        currentShape={currentShape}
        tool={tool}
        selectedId={selectedId}
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
          setShapes((prev) => prev.map((shape) => (shape.id === id ? { ...shape, x, y } : shape)));
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
      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
        <Toolbar
          tool={tool}
          onTool={setTool}
          canDelete={Boolean(selectedId)}
          onDelete={() => {
            if (!selectedId) return;
            setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
            setSelectedId(null);
          }}
          onClear={() => {
            setShapes([]);
            setSelectedId(null);
          }}
        />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-10">
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
