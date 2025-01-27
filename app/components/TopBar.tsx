import React from "react";

export function TopBar({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="top-0 h-12 acrylic flex w-screen p-1 fixed topBar z-50">
                <h1 className="text-3xl p-1">Test</h1>
            </div>
            <div className="mt-14 min-h-full">
                {children}
            </div>
        </>
    )
}