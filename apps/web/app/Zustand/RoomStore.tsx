import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Room {
  id: number;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  Roomlen: number;
  MaxLen: number;
  canvasState?: any;
  createdAt: string;
  updatedAt: string;
  members?: any[];
}

interface RoomStoreInterface {
    // State
    rooms: Room[];
    currentRoom: Room | null;
    isLoading: boolean;
    isError: boolean;
    errorMessage: string;
    
    // Actions
    setRooms: (rooms: Room[]) => void;
    setCurrentRoom: (room: Room | null) => void;
    addRoom: (room: Room) => void;
    updateRoom: (roomId: number, updates: Partial<Room>) => void;
    removeRoom: (roomId: number) => void;
    setIsLoading: (loading: boolean) => void;
    setIsError: (error: boolean) => void;
    setErrorMessage: (message: string) => void;
    clearError: () => void;
    clearRooms: () => void;
}

const RoomStore = create<RoomStoreInterface>()(
    persist(
        (set, get) => ({
            rooms: [],
            currentRoom: null,
            isLoading: false,
            isError: false,
            errorMessage: "",

            setRooms: (rooms) => set({ rooms }),
            
            setCurrentRoom: (room) => set({ currentRoom: room }),
            
            addRoom: (room) => set((state) => ({
                rooms: [...state.rooms, room]
            })),
            
            updateRoom: (roomId, updates) => set((state) => ({
                rooms: state.rooms.map((room) =>
                    room.id === roomId ? { ...room, ...updates } : room
                ),
                currentRoom: state.currentRoom?.id === roomId 
                    ? { ...state.currentRoom, ...updates }
                    : state.currentRoom
            })),
            
            removeRoom: (roomId) => set((state) => ({
                rooms: state.rooms.filter((room) => room.id !== roomId),
                currentRoom: state.currentRoom?.id === roomId ? null : state.currentRoom
            })),
            
            setIsLoading: (isLoading) => set({ isLoading }),
            
            setIsError: (isError) => set({ isError }),
            
            setErrorMessage: (errorMessage) => set({ errorMessage, isError: true }),
            
            clearError: () => set({ isError: false, errorMessage: "" }),
            
            clearRooms: () => set({ rooms: [], currentRoom: null }),
        }),
        {
            name: "room-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentRoom: state.currentRoom,
                rooms: state.rooms,
            }),
        }
    )
)

export default RoomStore
