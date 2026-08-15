"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import dynamic from "next/dynamic";
import AuthStore from "../../Zustand/AuthStore";
import { api } from "../../lib/api";
import { WS_URL } from "../../lib/config";
import { StudioChrome } from "../../components/StudioChrome";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const Whiteboard = dynamic(() => import("../../components/Whiteboard"), { ssr: false });

type RoomMember = { id: number; name?: string };
type RoomDetails = { name?: string };
type ChatMessage = {
  id?: number | string;
  content: string;
  createdAt?: string;
  sender?: { name?: string; lastName?: string | null };
};

export default function RoomCanvasPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomDetails, setRoomDetails] = useState<RoomDetails>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { token } = AuthStore();
  const { roomId } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!roomId || !token) return;
    void getRoomDetails();
    const newsocket: Socket = io(WS_URL, { auth: { token } });
    setSocket(newsocket);
    newsocket.on("connect", () => {
      setIsConnected(true);
      newsocket.emit("join:Room", Number(roomId));
    });
    newsocket.on("disconnect", () => setIsConnected(false));
    newsocket.on("error", (err) => console.log("Socket error:", err));
    newsocket.on("message", (incoming: ChatMessage) =>
      setMessages((prev) => [...prev, incoming])
    );
    newsocket.on("user:joined", (_joinedRoomId: number, userId: number) =>
      setMembers((prev) => [...prev, { id: userId }])
    );
    newsocket.on("room:data", (data: { messages?: ChatMessage[] }) => {
      setMessages(data.messages || []);
    });
    return () => {
      newsocket.disconnect();
    };
  }, [roomId, token]);

  async function getRoomDetails() {
    try {
      const response = await api.get(`/api/room/${roomId}/details`);
      setMembers(response.data.members ?? []);
      setRoomDetails(response.data.room);
    } catch (err) {
      console.error("Error fetching room details:", err);
    }
  }

  const sendMessage = () => {
    if (!message.trim()) return;
    socket?.emit("message", Number(roomId), message);
    setMessages((prev) => [...prev, { content: message, createdAt: new Date().toISOString() }]);
    setMessage("");
  };

  return (
    <StudioChrome
      title={roomDetails?.name}
      connected={isConnected}
      members={
        <span className="text-xs text-ink-soft">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <Whiteboard />
        </div>
        <div className="h-56 shrink-0 border-t border-line bg-paper-deep p-4">
          <h3 className="mb-2 font-display text-lg">Chat</h3>
          <div className="mb-2 h-24 overflow-y-auto rounded-md border border-line bg-paper p-2">
            {messages.map((item, idx) => (
              <div key={item.id || `${idx}-${item.content}`} className="border-b border-line/70 py-1">
                <div className="flex items-center gap-2">
                  <strong className="text-sm text-copper">
                    {item.sender?.name} {item.sender?.lastName}
                  </strong>
                  <span className="text-xs text-ink-soft">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : "Just now"}
                  </span>
                </div>
                <div className="text-sm">{item.content}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message…"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </div>
    </StudioChrome>
  );
}
