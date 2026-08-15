import { useCallback } from "react";
import { api, apiErrorMessage } from "../lib/api";
import RoomStore, { type Room } from "../Zustand/RoomStore";
import AuthStore from "../Zustand/AuthStore";

export const useRooms = () => {
  const { token } = AuthStore();
  const {
    rooms,
    isLoading,
    isError,
    errorMessage,
    setRooms,
    setIsLoading,
    setErrorMessage,
    clearError,
    setCurrentRoom,
  } = RoomStore();

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const response = await api.get<{ rooms: Room[] }>("/api/room");
      setRooms(response.data.rooms || []);
    } catch (error: unknown) {
      setErrorMessage(apiErrorMessage(error, "Failed to fetch rooms"));
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, clearError, setRooms, setErrorMessage]);

  const joinRoom = useCallback(
    async (roomId: string | number) => {
      if (!token) {
        setErrorMessage("No token available");
        return false;
      }

      try {
        const response = await api.post<{ room: Room }>(`/api/room/join/${roomId}`);
        if (response.data.room) {
          setCurrentRoom(response.data.room);
        }
        return true;
      } catch (error: unknown) {
        setErrorMessage(apiErrorMessage(error, "Failed to join room"));
        return false;
      }
    },
    [token, setErrorMessage, setCurrentRoom]
  );

  const createRoom = useCallback(
    async (roomData: { name: string; description?: string }) => {
      if (!token) {
        setErrorMessage("No token available");
        return false;
      }

      try {
        const response = await api.post<{ room: Room }>("/api/room", roomData);
        if (response.data.room) {
          setRooms([...RoomStore.getState().rooms, response.data.room]);
        }
        return true;
      } catch (error: unknown) {
        setErrorMessage(apiErrorMessage(error, "Failed to create room"));
        return false;
      }
    },
    [token, setErrorMessage, setRooms]
  );

  return {
    rooms,
    isLoading,
    isError,
    errorMessage,
    fetchRooms,
    joinRoom,
    createRoom,
    clearError,
  };
};
