"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import AuthStore from "../../Zustand/AuthStore"
import { io, Socket } from "socket.io-client"
import dynamic from "next/dynamic"

const Whiteboard = dynamic(() => import("../../components/Whiteboard"), { ssr: false })

export default function RoomPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [roomDetails, setRoomDetails] = useState<any>()
  const [messages, setMessages] = useState<any[]>([])
  const { token } = AuthStore()
  const { roomId } = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (!roomId || !token) return
    getRoomDetails()
    const newsocket: Socket = io("http://localhost:8080", { auth: { token } })
    setSocket(newsocket)
    newsocket.on("connect", () => {
      setIsConnected(true)
      newsocket.emit("join:Room", Number(roomId))
    })
    newsocket.on("disconnect", () => setIsConnected(false))
    newsocket.on("error", (err) => console.log("Socket error:", err))
    newsocket.on("message", (message) => setMessages((prev) => [...prev, message]))
    newsocket.on("user:joined", (roomId, userId) => setMembers((prev) => [...prev, userId]))
    newsocket.on("room:data", (data) => {
      setMessages(data.messages || [])
    })
    return () => { newsocket.disconnect() }
  }, [roomId, token])

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
      {/* Left Sidebar - Connection Status Only */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Room Info</h2>
        <div className="mt-6 p-3 bg-gray-200 rounded">
          {isConnected ? (
            <p className="text-green-600">🟢 Connected</p>
          ) : (
            <p className="text-red-600">🔴 Disconnected</p>
          )}
        </div>
      </div>
      {/* Main Canvas Area - Whiteboard Only */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-white border-b flex items-center justify-center">
          <Whiteboard />
        </div>
        {/* Chat Area */}
        <div className="h-64 bg-gray-50 p-4">
          <h3 className="text-lg font-semibold mb-2">Chat</h3>
          <div className="h-32 overflow-y-auto mb-2 border rounded p-2 bg-white">
            {messages.map((message, idx) => (
              <div key={message.id || `${idx}-${message.content}`} className="p-1 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <strong className="text-blue-600 text-sm">
                    {message.sender?.name} {message.sender?.lastName}
                  </strong>
                  <span className="text-xs text-gray-500">
                    {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <div className="text-sm">{message.content}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded p-2"
              placeholder="Type a message..."
              onKeyDown={(e) => { if (e.key === 'Enter') { if (message.trim()) { socket?.emit("message", Number(roomId), message); setMessages(prev => [...prev, message]); setMessage(""); } } }}
            />
            <button
              onClick={() => { if (message.trim()) { socket?.emit("message", Number(roomId), message); setMessages(prev => [...prev, message]); setMessage(""); } }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
