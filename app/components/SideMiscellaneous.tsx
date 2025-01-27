"use client";

import UserProfileList from "@/app/components/users/UserProfileList";
import { useCookies } from "next-client-cookies";
import NotificationsList from "@/app/components/notifications/NotificationsList";

export default function SideMiscellaneous() {
    const cookies = useCookies();
    const userId = cookies.get("userId");

    return (
        <div className="container w-96 sticky h-full top-14 gap-2">
            {userId &&
                <>
                    <div className="frame">
                        <h1 className="w-full text-center text-2xl">You Might Know</h1>
                        <UserProfileList source="recommendations" limit={3} userId={parseInt(userId)}/>
                    </div>
                    <div className="frame">
                        <h1 className="w-full text-center text-2xl">Recent Activity</h1>
                        <NotificationsList limit={4} isPreview dark />
                    </div>
                </>
            }
        </div>
    );
}