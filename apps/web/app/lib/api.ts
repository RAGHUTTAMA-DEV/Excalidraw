import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "./config";
import AuthStore, { toPublicUser, type AuthUser } from "../Zustand/AuthStore";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = AuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? "");
    const isAuthCall = url.includes("/api/auth/login") || url.includes("/api/auth/register");
    if (status === 401 && !isAuthCall) {
      toast.error("Your session dried up. Log in again.");
      AuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser & { password?: string };
};

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return { token: data.token, user: toPublicUser(data.user) };
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
  lastName?: string;
}) {
  const { data } = await api.post<LoginResponse>("/api/auth/register", payload);
  return { token: data.token, user: toPublicUser(data.user) };
}

export function apiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function toastHttpError(error: unknown, fallback = "Something went wrong") {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const message = apiErrorMessage(error, fallback);
  if (status === 403 || /full/i.test(message)) {
    toast.error("That table is full.");
    return;
  }
  if (status === 401) {
    return;
  }
  toast.error(message);
}
