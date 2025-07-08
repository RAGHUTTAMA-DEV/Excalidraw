"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import axios from "axios"
import AuthStore from "../../Zustand/AuthStore"

export default function RoomPage(){
    const {token}=AuthStore()
    const params=useParams()
    const [canvas,setCanvas]=useState<any[]>([])
    useEffect(()=>{ 
        const fetchCanvas=async ()=>{
            try{
                const response=await axios.get(`http://localhost:3001/api/room/canvas/${params.roomId}`,{
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                })
                setCanvas(response.data.canvasState)
            }catch(err:any){
                console.log(err)
                toast.error("Failed to fetch canvas")
            }
        }
        fetchCanvas()
    },[params.roomId])
    return(
        <div>
            <h1>Room {params.roomId}</h1>
           <div>

            

            </canvas>
           </div>   

            

        </div>
    )
}