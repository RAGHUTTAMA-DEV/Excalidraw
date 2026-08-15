import { io, Socket } from "socket.io-client";
import { WS_URL } from "./config";

let socket: Socket | undefined;

function connectSocket(token: string) {
  socket = io(WS_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true,
    withCredentials: true,
    auth: { token },
  });
}

export function initSocket(token: string): Socket {
  if (!token) {
    throw new Error("No auth token for websocket");
  }
  if (!socket) {
    connectSocket(token);
  }
  if (!socket) {
    throw new Error("Failed to open websocket");
  }
  return socket;
}

export function getSocket(): Socket | undefined {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = undefined;
}
