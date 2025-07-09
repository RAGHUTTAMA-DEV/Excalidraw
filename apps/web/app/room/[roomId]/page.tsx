"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import AuthStore from "../../Zustand/AuthStore"
import { io, Socket } from "socket.io-client"

export default function RoomPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [roomDetails, setRoomDetails] = useState<any>()
  const [messages, setMessages] = useState<any[]>([])
  const { token } = AuthStore()
  const { roomId } = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [message,setMessage]=useState<string>("")
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

    newsocket.on("message", (roomId, message) => {
      setMessages((prev)=>[...prev,message])
    })

    newsocket.on("user:joined", (roomId, userId) => {
      console.log(`user ${userId} joined room ${roomId}`)
      setMembers((prev) => [...prev, userId])
    }) 

    return () => {
      newsocket.disconnect()
    }
  }, [roomId, token])

  const handleSendMessage = () => {
    if (!message.trim()) return;
    socket?.emit("message", roomId, message);
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
    <div>
      <h1>Room {roomId}</h1>
      <canvas id="canvas" width={1000} height={1000}></canvas>
      {isConnected ? (
        <p className="text-green-500">Connected to server</p>
      ) : (
        <p className="text-red-500">Disconnected from server</p>
      )}

      <h2 className="mt-4 text-xl font-semibold">Members</h2>
      <div>
        {members.map((member, idx) => (
          <div
            key={member.id ?? member.email ?? idx}
            className="p-2 border-b border-gray-200"
          >
            <div>
              <strong>Name:</strong> {member.name}{" "}
              {member.lastName ? member.lastName : ""}
            </div>
            <div>
              <strong>Email:</strong> {member.email}
            </div>
            <div>
              <strong>Joined:</strong>{" "}
              {member.createdAt
                ? new Date(member.createdAt).toLocaleString()
                : "Unknown"}
            </div>
          </div>
        ))}
      </div>

      <div>
         <h3>Messages</h3>
         <div>
            <input
              type="text"
              placeholder="Enter message"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
         </div>
         <div>
            {messages.map((message, idx) => (
                <div key={typeof message === 'object' && message.id ? message.id : `${idx}-${message}`}>
                    {typeof message === 'object' && message.text ? message.text : message}
                </div>
            ))}
         </div>
      </div>
    </div>
  )
}
