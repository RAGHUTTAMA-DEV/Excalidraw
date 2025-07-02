"use client";
import AuthStore from "../context/AuthStore";

export default function User(){
    const {user,token}=AuthStore();
    return(
        <div>
            <h1>User</h1>
            <p>{token}</p> 
            <button onClick={()=>console.log(user)}>
                Clik
            </button>
            <p>{user?.name}</p>
           
        </div>
    )
}