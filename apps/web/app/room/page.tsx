"use client"
import { useEffect, useState } from "react";
import axios from "axios"
import AuthStore from "../context/AuthStore"
import { useRouter } from "next/navigation"

export default function RoomPage(){
    const {token}=AuthStore()
    const [rooms,setRooms]=useState([])
    const router=useRouter()
    useEffect(()=>{
        const fetchRooms=async()=>{
            try{
                const response=await axios.get("http://localhost:3001/api/room")
                const data=response.data
                setRooms(data.rooms)

            }catch(error){
                console.error("Error fetching rooms:",error)
            }
        }
        fetchRooms()
    },[])

    const handleJoinRoom=async (roomId:string)=>{
        try{
            const response=await axios.post(`http://localhost:3001/api/room/join/${roomId}`, {}, {
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                }
            })
            const data=response.data
            console.log(data)
            router.push(`/room/${roomId}`)
        }catch(error){
            console.error("Error joining room:",error)
        }
    }

    return(
        <div>
            Room Page

            <div>
                <div>
                    All the rooms
                    {rooms.map((room:any)=>(
                        <div key={room.id}>
                            {room.name}
                            <button onClick={()=>handleJoinRoom(room.id)}>Join Room</button>
                        </div>
                    ))}
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}