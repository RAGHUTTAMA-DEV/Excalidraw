import { io } from "socket.io-client"
import { Socket } from "socket.io-client"
let socket:Socket;
const connectSocket=(token: string)=>{
    if (!token) {
        throw new Error("No token found in localStorage");
    }
    socket=io("http://localhost:8080",{
        transports:["websocket"],
        reconnection:true,
        reconnectionAttempts:5,
        reconnectionDelay:1000,
        reconnectionDelayMax:5000,
        autoConnect:true,
        withCredentials:true,
        auth: {
            token: token
        }
    })
    socket.on("connect",()=>{
        console.log("Connected to server")
    })
    socket.on("disconnect",()=>{
        console.log("Disconnected from server")
    })
}

export const initSocket=(token: string):Socket=>{
    if(!socket){
        connectSocket(token)
    }
    return socket
}
