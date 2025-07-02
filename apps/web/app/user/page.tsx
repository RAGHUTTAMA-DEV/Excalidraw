"use client";
import AuthStore from "../context/AuthStore";
import toast from "react-hot-toast";
export default function User(){
    const {user,token}=AuthStore();
    return(
        <div>
            <h1>User</h1>
            <p>{token}</p> 
            <button onClick={()=>toast.success("THis is good")}>
                Clik
            </button>
            <p>{JSON.stringify(user)}</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <p>User Name: {user?.name ?? "No name available"}</p>

           
        </div>
    )
}