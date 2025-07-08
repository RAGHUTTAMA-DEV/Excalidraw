"use client";
import AuthStore from "../Zustand/AuthStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function User(){
    const {user,token}=AuthStore();
    const router=useRouter();
    return(
        <div>
            <h1>User</h1>
            <p>{token}</p> 
            <button onClick={()=>toast.success("THis is good")}>
                Clik
            </button>
            <p>{JSON.stringify(user)}</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        {/* @ts-ignore */}
        <p>User Name: {user?.name ?? "No name available"}</p>

        <button onClick={()=>{
           router.push("/room")
        }}>Room</button>

           
        </div>
    )
}