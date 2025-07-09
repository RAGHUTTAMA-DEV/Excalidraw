"use client"
import { useEffect, useRef, useState } from "react";
import AuthStore from "../Zustand/AuthStore"
import { useRooms } from "../hooks/useRooms"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast";
type CreateRoomForm={
    name:string;
    description:string;
    canvasState?:any[];
}

export default function RoomPage(){
    const {token,user}=AuthStore()
    const router=useRouter()
    const nameRef=useRef<HTMLInputElement>(null)
    const descriptionRef=useRef<HTMLInputElement>(null)
    const canvasStateRef=useRef<HTMLInputElement>(null)
    const {
        rooms,
        isLoading,
        isError,
        errorMessage,
        fetchRooms,
        joinRoom,
        clearError
    }=useRooms()
    const [myRooms,setMyRooms]=useState([]) 
    const [err,setErr]=useState(false)
    // Use the global socket if needed

    const getMyRooms=async()=>{
        try{
            const response=await axios.get(`http://localhost:3001/api/room/my-rooms/${(user as any).id}`,{
                headers:{
                    Authorization: `Bearer ${token}`    
                }
            })
            setMyRooms(response.data.rooms)
        }catch(err){
            console.log(err)
        }
    }
    useEffect(()=>{
        if (!token) {
            router.push('/login')
            return
        }
        
        fetchRooms()
        getMyRooms()
    },[token, router, fetchRooms])

    const handleJoinRoom = async (roomId: string) => {
        try {
            await axios.post(
                `http://localhost:3001/api/room/join/${roomId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Joined room successfully!");
            getMyRooms(); // Refresh my rooms
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to join room");
        }
    };

    const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const form = e.currentTarget;
            const response = await axios.post("http://localhost:3001/api/room", {
                name: nameRef.current?.value,
                description: descriptionRef.current?.value,
                canvasState: JSON.parse(canvasStateRef.current?.value || "[]"),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
    
            console.log(response.data);
            toast.success("Room created successfully");
            if (response.status === 200) {
                setErr(false);
            }
        } catch (err: any) {
            console.log(err);
            setErr(true);
        }
    };
    

    return(
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Room Page</h1>

            <div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">All the rooms</h2>
                    {isLoading && <p>Loading rooms...</p>}
                    {isError && <p className="text-red-500">{errorMessage}</p>}
                    {!isLoading && !isError && rooms.length === 0 && <p>No rooms available</p>}
                    {!isLoading && !isError && rooms.map((room:any)=>(
                        <div key={room.id} className="border p-4 mb-4 rounded-lg">
                            <h3 className="font-medium">{room.name}</h3>
                            {room.description && <p className="text-gray-600 text-sm">{room.description}</p>}
                            <button 
                                onClick={()=>handleJoinRoom(room.id)}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Join Room
                            </button>
                        </div>
                    ))}

                    <div>
                        <h2 className="text-xl font-semibold mb-4">My Rooms</h2>
                        {isLoading && <p>Loading rooms...</p>}
                        {isError && <p className="text-red-500">{errorMessage}</p>}
                        {!isLoading && !isError && myRooms.length === 0 && <p>No rooms available</p>}
                        {!isLoading && !isError && myRooms.map((room:any)=>(
                            <div key={room.id} className="border p-4 mb-4 rounded-lg">
                                <h3 className="font-medium">{room.name}</h3>
                                <p className="text-gray-600 text-sm">{room.description}</p>
                                <button 
                                    onClick={()=>router.push(`/room/${room.id}`)}
                                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Go to Room Canvas
                                </button>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Create Room</h2>
                        <form onSubmit={handleCreateRoom}>
                            <input type="text" placeholder="Room Name" ref={nameRef} />
                            <input type="text" placeholder="Room Description" ref={descriptionRef} />
                            <button type="submit" className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Create Room</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}