"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCookies } from "next-client-cookies";
import Logout from "@/app/components/auth/Logout";
import React from "react";

function Button({ href, title, icon }: { href: string, title: string, icon: string }) {
    const pathname = usePathname();

    const className = pathname == href ? "primaryColor font-bold" : "";

    return (
        <Link href={href} className={`button backgroundButton blankButton primarySelect borderSelect flex gap-1 ${pathname == href ? "selected" : ""}`}>
            <i className={`fi ${icon} ${className} mt-0.5 -mb-0.5 biggerIcon`} />
            <h2 className={`text-2xl font-light ml-3 ${className}`}>{title}</h2>
        </Link>
    );
}

export default function SideNav() {
    const cookies = useCookies();
    const userId = cookies.get("userId");
    
    return (
        <div className="container w-96 sticky h-full top-14">
            <div className="w-52 ml-auto flex flex-col gap-1">
                <Button href="/home" title="Home" icon="fi-sr-home" />
                <Button href="/discover" title="Discover" icon="fi-br-search" />
                <Button href="/notifications" title="Notifications" icon="fi-br-bell" />
                <Button href="/messages" title="Messages" icon="fi-br-messages" />
                <Button href={"/user/" + userId} title="Profile" icon="fi-sr-user" />
                <Logout />
            </div>
        </div>
    );
}