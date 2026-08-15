"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Transformer, Arrow, Group } from "react-konva";
import type { Shape, Tool } from "./types";
import { aabb, connectorPoints, isPath, rectRadius } from "./geometry";

const LABEL_FONT = "Newsreader, Georgia, serif";

function ShapeLabel({
  width,
  height,
  text,
  fontSize,
  fill,
  pad = 12,
}: {
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  fill: string;
  pad?: number;
}) {
  if (!text) return null;
  return (
    <Text
      x={pad}
      y={pad}
      width={Math.max(8, width - pad * 2)}
      height={Math.max(8, height - pad * 2)}
      text={text}
      fontSize={fontSize || 18}
      fontFamily={LABEL_FONT}
      fill={fill}
      align="center"
      verticalAlign="middle"
      wrap="word"
      ellipsis
      listening={false}
    />
  );
}

type KonvaStageProps = {
  shapes: Shape[];
  currentShape: Shape | null;
  tool: Tool;
  selectedIds: string[];
  snapId: string | null;
  marquee: { x: number; y: number; w: number; h: number } | null;
  panMode: boolean;
  scale: number;
  stagePos: { x: number; y: number };
  onViewChange: (next: { scale: number; stagePos: { x: number; y: number } }) => void;
  onMouseDown: (event: any) => void;
  onMouseMove: (event: any) => void;
  onMouseUp: () => void;
  onShapeMouseDown: (id: string, shift: boolean) => void;
  onShapeDblClick: (id: string) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, next: { x: number; y: number; width: number; height: number }) => void;
  onEndpointDrag: (id: string, which: "start" | "end", x: number, y: number) => void;
  onEndpointDragEnd: (id: string) => void;
  stageRef: React.MutableRefObject<any>;
  transformerRef: React.MutableRefObject<any>;
  editingId: string | null;
  editingValue: string;
  inputPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
    color?: string;
  } | null;
  onEditingValue: (value: string) => void;
  onCommitText: () => void;
  onCancelText: () => void;
};

function hitFill(fill: string) {
  return !fill || fill === "transparent" ? "rgba(255,255,255,0.001)" : fill;
}

