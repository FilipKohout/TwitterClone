"use server";

import { QueryResult, sql } from "@vercel/postgres";
import { maxNotifications } from "@/app/lib/consts";
import { UserInfo } from "@/app/actions/users";
import { Post } from "@/app/lib/database/posts";

export type NotificationType = "follow" | "like" | "reply" | "mention" | "warning";

export interface Notification {
    id: number;
    user_id: number;
    type: NotificationType;
    timestamp: string;
    data?: string;
    source_user_id?: number;
    source_user?: UserInfo;
    post?: Post;
}

export async function createNotification(userId: number, type: NotificationType, sourceUserId?: number, data?: string): Promise<Notification> {
    const result: QueryResult = await sql`
        INSERT INTO notifications (user_id, notification_type, source_user_id, notification_data)
        VALUES (${userId}, ${type}, ${sourceUserId}, ${data})
        ON CONFLICT DO NOTHING
        RETURNING *;
    `;

    return result.rows[0];
}

export async function getNotifications(userId: number): Promise<Notification[]> {
    const result: QueryResult<Notification> = await sql`
        SELECT notification_id AS "id", user_id as "user_id", notification_type AS "type", notification_timestamp AS "timestamp", notification_data AS "data", source_user_id as "source_user_id"
        FROM notifications
        WHERE user_id = ${userId} AND source_user_id != ${userId}
        ORDER BY timestamp DESC
        LIMIT ${maxNotifications};
    `;

    return result.rows;
}