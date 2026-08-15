"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Arrow } from "react-konva";
import type { Shape, Tool } from "./types";

type KonvaStageProps = {
  shapes: Shape[];
  currentShape: Shape | null;
  tool: Tool;
  selectedId: string | null;
  panMode: boolean;
  scale: number;
  stagePos: { x: number; y: number };
  onViewChange: (next: { scale: number; stagePos: { x: number; y: number } }) => void;
  onMouseDown: (event: any) => void;
  onMouseMove: (event: any) => void;
  onMouseUp: () => void;
  onShapeClick: (id: string) => void;
  onShapeDblClick: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  stageRef: React.MutableRefObject<any>;
  transformerRef: React.MutableRefObject<any>;
  editingId: string | null;
  editingValue: string;
  inputPosition: { x: number; y: number; width: number; height: number } | null;
  onEditingValue: (value: string) => void;
  onCommitText: () => void;
  onCancelText: () => void;
};

export function KonvaStage({
  shapes,
  currentShape,
  tool,
  selectedId,
  panMode,
  scale,
  stagePos,
  onViewChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onShapeClick,
  onShapeDblClick,
  onDragEnd,
  stageRef,
  transformerRef,
  editingId,
  editingValue,
  inputPosition,
  onEditingValue,
  onCommitText,
  onCancelText,
}: KonvaStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const panning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne("#" + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, stageRef, transformerRef, shapes, size]);

  const renderShape = (shape: Shape) => {
    const commonProps = {
      id: shape.id,
      fill: shape.fill === "transparent" ? undefined : shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      onClick: () => onShapeClick(shape.id),
      onDblClick: () => onShapeDblClick(shape.id),
      draggable: tool === "select",
      onDragEnd: (e: any) => {
        const { x, y } = e.target.position();
        onDragEnd(shape.id, x, y);
      },
    };

    switch (shape.type) {
      case "rectangle":
        return (
          <React.Fragment key={shape.id}>
            <Rect
              {...commonProps}
              x={shape.x}
              y={shape.y}
              width={shape.width || 0}
              height={shape.height || 0}
            />
            {shape.text ? (
              <Text
                x={shape.x}
                y={shape.y}
                width={shape.width || 0}
                height={shape.height || 0}
                text={shape.text}
                fontSize={shape.fontSize || 16}
                fontFamily="Georgia, serif"
                fill={shape.stroke}
                align="center"
                verticalAlign="middle"
                listening={false}
              />
            ) : null}
          </React.Fragment>
        );
      case "circle": {
        const radius = Math.min((shape.width || 0) / 2, (shape.height || 0) / 2);
        return (
          <React.Fragment key={shape.id}>
            <Circle
              {...commonProps}
              x={shape.x + (shape.width || 0) / 2}
              y={shape.y + (shape.height || 0) / 2}
              radius={radius}
            />
            {shape.text ? (
              <Text
                x={shape.x}
                y={shape.y + (shape.height || 0) / 2 - (shape.fontSize || 16) / 2}
                width={shape.width || 0}
                text={shape.text}
                fontSize={shape.fontSize || 16}
                fontFamily="Georgia, serif"
                fill={shape.stroke}
                align="center"
                listening={false}
              />
            ) : null}
          </React.Fragment>
        );
      }
      case "diamond": {
        const halfWidth = (shape.width || 0) / 2;
        const halfHeight = (shape.height || 0) / 2;
        const centerX = shape.x + halfWidth;
        const centerY = shape.y + halfHeight;
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={[
              centerX,
              shape.y,
              shape.x + (shape.width || 0),
              centerY,
              centerX,
              shape.y + (shape.height || 0),
              shape.x,
              centerY,
            ]}
            closed
          />
        );
      }
      case "line":
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={[
              shape.x,
              shape.y,
              shape.x + (shape.width || 0),
              shape.y + (shape.height || 0),
            ]}
          />
        );
      case "arrow":
        return (
          <Arrow
            key={shape.id}
            {...commonProps}
            points={[
              shape.x,
              shape.y,
              shape.x + (shape.width || 0),
              shape.y + (shape.height || 0),
            ]}
            pointerLength={12}
            pointerWidth={10}
            fill={shape.stroke}
          />
        );
      case "pen":
        return (
          <Line
            key={shape.id}
            {...commonProps}
            points={shape.points || []}
            lineCap="round"
            lineJoin="round"
          />
        );
      case "text":
        return (
          <Text
            key={shape.id}
            {...commonProps}
            x={shape.x}
            y={shape.y}
            text={shape.text || "Text"}
            fontSize={shape.fontSize || 18}
            fontFamily="Georgia, serif"
            fill={shape.stroke}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={wrapRef}
      className="desk-grid relative h-full w-full overflow-hidden bg-paper"
      style={{ cursor: panMode || panning.current ? "grab" : tool === "select" ? "default" : "crosshair" }}
    >
      {size.width > 0 ? (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={(event) => {
            event.evt.preventDefault();
            const stage = stageRef.current;
            if (!stage) return;
            const pointer = stage.getPointerPosition();
            if (!pointer) return;
            const oldScale = scale;
            const nextScale = event.evt.deltaY > 0 ? oldScale / 1.06 : oldScale * 1.06;
            const clamped = Math.min(3, Math.max(0.25, nextScale));
            const mousePointTo = {
              x: (pointer.x - stagePos.x) / oldScale,
              y: (pointer.y - stagePos.y) / oldScale,
            };
            onViewChange({
              scale: clamped,
              stagePos: {
                x: pointer.x - mousePointTo.x * clamped,
                y: pointer.y - mousePointTo.y * clamped,
              },
            });
          }}
          onMouseDown={(event) => {
            if (panMode || event.evt.button === 1) {
              panning.current = true;
              lastPointer.current = { x: event.evt.clientX, y: event.evt.clientY };
              return;
            }
            onMouseDown(event);
          }}
          onMouseMove={(event) => {
            if (panning.current) {
              const dx = event.evt.clientX - lastPointer.current.x;
              const dy = event.evt.clientY - lastPointer.current.y;
              lastPointer.current = { x: event.evt.clientX, y: event.evt.clientY };
              onViewChange({
                scale,
                stagePos: { x: stagePos.x + dx, y: stagePos.y + dy },
              });
              return;
            }
            onMouseMove(event);
          }}
          onMouseUp={() => {
            panning.current = false;
            onMouseUp();
          }}
          onMouseLeave={() => {
            panning.current = false;
            onMouseUp();
          }}
        >
          <Layer>
            {shapes.map(renderShape)}
            {currentShape ? renderShape(currentShape) : null}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
              anchorStroke="#c45c26"
              anchorFill="#f4efe4"
              anchorSize={8}
              borderStroke="#c45c26"
              borderDash={[4, 3]}
            />
          </Layer>
        </Stage>
      ) : null}
      {editingId && inputPosition ? (
        <input
          className="absolute z-10 rounded border border-copper bg-paper px-1 font-display text-ink outline-none"
          style={{
            left: inputPosition.x * scale + stagePos.x,
            top: inputPosition.y * scale + stagePos.y,
            width: inputPosition.width * scale,
            height: inputPosition.height * scale,
            fontSize: 16 * scale,
          }}
          value={editingValue}
          onChange={(e) => onEditingValue(e.target.value)}
          onBlur={onCommitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitText();
            if (e.key === "Escape") onCancelText();
          }}
          autoFocus
        />
      ) : null}
    </div>
  );
}
