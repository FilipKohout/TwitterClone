"use client";

import { maxNotifications } from "@/app/lib/consts";
import useNotifications from "@/app/hooks/notifications/useNotifications";
import Notification from "@/app/components/notifications/Notification";
import NotificationsSkeleton from "@/app/components/notifications/NotificationsSkeleton";

export default function NotificationsList({ limit, isPreview, dark }: { limit?: number, isPreview?: boolean, dark?: boolean }) {
    const { data, isError, isLoading, isFetching } = useNotifications();

    return (
        <div className="flex flex-col gap-2 pt-2 w-full">
            {data &&
                (
                    data.length > 0
                        ? data.slice(0, limit || maxNotifications).map(notification => <Notification key={notification.id} isPreview={isPreview} notification={notification} dark={dark} />)
                        : <h2 className="w-full text-center">Nothing New Here</h2>
                )
            }

            {isError && <p className="w-full text-center">Error fetching notifications</p>}

            {(isFetching || isLoading) && <NotificationsSkeleton notifications={limit || Math.min(maxNotifications, 10)} dark={dark} />}
        </div>
    );
}