"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import AuthStore from "../../Zustand/AuthStore"
import { initSocket } from "../../lib/socket";
import type { Socket } from "socket.io-client";


export default function RoomPage(){
    const {token}=AuthStore()
    const params=useParams()
    const [canvas,setCanvas]=useState<any[]>([])
    useEffect(() => {
        let socket: Socket | undefined;
        if(!token){
           console.log("No token found")
        }
        else{
            socket = initSocket();
        }
        if (token) {
            socket = initSocket();
            const handleConnect = () => {
                if (params.roomId && socket) {
                    socket.emit('join:Room', params.roomId);
                    socket.emit('joinroom', params.roomId);
                    console.log('Joining room', params.roomId);
                }
            };
            if (socket) {
                socket.on('connect', handleConnect);
                socket.on('user:joined', (roomId, userId) => {
                    console.log(`User ${userId} joined room ${roomId}`);
                });
                socket.on('error', (msg) => {
                    toast.error(msg);
                });
            }

            return () => {
                if (socket) {
                    if (params.roomId) {
                        socket.emit('leave:Room', params.roomId);
                        console.log('Leaving room', params.roomId);
                    }
                    socket.off('connect', handleConnect);
                    socket.off('user:joined');
                    socket.off('error');
                }
            };
        }
    }, [params.roomId]);
    return(
        <div>
            <h1>Room {params.roomId}</h1>
           <div>
            <canvas id="canvas" width={1000} height={1000}></canvas>
            
           
           </div>   

            

        </div>
    )
}