"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { create } from "zustand";
import { initSocket } from "../lib/socket";
import AuthStore from "./AuthStore";
import { Socket } from "socket.io-client";

// Zustand store for socket
interface SocketState {
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
}

export const useSocketStore = create<SocketState>((set: (fn: (state: SocketState) => SocketState) => void) => ({
  socket: null,
  setSocket: (socket: Socket | null) => set((state) => ({ ...state, socket })),
}));

export const useSocket: () => Socket | null = () => useSocketStore((state: SocketState) => state.socket);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = AuthStore();
  const setSocket = useSocketStore((state) => state.setSocket);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (token && !socketRef.current) {
      socketRef.current = initSocket(token);
      setSocket(socketRef.current);
    }
    // Only disconnect on tab close
    const handleUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      // Do NOT disconnect here, only on tab close or logout
    };
  }, [token, setSocket]);

  return children;
}; 