"use client";

import AuthStore from "./AuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import React from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, token, isSuccess } = AuthStore();
    // Add <Toaster /> inside the returned JSX so toast notifications work correctly


    useEffect(() => {
        if (!user || !token || !isSuccess) {
            router.push("/login");
            toast("This is not a valid user, please login again")
        }
    }, [user, token, isSuccess, router]);
    <Toaster />


    return (
        <>
            <Toaster position="top-right" />
            {children}
        </>
    ); 
}
