"use client"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import AuthStore from "../../Zustand/AuthStore"
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";



export default function RoomPage(){
    const [isConnected,setIsConnected]=useState(false)
    const [members,setMembers]=useState<any[]>([])
    const [roomDetails,setRoomDetails]=useState<any>()

    const {token}=AuthStore()
    const {roomId}=useParams()
    useEffect(()=>{
        console.log(roomId)
        getRoomDetails();
        const newsocket=(io("http://localhost:8080",{
            auth:{
                token:token
            }
        }))
        newsocket.on("connect",()=>{
            console.log("connected to server");
            setIsConnected(true)
            newsocket.emit("join:Room",Number(roomId))
        })
        newsocket.on("disconnect",()=>{
            console.log("disconnected from server")
            setIsConnected(false)
        })
        newsocket.on("error",(err)=>{
            console.log("error",err)
        })
        newsocket.on("message",(roomId,userId)=>{
            console.log(`user ${userId} joined room ${roomId}`)
            newsocket.emit("message",roomId)
        })
        newsocket.on("user:joined",(roomId,userId)=>{
            console.log(`user ${userId} joined room ${roomId}`)
            setMembers((prev:any)=>[...prev,userId])
        })

        
       
       
    },[roomId,token])

    async function getRoomDetails(){
        try{
            const response=await axios.get(`http://localhost:3001/api/room/${roomId}/details`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            setMembers(response.data.members)
            setRoomDetails(response.data.room)
        }catch(err:any){
            console.log(err)
        }
    }
    const [canvas,setCanvas]=useState<any[]>();
    return(
        <div>
            <h1>Room {roomId}</h1>
           <div>
            <canvas id="canvas" width={1000} height={1000}></canvas>
            {isConnected?<p>Connected to server</p>:<p>Disconnected from server</p>}
            <h2>Members</h2>
            <div>
                {members.map((member)=>(
                    <div key={member.id} className="p-2 border-b">
                        <div><strong>Name:</strong> {member.name} {member.lastName ? member.lastName : ""}</div>
                        <div><strong>Email:</strong> {member.email}</div>
                        <div><strong>Joined:</strong> {new Date(member.createdAt).toLocaleString()}</div>
                    </div>
                ))}
            </div>
           </div>   

        
            <div>
                {members.map((member, idx) => (
                    <div 
                        key={member.id ?? member.email ?? idx} 
                        className="p-2 border-b"
                    >
                        <div><strong>Name:</strong> {member.name} {member.lastName ? member.lastName : ""}</div>
                        <div><strong>Email:</strong> {member.email}</div>
                        <div><strong>Joined:</strong> {member.createdAt ? new Date(member.createdAt).toLocaleString() : "Unknown"}</div>
                    </div>
                ))}
            </div>

        </div>
    )
}