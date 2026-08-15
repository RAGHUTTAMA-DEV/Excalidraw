"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import dynamic from "next/dynamic";
import AuthStore from "../../Zustand/AuthStore";
import { api, toastHttpError } from "../../lib/api";
import { WS_URL } from "../../lib/config";
import { StudioChrome } from "../../components/StudioChrome";
import { MembersMenu } from "../../components/studio/MembersMenu";
import { ChatDrawer } from "../../components/studio/ChatDrawer";
import type { ChatMessage, RoomMember } from "../../components/studio/types";
import { Button } from "../../components/ui/Button";

const Whiteboard = dynamic(() => import("../../components/Whiteboard"), { ssr: false });

type RoomDetails = { name?: string };

export default function RoomCanvasPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomDetails, setRoomDetails] = useState<RoomDetails>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const chatOpenRef = useRef(false);
  chatOpenRef.current = chatOpen;
  const [unread, setUnread] = useState(0);
  const { token } = AuthStore();
  const { roomId } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [draft, setDraft] = useState("");

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
    newsocket.on("message", (incoming: ChatMessage) => {
      setMessages((prev) => [...prev, incoming]);
      if (!chatOpenRef.current) setUnread((count) => count + 1);
    });
    newsocket.on("user:joined", (_joinedRoomId: number, userId: number) =>
      setMembers((prev) =>
        prev.some((member) => member.id === userId) ? prev : [...prev, { id: userId }]
      )
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
      toastHttpError(err, "Could not open this board");
    }
  }

  const sendMessage = () => {
    if (!draft.trim()) return;
    socket?.emit("message", Number(roomId), draft);
    setDraft("");
  };

  const openChat = () => {
    setChatOpen(true);
    setUnread(0);
  };

  return (
    <StudioChrome
      title={roomDetails?.name}
      connected={isConnected}
      members={<MembersMenu members={members} />}
      actions={
        <Button variant="secondary" className="relative px-3 py-1.5" onClick={openChat}>
          Chat
          {unread > 0 ? (
            <span className="ml-1 rounded-full bg-copper px-1.5 text-[10px] text-paper">
              {unread}
            </span>
          ) : null}
        </Button>
      }
    >
      <Whiteboard roomId={Number(roomId)} socket={socket} />
      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        draft={draft}
        onDraft={setDraft}
        onSend={sendMessage}
      />
    </StudioChrome>
  );
}
