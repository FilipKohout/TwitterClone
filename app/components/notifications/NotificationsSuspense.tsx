"use server";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostsSkeleton from "@/app/components/posts/PostsSkeleton";
import React, { Suspense } from "react";
import { defaultQueryStaleTime, postsQueryPageSize } from "@/app/lib/consts";
import { getServerQueryClient } from "@/app/lib/queryClient";
import { getNotificationsAction } from "@/app/actions/notifications";
import NotificationsList from "@/app/components/notifications/NotificationsList";

async function ServerSideNotifications({}) {
    const queryClient = getServerQueryClient();

    await queryClient.prefetchQuery({
        queryKey: ["notifications"],
        queryFn: () => new Promise((resolve, reject) => {
            getNotificationsAction()
                .then(result => {
                    if (!result.success || !result.notifications)
                        reject(result.error || "Failed to fetch notifications");

                    resolve(result.notifications || []);
                })
                .catch(reject);
        }),
        staleTime: defaultQueryStaleTime,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NotificationsList />
        </HydrationBoundary>
    );
}

export default async function NotificationsSuspense({}) {
    return (
        <Suspense fallback={<div className="flex flex-col gap-2 pt-2 w-main" ><PostsSkeleton posts={postsQueryPageSize} /></div>}>
            <ServerSideNotifications />
        </Suspense>
    );
}