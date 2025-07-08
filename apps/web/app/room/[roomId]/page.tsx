"use client"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import AuthStore from "../../Zustand/AuthStore"
import { useSocket } from "../../Zustand/SocketProvider";
import type { Socket } from "socket.io-client";


export default function RoomPage(){
    const {token}=AuthStore()
    const params=useParams()
    const [canvas,setCanvas]=useState<any[]>([])
    const socket = useSocket();
    useEffect(() => {
        if (socket && token) {
            const handleConnect = () => {
                if (params.roomId) {
                    socket.emit('join:Room', params.roomId);
                    socket.emit('joinroom', params.roomId);
                    console.log('Joining room', params.roomId);
                }
            };
            // Only set up handlers after socket is connected
            socket.on('connect', handleConnect);
            socket.on('user:joined', (roomId, userId) => {
                console.log(`User ${userId} joined room ${roomId}`);
            });
            socket.on('error', (msg) => {
                toast.error(msg);
            });
            // If already connected (e.g., after refresh), call handleConnect immediately
            if (socket.connected) {
                handleConnect();
            }
            return () => {
                socket.off('connect', handleConnect);
                socket.off('user:joined');
                socket.off('error');
            };
        }
    }, [socket, token, params.roomId]);
    return(
        <div>
            <h1>Room {params.roomId}</h1>
           <div>
            <canvas id="canvas" width={1000} height={1000}></canvas>
            
           
           </div>   

            

        </div>
    )
}