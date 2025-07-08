import { useCallback } from 'react';
import axios from 'axios';
import RoomStore from '../Zustand/RoomStore';
import AuthStore from '../Zustand/AuthStore';

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
    setCurrentRoom
  } = RoomStore();

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const response = await axios.get("http://localhost:3001/api/room");
      const data = response.data;
      console.log("Rooms response:", data);
      setRooms(data.rooms || []);
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
      console.error("Error response:", error.response?.data);
      setErrorMessage("Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, clearError, setRooms, setErrorMessage]);

  const joinRoom = useCallback(async (roomId: string) => {
    if (!token) {
      setErrorMessage("No token available");
      return false;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/api/room/join/${roomId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const data = response.data;
      console.log("Joined room:", data);
      
      const updatedRoom = data.room;
      if (updatedRoom) {
        setCurrentRoom(updatedRoom);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error joining room:", error);
      if (error.response?.status === 401) {
        setErrorMessage("Token expired or invalid");
      } else {
        setErrorMessage("Failed to join room");
      }
      return false;
    }
  }, [token, setErrorMessage, setCurrentRoom]);

  const createRoom = useCallback(async (roomData: { name: string; description?: string }) => {
    if (!token) {
      setErrorMessage("No token available");
      return false;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/room",
        roomData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const data = response.data;
      console.log("Created room:", data);
      
      // Add the new room to the store
      if (data.room) {
        setRooms([...rooms, data.room]);
      }
      
      return true;
    } catch (error: any) {
      console.error("Error creating room:", error);
      setErrorMessage("Failed to create room");
      return false;
    }
  }, [token, setErrorMessage, setRooms, rooms]);

  return {
    rooms,
    isLoading,
    isError,
    errorMessage,
    fetchRooms,
    joinRoom,
    createRoom,
    clearError
  };
}; 