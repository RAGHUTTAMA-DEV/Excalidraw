export const API_URL =
  typeof window === "undefined"
    ? (process.env.HTTP_SERVER_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "");

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8080";
