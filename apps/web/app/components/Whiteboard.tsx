import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';

type Tool = 'select' | 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'line' | 'text' | 'pen';

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'line' | 'text' | 'pen';
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
}

export default function Whiteboard() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [tool, setTool] = useState<Tool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [inputPosition, setInputPosition] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  // Colors and styles
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const getPointerPosition = () => {
    const stage = stageRef.current;
    return stage.getPointerPosition();
  };

  const handleMouseDown = (e: any) => {
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    const pos = getPointerPosition();
    setStartPos(pos);
    setIsDrawing(true);

    const newShape: Shape = {
      id: generateId(),
      type: tool as any,
      x: pos.x,
      y: pos.y,
      width: tool === 'text' ? 100 : 0,
      height: tool === 'text' ? 30 : 0,
      points: tool === 'pen' ? [pos.x, pos.y] : undefined,
      text: '',
      fontSize: 16,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      roughness: 1,
      seed: Math.floor(Math.random() * 1000)
    };

    setCurrentShape(newShape);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentShape) return;

    const pos = getPointerPosition();

    if (tool === 'pen') {
      setCurrentShape({
        ...currentShape,
        points: [...(currentShape.points || []), pos.x, pos.y]
      });
    } else {
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      
      setCurrentShape({
        ...currentShape,
        width: Math.abs(width),
        height: Math.abs(height),
        x: width < 0 ? pos.x : startPos.x,
        y: height < 0 ? pos.y : startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentShape) return;
    
    setIsDrawing(false);
    
    // Only add shapes with meaningful dimensions (except for pen and text)
    if (currentShape.type === 'pen' || currentShape.type === 'text' || 
        (currentShape.width && currentShape.width > 5) || 
        (currentShape.height && currentShape.height > 5)) {
      setShapes(prev => [...prev, currentShape]);
      setSelectedId(currentShape.id);
    }
    
    setCurrentShape(null);
  };

  const handleShapeClick = (id: string) => {
    if (tool === 'select') {
      setSelectedId(selectedId === id ? null : id);
    }
  };

  const handleTextDblClick = (id: string) => {
    const shape = shapes.find(s => s.id === id);
    if (shape) {
      setEditingId(id);
      setEditingValue(shape.text || '');
      setInputPosition({
        x: shape.x,
        y: shape.y,
        width: shape.width || 120,
        height: shape.height || 30,
      });
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setShapes(prev => prev.filter(s => s.id !== selectedId));
      setSelectedId(null);
    }
  };

  const clearCanvas = () => {
    setShapes([]);
    setSelectedId(null);
  };

  const renderShape = (shape: Shape) => {
    const commonProps = {
      id: shape.id,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      onClick: () => handleShapeClick(shape.id),
      onDblClick: () => handleTextDblClick(shape.id),
      draggable: tool === 'select',
    };
    const dragHandlers = {
      onDragEnd: (e: any) => {
        const { x, y } = e.target.position();
        setShapes(prev => prev.map(s => s.id === shape.id ? { ...s, x, y } : s));
      }
    };
    switch (shape.type) {
      case 'rectangle':
        return (
          <React.Fragment key={shape.id}>
            <Rect
              key={shape.id}
              {...commonProps}
              {...dragHandlers}
              x={shape.x}
              y={shape.y}
              width={shape.width || 0}
              height={shape.height || 0}
            />
            {shape.text && (
              <Text
                key={shape.id + '-text'}
                x={shape.x}
                y={shape.y}
                width={shape.width || 0}
                height={shape.height || 0}
                text={shape.text}
                fontSize={shape.fontSize || 16}
                fontFamily="Arial"
                fill={shape.stroke}
                align="center"
                verticalAlign="middle"
                listening={false}
              />
            )}
          </React.Fragment>
        );
      
      case 'circle':
        const radius = Math.min((shape.width || 0) / 2, (shape.height || 0) / 2);
        return (
          <React.Fragment key={shape.id}>
            <Circle
              key={shape.id}
              {...commonProps}
              {...dragHandlers}
              x={shape.x + (shape.width || 0) / 2}
              y={shape.y + (shape.height || 0) / 2}
              radius={radius}
            />
            {shape.text && (
              <Text
                key={shape.id + '-text'}
                x={shape.x}
                y={shape.y + (shape.height || 0) / 2 - (shape.fontSize || 16) / 2}
                width={shape.width || 0}
                height={shape.fontSize || 16}
                text={shape.text}
                fontSize={shape.fontSize || 16}
                fontFamily="Arial"
                fill={shape.stroke}
                align="center"
                verticalAlign="middle"
                listening={false}
              />
            )}
          </React.Fragment>
        );
      
      case 'diamond':
        const halfWidth = (shape.width || 0) / 2;
        const halfHeight = (shape.height || 0) / 2;
        const centerX = shape.x + halfWidth;
        const centerY = shape.y + halfHeight;
        return (
          <React.Fragment key={shape.id}>
            <Line
              key={shape.id}
              {...commonProps}
              {...dragHandlers}
              points={[
                centerX, shape.y,
                shape.x + (shape.width || 0), centerY,
                centerX, shape.y + (shape.height || 0),
                shape.x, centerY,
                centerX, shape.y
              ]}
              closed
            />
            {shape.text && (
              <Text
                key={shape.id + '-text'}
                x={shape.x}
                y={shape.y + halfHeight - (shape.fontSize || 16) / 2}
                width={shape.width || 0}
                height={shape.fontSize || 16}
                text={shape.text}
                fontSize={shape.fontSize || 16}
                fontFamily="Arial"
                fill={shape.stroke}
                align="center"
                verticalAlign="middle"
                listening={false}
              />
            )}
          </React.Fragment>
        );
      
      case 'line':
        return (
          <Line
            key={shape.id}
            {...commonProps}
            {...dragHandlers}
            points={[shape.x, shape.y, shape.x + (shape.width || 0), shape.y + (shape.height || 0)]}
          />
        );
      
      case 'pen':
        return (
          <Line
            key={shape.id}
            {...commonProps}
            {...dragHandlers}
            points={shape.points || []}
            lineCap="round"
            lineJoin="round"
          />
        );
      
      case 'text':
        return (
          <Text
            key={shape.id}
            {...commonProps}
            {...dragHandlers}
            x={shape.x}
            y={shape.y}
            text={shape.text || ''}
            fontSize={shape.fontSize || 16}
            fontFamily="Arial"
            fill={shape.stroke}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        {/* Tool buttons */}
        {[
          { tool: 'select', icon: '↖️', label: 'Select' },
          { tool: 'rectangle', icon: '⬜', label: 'Rectangle' },
          { tool: 'circle', icon: '⭕', label: 'Circle' },
          { tool: 'diamond', icon: '💎', label: 'Diamond' },
          { tool: 'arrow', icon: '➡️', label: 'Arrow' },
          { tool: 'line', icon: '📏', label: 'Line' },
          { tool: 'text', icon: '📝', label: 'Text' },
          { tool: 'pen', icon: '✏️', label: 'Pen' },
        ].map(({ tool: toolName, icon, label }) => (
          <button
            key={toolName}
            onClick={() => setTool(toolName as Tool)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
              tool === toolName 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
        
        <div className="w-full h-px bg-gray-200 my-2"></div>
        
        {/* Action buttons */}
        <button
          onClick={deleteSelected}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:bg-red-100 text-red-600"
          title="Delete selected"
          disabled={!selectedId}
        >
          🗑️
        </button>
        
        <button
          onClick={clearCanvas}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 text-gray-600"
          title="Clear all"
        >
          🧹
        </button>
      </div>

      {/* Properties Panel */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Properties</h3>
        
        <div className="space-y-4">
          {/* Stroke Color */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Stroke</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <span className="text-xs text-gray-500">{strokeColor}</span>
            </div>
          </div>

          {/* Fill Color */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Fill</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300"
              />
              <button
                onClick={() => setFillColor('transparent')}
                className={`px-2 py-1 text-xs rounded border ${
                  fillColor === 'transparent' 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                None
              </button>
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Stroke Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Selection Info */}
        {selectedId && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-xs font-semibold text-blue-800 mb-2">Selected Shape</h4>
            <p className="text-xs text-blue-600">
              {shapes.find(s => s.id === selectedId)?.type || 'Unknown'}
            </p>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden">
        <Stage
          ref={stageRef}
          width={window.innerWidth - 320}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="bg-white"
        >
          <Layer>
            {/* Render all shapes */}
            {shapes.map(renderShape)}
            
            {/* Render current shape being drawn */}
            {currentShape && renderShape(currentShape)}
            
            {/* Transformer for selected shape */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
              anchorStroke="#4285f4"
              anchorFill="#ffffff"
              anchorSize={8}
              borderStroke="#4285f4"
              borderDash={[3, 3]}
            />
          </Layer>
        </Stage>
        {editingId && inputPosition && (
          <input
            style={{
              position: 'absolute',
              left: inputPosition.x + 320, // 320 = sidebar width
              top: inputPosition.y,
              width: inputPosition.width,
              height: inputPosition.height,
              fontSize: 16,
              zIndex: 10,
              padding: 2,
              border: '1px solid #4285f4',
              borderRadius: 4,
              background: 'white',
            }}
            value={editingValue}
            onChange={e => setEditingValue(e.target.value)}
            onBlur={() => {
              setShapes(prev =>
                prev.map(s =>
                  s.id === editingId ? { ...s, text: editingValue } : s
                )
              );
              setEditingId(null);
              setInputPosition(null);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setShapes(prev =>
                  prev.map(s =>
                    s.id === editingId ? { ...s, text: editingValue } : s
                  )
                );
                setEditingId(null);
                setInputPosition(null);
              }
              if (e.key === 'Escape') {
                setEditingId(null);
                setInputPosition(null);
              }
            }}
            autoFocus
          />
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs">
        <h4 className="font-semibold mb-1">Quick Tips:</h4>
        <ul className="space-y-1">
          <li>• Draw shapes by dragging with any tool</li>
          <li>• Switch to Select tool and double-click shapes to add text</li>
          <li>• Press Enter to save text, Escape to cancel</li>
          <li>• Use properties panel to change colors and stroke</li>
          <li>• Delete selected shapes with trash icon</li>
        </ul>
      </div>
    </div>
  );
}