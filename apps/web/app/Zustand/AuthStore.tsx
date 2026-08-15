import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import RoomStore from "./RoomStore";
import { disconnectSocket } from "../lib/socket";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  lastName?: string | null;
};

export function toPublicUser(user: {
  id: number;
  name: string;
  email: string;
  lastName?: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    lastName: user.lastName ?? null,
  };
}

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  hasHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsError: (isError: boolean) => void;
  setErrorMessage: (message: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const AuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isError: false,
      errorMessage: "",
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsError: (isError) => set({ isError }),
      setErrorMessage: (errorMessage) =>
        set({ errorMessage, isError: Boolean(errorMessage) }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      login: (user, token) =>
        set({
          user,
          token,
          isError: false,
          errorMessage: "",
          isLoading: false,
        }),
      logout: () => {
        disconnectSocket();
        RoomStore.getState().clearRooms();
        set({
          user: null,
          token: null,
          isError: false,
          errorMessage: "",
          isLoading: false,
        });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => () => {
        AuthStore.getState().setHasHydrated(true);
      },
    }
  )
);

export default AuthStore;
