"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthStore from "../context/AuthStore";
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const {setUser,setToken,setIsLoading,setIsError,setIsSuccess}=AuthStore();
  const LoginCall =async () => {
    try{
        const response=await axios.post("http://localhost:3001/api/auth/login",{email,password});
        console.log(response.data);
        
        if(response.status===200){
            setUser(response.data.user);
            setToken(response.data.token);
            setIsLoading(false);
            setIsError(false);
            setIsSuccess(true);
            router.push("/user");
        }
        else{
            alert("Invalid username or password");
        }
                
    }catch(error){
        console.log(error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
      <button onClick={() => {
        LoginCall();
      }}>Login</button>
    </div>
  );
}