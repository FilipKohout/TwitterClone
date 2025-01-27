"use server";

import { cookies } from "next/headers";
import { validateToken } from "@/app/lib/auth";
import { SimpleResponse } from "@/app/lib/definitions";
import { getNotifications, Notification } from "@/app/lib/database/notifications";
import { getUserInfoAction } from "@/app/actions/users";
import { getPostById, Post } from "@/app/lib/database/posts";
import { getPostImages, getUserProfile } from "@/app/lib/utils";

export interface NotificationsResponse extends SimpleResponse {
    notifications?: Notification[];
}

export async function getNotificationsAction(): Promise<NotificationsResponse> {
    const cookieStore = await cookies();
    const userId = await validateToken(cookieStore.get("token")?.value || "");

    if (!userId)
        return { success: false, error: "Please login first" };

    const result = await getNotifications(userId);

    for (const notification of result) {
        if (notification.source_user_id) {
            const response = await getUserInfoAction(notification.source_user_id);

            if (!response.success || !response.userInfo)
                continue;

            notification.source_user = response.userInfo;
        }

        if (notification.data) {
            let post: Post | null = null;

            if (notification.type === "like")
                post = await getPostById(userId, parseInt(notification.data));
            else if (notification.type === "reply") {
                const data = JSON.parse(notification.data);
                post = await getPostById(userId, data.postId);
            }

            if (!post)
                continue;

            post.image_urls = await getPostImages(post.id);
            post.profile_url = await getUserProfile(post.poster_id);

            notification.post = post;
        }
    }

    return { success: true, notifications: result };
}