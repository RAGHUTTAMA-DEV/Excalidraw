"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import AuthStore from "../../Zustand/AuthStore"
import { io, Socket } from "socket.io-client"

// Drawing tool types
type DrawingTool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line'

// Drawing element interface
interface DrawingElement {
  id: string
  type: DrawingTool
  points: { x: number; y: number }[]
  color: string
  strokeWidth: number
  startX?: number
  startY?: number
  endX?: number
  endY?: number
}

export default function RoomPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [roomDetails, setRoomDetails] = useState<any>()
  const [messages, setMessages] = useState<any[]>([])
  const { token } = AuthStore()
  const { roomId } = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [message, setMessage] = useState<string>("")
  
  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([])
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null)

  useEffect(() => {
    if (!roomId || !token) return

    console.log("Room ID:", roomId)
    getRoomDetails()

    const newsocket: Socket = io("http://localhost:8080", {
      auth: { token },
    })
    setSocket(newsocket)

    newsocket.on("connect", () => {
      console.log("connected to server")
      setIsConnected(true)
      newsocket.emit("join:Room", Number(roomId))
    })

    newsocket.on("disconnect", () => {
      console.log("disconnected from server")
      setIsConnected(false)
    })

    newsocket.on("error", (err) => {
      console.log("Socket error:", err)
    })

    newsocket.on("message", (message) => {
      setMessages((prev) => [...prev, message])
    })

    newsocket.on("user:joined", (roomId, userId) => {
      console.log(`user ${userId} joined room ${roomId}`)
      setMembers((prev) => [...prev, userId])
    })

    newsocket.on("room:data", (data) => {
      console.log("Received room data:", data)
      setMessages(data.messages || [])
      // Load existing canvas state
      if (data.canvasState && Array.isArray(data.canvasState)) {
        setDrawingElements(data.canvasState)
        drawCanvas(data.canvasState)
      }
    })

    // Canvas drawing events
    newsocket.on("drawing:update", (elements) => {
      setDrawingElements(elements)
      drawCanvas(elements)
    })

    newsocket.on("drawing:clear", () => {
      setDrawingElements([])
      clearCanvas()
    })

    return () => {
      newsocket.disconnect()
    }
  }, [roomId, token])

  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Set default canvas properties
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = currentColor
        ctx.lineWidth = strokeWidth
      }
    }
  }, [])

  // Canvas drawing functions
  const getCanvasContext = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const pos = getMousePos(e)
    
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: currentTool,
      points: [pos],
      color: currentColor,
      strokeWidth: strokeWidth,
      startX: pos.x,
      startY: pos.y
    }
    
    setCurrentElement(newElement)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return
    
    const pos = getMousePos(e)
    const updatedElement = {
      ...currentElement,
      points: [...currentElement.points, pos],
      endX: pos.x,
      endY: pos.y
    }
    
    setCurrentElement(updatedElement)
    drawElement(updatedElement)
  }

  const stopDrawing = () => {
    if (!currentElement) return
    
    setIsDrawing(false)
    const updatedElements = [...drawingElements, currentElement]
    setDrawingElements(updatedElements)
    setCurrentElement(null)
    
    // Send to other users
    socket?.emit("drawing:update", Number(roomId), updatedElements)
  }

  const drawElement = (element: DrawingElement) => {
    const ctx = getCanvasContext()
    if (!ctx) return
    
    ctx.strokeStyle = element.color
    ctx.lineWidth = element.strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (element.type === 'pen' || element.type === 'eraser') {
      ctx.beginPath()
      if (element.points.length > 0) {
        const firstPoint = element.points[0]
        if (firstPoint) {
          ctx.moveTo(firstPoint.x, firstPoint.y)
        }
      }
      
      for (let i = 1; i < element.points.length; i++) {
        const point = element.points[i]
        if (point) {
          ctx.lineTo(point.x, point.y)
        }
      }
      
      ctx.stroke()
    } else if (element.type === 'rectangle' && element.startX !== undefined && element.startY !== undefined && element.endX !== undefined && element.endY !== undefined) {
      const width = element.endX - element.startX
      const height = element.endY - element.startY
      ctx.strokeRect(element.startX, element.startY, width, height)
    } else if (element.type === 'circle' && element.startX !== undefined && element.startY !== undefined && element.endX !== undefined && element.endY !== undefined) {
      const radius = Math.sqrt(Math.pow(element.endX - element.startX, 2) + Math.pow(element.endY - element.startY, 2))
      ctx.beginPath()
      ctx.arc(element.startX, element.startY, radius, 0, 2 * Math.PI)
      ctx.stroke()
    } else if (element.type === 'line' && element.startX !== undefined && element.startY !== undefined && element.endX !== undefined && element.endY !== undefined) {
      ctx.beginPath()
      ctx.moveTo(element.startX, element.startY)
      ctx.lineTo(element.endX, element.endY)
      ctx.stroke()
    }
  }

  const drawCanvas = (elements: DrawingElement[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw all elements
    elements.forEach(element => {
      drawElement(element)
    })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleClearCanvas = () => {
    setDrawingElements([])
    clearCanvas()
    socket?.emit("drawing:clear", Number(roomId))
  }

  const handleSendMessage = () => {
    if (!message.trim()) return;
    socket?.emit("message", Number(roomId), message);
    setMessages(prev => [...prev, message]);
    setMessage(""); // clear input after sending
  }

  async function getRoomDetails() {
    try {
      const response = await axios.get(`http://localhost:3001/api/room/${roomId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMembers(response.data.members)
      setRoomDetails(response.data.room)
    } catch (err) {
      console.error("Error fetching room details:", err)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Tools */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Drawing Tools</h2>
        
        {/* Tool Selection */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setCurrentTool('pen')}
            className={`w-full p-2 rounded ${currentTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setCurrentTool('eraser')}
            className={`w-full p-2 rounded ${currentTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            🧽 Eraser
          </button>
          <button
            onClick={() => setCurrentTool('rectangle')}
            className={`w-full p-2 rounded ${currentTool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            ⬜ Rectangle
          </button>
          <button
            onClick={() => setCurrentTool('circle')}
            className={`w-full p-2 rounded ${currentTool === 'circle' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            ⭕ Circle
          </button>
          <button
            onClick={() => setCurrentTool('line')}
            className={`w-full p-2 rounded ${currentTool === 'line' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            📏 Line
          </button>
        </div>

        {/* Color Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Color</label>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-full h-10 rounded border"
          />
        </div>

        {/* Stroke Width */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Stroke Width: {strokeWidth}</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Clear Canvas */}
        <button
          onClick={handleClearCanvas}
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Clear Canvas
        </button>

        {/* Connection Status */}
        <div className="mt-6 p-3 bg-gray-200 rounded">
          {isConnected ? (
            <p className="text-green-600">🟢 Connected</p>
          ) : (
            <p className="text-red-600">🔴 Disconnected</p>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas */}
        <div className="flex-1 bg-white border-b">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-300 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Chat Area */}
        <div className="h-64 bg-gray-50 p-4">
          <h3 className="text-lg font-semibold mb-2">Chat</h3>
          
          {/* Messages */}
          <div className="h-32 overflow-y-auto mb-2 border rounded p-2 bg-white">
            {messages.map((message, idx) => (
              <div key={message.id || `${idx}-${message.content}`} className="p-1 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <strong className="text-blue-600 text-sm">
                    {message.sender?.name} {message.sender?.lastName}
                  </strong>
                  <span className="text-xs text-gray-500">
                    {message.createdAt ? 
                      new Date(message.createdAt).toLocaleTimeString() : 
                      'Just now'
                    }
                  </span>
                </div>
                <div className="text-sm">{message.content}</div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="flex-1 p-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Members */}
      <div className="w-64 bg-gray-100 p-4 border-l">
        <h2 className="text-lg font-semibold mb-4">Room Members</h2>
        <div className="space-y-2">
          {members.map((member, idx) => (
            <div
              key={member.id ?? member.email ?? idx}
              className="p-2 bg-white rounded border"
            >
              <div className="font-medium">
                {member.name} {member.lastName}
              </div>
              <div className="text-sm text-gray-600">
                {member.email}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
