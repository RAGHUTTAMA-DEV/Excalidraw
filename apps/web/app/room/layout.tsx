"use client"
import AuthProvider from "../Zustand/AuthProvider";
export default function RoomLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <AuthProvider>{children}</AuthProvider>
    );
  }