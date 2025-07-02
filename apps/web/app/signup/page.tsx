"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthStore from "../context/AuthStore";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const router = useRouter();
    const {setUser,setToken,setIsLoading,setIsError,setIsSuccess}=AuthStore();

    const SignupCall=async()=>{
        try{
         const response=await axios.post("http://localhost:3001/api/auth/register",{email,password,name});
        console.log(response.data);
        if(response.status===200){
            setUser(response.data.user);
            setToken(response.data.token);
            setIsLoading(false);
            setIsError(false);
            setIsSuccess(true);
            router.push("/login");
        }
        else{
            alert("Invalid username or password");
        }
        }catch(err){
            console.log(err);
        }
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
            <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
            <button onClick={() => {
                SignupCall();
            }}>Signup</button>
        </div>
    );
}