"use client"
import AuthProvider from "../context/AuthProvider";
export default function LoginLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AuthProvider>{children}</AuthProvider>
      </div>
    );
  }