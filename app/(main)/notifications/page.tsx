import React from "react";
import NotificationsSuspense from "@/app/components/notifications/NotificationsSuspense";

export default async function NotificationsPage(){
    return (
        <div className="flex flex-col content-center items-center w-main">
            <NotificationsSuspense />
        </div>
    );
}