export function KonvaStage({
  shapes,
  currentShape,
  tool,
  selectedIds,
  snapId,
  marquee,
  panMode,
  scale,
  stagePos,
  onViewChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onShapeMouseDown,
  onShapeDblClick,
  onDragMove,
  onDragEnd,
  onTransformEnd,
  onEndpointDrag,
  onEndpointDragEnd,
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
  const selectMode = tool === "select";

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
    if (editingId || !transformerRef.current || !stageRef.current) {
      transformerRef.current?.nodes([]);
      transformerRef.current?.getLayer()?.batchDraw();
      if (editingId) return;
    }
    if (!transformerRef.current || !stageRef.current) return;
    const nodes = selectedIds
      .map((id) => {
        const shape = shapes.find((item) => item.id === id);
        if (!shape || isPath(shape)) return null;
        return stageRef.current.findOne("#s-" + id);
      })
      .filter(Boolean);
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, stageRef, transformerRef, shapes, size, editingId]);

  const renderShape = (shape: Shape, preview = false) => {
    const w = Math.max(shape.width || 0, 1);
    const h = Math.max(shape.height || 0, 1);
    const listening = !preview;
    const commonGroup = {
      id: `s-${shape.id}`,
      x: shape.x,
      y: shape.y,
      listening,
      draggable: selectMode && !preview && !editingId,
      onMouseDown: (event: any) => {
        if ((tool === "arrow" || tool === "line") && isPath(shape) === false) return;
        event.cancelBubble = true;
        onShapeMouseDown(shape.id, event.evt.shiftKey);
      },
      onDblClick: (event: any) => {
        event.cancelBubble = true;
        onShapeDblClick(shape.id);
      },
      onDragMove: (event: any) => onDragMove(shape.id, event.target.x(), event.target.y()),
      onDragEnd: (event: any) => onDragEnd(shape.id, event.target.x(), event.target.y()),
      onTransformEnd: (event: any) => {
        const node = event.target;
        const sx = node.scaleX();
        const sy = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onTransformEnd(shape.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(8, w * sx),
          height: Math.max(8, h * sy),
        });
      },
    };

    const strokeProps = {
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      fill: hitFill(shape.fill),
      perfectDrawEnabled: false,
    };

    switch (shape.type) {
      case "rectangle":
        return (
          <Group key={shape.id} {...commonGroup}>
            <Rect width={w} height={h} cornerRadius={rectRadius(w, h)} {...strokeProps} />
            {editingId === shape.id ? null : (
              <ShapeLabel width={w} height={h} text={shape.text} fontSize={shape.fontSize} fill={shape.stroke} />
            )}
          </Group>
        );
      case "circle":
        return (
          <Group key={shape.id} {...commonGroup}>
            <Circle x={w / 2} y={h / 2} radius={Math.max(1, Math.min(w, h) / 2)} {...strokeProps} />
            {editingId === shape.id ? null : (
              <ShapeLabel
                width={w}
                height={h}
                text={shape.text}
                fontSize={shape.fontSize}
                fill={shape.stroke}
                pad={Math.max(14, Math.min(w, h) * 0.18)}
              />
            )}
          </Group>
        );
      case "diamond":
        return (
          <Group key={shape.id} {...commonGroup}>
            <Line
              points={[w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]}
              closed
              {...strokeProps}
            />
            {editingId === shape.id ? null : (
              <ShapeLabel
                width={w}
                height={h}
                text={shape.text}
                fontSize={shape.fontSize}
                fill={shape.stroke}
                pad={Math.max(16, Math.min(w, h) * 0.22)}
              />
            )}
          </Group>
        );
      case "text":
        return (
          <Group key={shape.id} {...commonGroup}>
            <Rect width={Math.max(w, 40)} height={Math.max(h, 24)} fill="rgba(255,255,255,0.001)" />
            {editingId === shape.id ? null : (
              <Text
                text={shape.text || "Text"}
                fontSize={shape.fontSize || 18}
                fontFamily={LABEL_FONT}
                fill={shape.stroke}
                width={Math.max(w, 40)}
                wrap="word"
              />
            )}
          </Group>
        );
      case "line":
      case "arrow": {
        const pts = connectorPoints(shape);
        const pathProps = {
          id: `s-${shape.id}`,
          points: pts,
          stroke: shape.stroke,
          strokeWidth: shape.strokeWidth,
          fill: shape.stroke,
          lineCap: "round" as const,
          lineJoin: "round" as const,
          hitStrokeWidth: 36,
          strokeScaleEnabled: false,
          perfectDrawEnabled: false,
          listening,
          draggable: selectMode && !preview && !shape.startBinding && !shape.endBinding,
          onMouseDown: (event: any) => {
            event.cancelBubble = true;
            onShapeMouseDown(shape.id, event.evt.shiftKey);
          },
          onDragEnd: (event: any) => {
            const node = event.target;
            onDragEnd(shape.id, node.x(), node.y());
            node.position({ x: 0, y: 0 });
          },
        };
        return shape.type === "arrow" ? (
          <Arrow
            key={shape.id}
            {...pathProps}
            pointerLength={14}
            pointerWidth={12}
            pointerAtEnding
          />
        ) : (
          <Line key={shape.id} {...pathProps} />
        );
      }
      case "pen":
        return (
          <Line
            key={shape.id}
            id={`s-${shape.id}`}
            points={shape.points || []}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={0.15}
            hitStrokeWidth={36}
            strokeScaleEnabled={false}
            perfectDrawEnabled={false}
            listening={listening}
            draggable={selectMode && !preview}
            onMouseDown={(event) => {
              event.cancelBubble = true;
              onShapeMouseDown(shape.id, event.evt.shiftKey);
            }}
            onDragEnd={(event) => {
              const node = event.target;
              onDragEnd(shape.id, node.x(), node.y());
              node.position({ x: 0, y: 0 });
            }}
          />
        );
      default:
        return null;
    }
  };

  const selectedConnector = shapes.find(
    (shape) => selectedIds.length === 1 && selectedIds[0] === shape.id && (shape.type === "arrow" || shape.type === "line")
  );

  return (
    <div
      ref={wrapRef}
      className="desk-grid relative h-full w-full overflow-hidden bg-paper"
      style={{ cursor: panMode || panning.current ? "grab" : selectMode ? "default" : "crosshair" }}
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
          onTouchStart={(event) => {
            onMouseDown(event);
          }}
          onTouchMove={(event) => {
            onMouseMove(event);
          }}
          onTouchEnd={() => {
            onMouseUp();
          }}
        >
          <Layer>
            {shapes.map((shape) => renderShape(shape))}
            {currentShape ? renderShape(currentShape, true) : null}
            {selectedIds.map((id) => {
              const shape = shapes.find((item) => item.id === id);
              if (!shape || !isPath(shape)) return null;
              const box = aabb(shape);
              return (
                <Rect
                  key={`sel-${id}`}
                  x={box.x - 8}
                  y={box.y - 8}
                  width={Math.max(16, box.w + 16)}
                  height={Math.max(16, box.h + 16)}
                  stroke="#c45c26"
                  strokeWidth={1.5}
                  dash={[5, 4]}
                  listening={false}
                />
              );
            })}
            {snapId
              ? (() => {
                  const target = shapes.find((shape) => shape.id === snapId);
                  if (!target) return null;
                  const box = aabb(target);
                  return (
                    <Rect
                      x={box.x - 6}
                      y={box.y - 6}
                      width={box.w + 12}
                      height={box.h + 12}
                      stroke="#c45c26"
                      strokeWidth={1.5}
                      dash={[5, 4]}
                      listening={false}
                    />
                  );
                })()
              : null}
            {marquee ? (
              <Rect
                x={marquee.x}
                y={marquee.y}
                width={marquee.w}
                height={marquee.h}
                fill="rgba(196,92,38,0.08)"
                stroke="#c45c26"
                strokeWidth={1}
                dash={[4, 3]}
                listening={false}
              />
            ) : null}
            {selectedConnector
              ? (() => {
                  const pts = connectorPoints(selectedConnector);
                  return (
                    <>
                      <Circle
                        x={pts[0]}
                        y={pts[1]}
                        radius={7}
                        fill="#f4efe4"
                        stroke="#c45c26"
                        strokeWidth={2}
                        draggable
                        onMouseDown={(event) => event.cancelBubble = true}
                        onDragMove={(event) =>
                          onEndpointDrag(selectedConnector.id, "start", event.target.x(), event.target.y())
                        }
                        onDragEnd={() => onEndpointDragEnd(selectedConnector.id)}
                      />
                      <Circle
                        x={pts[2]}
                        y={pts[3]}
                        radius={7}
                        fill="#c45c26"
                        stroke="#f4efe4"
                        strokeWidth={2}
                        draggable
                        onMouseDown={(event) => event.cancelBubble = true}
                        onDragMove={(event) =>
                          onEndpointDrag(selectedConnector.id, "end", event.target.x(), event.target.y())
                        }
                        onDragEnd={() => onEndpointDragEnd(selectedConnector.id)}
                      />
                    </>
                  );
                })()
              : null}
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 8 || newBox.height < 8) return oldBox;
                return newBox;
              }}
              anchorStroke="#c45c26"
              anchorFill="#f4efe4"
              anchorSize={8}
              borderStroke="#c45c26"
              borderDash={[4, 3]}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
            />
          </Layer>
        </Stage>
      ) : null}
      {editingId && inputPosition ? (
        <textarea
          className="absolute z-20 resize-none overflow-hidden bg-transparent text-center font-display outline-none"
          style={{
            left: inputPosition.x * scale + stagePos.x,
            top: inputPosition.y * scale + stagePos.y,
            width: Math.max(48, inputPosition.width * scale),
            height: Math.max(28, inputPosition.height * scale),
            fontSize: (inputPosition.fontSize || 18) * scale,
            lineHeight: 1.25,
            color: inputPosition.color || "#1c1917",
            caretColor: "#c45c26",
            padding: `${14 * scale}px ${16 * scale}px`,
          }}
          value={editingValue}
          onChange={(e) => onEditingValue(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={onCommitText}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") {
              e.preventDefault();
              onCancelText();
            }
          }}
          autoFocus
        />
      ) : null}
    </div>
  );
}
