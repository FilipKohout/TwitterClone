"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "next-client-cookies";

export default function Logout() {
    const router = useRouter();
    const cookies = useCookies();

    const handleLogOut = () => {
        cookies.remove("token");
        cookies.remove("userId");
        router.push("/login");
    }

    return <button className="negativeButton" onClick={handleLogOut}>Log out</button>
}