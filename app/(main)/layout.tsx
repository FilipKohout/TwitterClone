import SideNav from "@/app/components/SideNav";
import React from "react";
import SideMiscellaneous from "@/app/components/SideMiscellaneous";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex justify-center gap-4 min-h-96">
            <SideNav />
            <div className="h-full">
                {children}
            </div>
            <SideMiscellaneous />
        </div>
    )
}