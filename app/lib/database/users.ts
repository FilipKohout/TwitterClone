import { QueryResult, sql } from "@vercel/postgres";
import { Paginator } from "@/app/lib/definitions";

export interface User {
    id: number;
    name: string;
    email: string;
    bio: string;
    password: string;
    following_count: number;
    followers_count: number;
    is_followed?: boolean;
}

// AUTHENTICATION

export async function getUserByName(username: string): Promise<User | null> {
    const result: QueryResult<User> = await sql`
        SELECT *
        FROM user_details 
        WHERE name = ${username}
    `;

    if (result.rowCount === 0)
        return null;

    return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const result: QueryResult<User> = await sql`
        SELECT *
        FROM user_details 
        WHERE email = ${email}
    `;

    if (result.rowCount === 0)
        return null;

    return result.rows[0];
}

export async function createUser(username: string, email: string, password: string): Promise<User> {
    const result: QueryResult = await sql`
        INSERT INTO users (user_name, user_email, user_password) 
        VALUES (${username}, ${email}, ${password}) 
        RETURNING user_id 
    `;

    if (result.rowCount === 0)
        throw new Error("Registration failed");

    const user = await getUserById(result.rows[0].user_id);

    if (!user)
        throw new Error("Registration failed");

    return user;
}

// USER INFO

export async function getUserById(id: number, comparingUserId?: number): Promise<User | null> {
    const result: QueryResult<User> = await sql`
        SELECT *,
            EXISTS (
                SELECT 1
                FROM follows
                WHERE followee_id = ${id} AND follower_id = ${comparingUserId || 0}
            ) AS is_followed
        FROM user_details 
        WHERE id = ${id}
    `;

    if (result.rowCount === 0)
        return null;

    return result.rows[0];
}

export async function updateUser(id: number, username: string, email: string, bio: string): Promise<User | null> {
    const result: QueryResult = await sql`
        UPDATE users 
        SET user_name = ${username}, user_email = ${email}, user_bio = ${bio}
        WHERE user_id = ${id};
    `;

    if (result.rowCount === 0)
        throw new Error("Update failed");

    const user = await getUserById(id);

    if (!user)
        throw new Error("Update failed");

    return user;
}

export async function followUser(followerId: number, followeeId: number): Promise<boolean> {
    const result: QueryResult = await sql`
        INSERT INTO follows (follower_id, followee_id)
        VALUES (${followerId}, ${followeeId})
        ON CONFLICT DO NOTHING;
    `;

    if (result.rowCount === 0) {
        await sql`
            DELETE FROM follows
            WHERE followee_id = ${followeeId} AND follower_id = ${followerId};
        `;

        return false;
    }
    else
        return true;
}

export async function getFollowers(userId: number, paginator: Paginator): Promise<User[]> {
    const result: QueryResult<User> = await sql`
        SELECT *
        FROM user_details
        WHERE id IN (
            SELECT follower_id
            FROM follows
            WHERE followee_id = ${userId}
        )
        ORDER BY name
        LIMIT ${paginator.limit} OFFSET ${paginator.offset}
    `;

    return result.rows;
}

export async function getFollowing(userId: number, paginator: Paginator): Promise<User[]> {
    const result: QueryResult<User> = await sql`
        SELECT *
        FROM user_details
        WHERE id IN (
            SELECT followee_id
            FROM follows
            WHERE follower_id = ${userId}
        )
        ORDER BY name
        LIMIT ${paginator.limit} OFFSET ${paginator.offset}
    `;

    return result.rows;
}

export async function getYouMayKnow(userId: number, paginator: Paginator): Promise<User[]> {
    const result: QueryResult<User> = await sql`
        SELECT u.*, COUNT(f2.followee_id) AS mutual_followers
        FROM follows f1
        INNER JOIN follows f2 ON f1.followee_id = f2.follower_id
        INNER JOIN user_details u ON f2.followee_id = u.id
        WHERE f1.follower_id = ${userId}
            AND f2.followee_id != ${userId}
            AND f2.followee_id NOT IN (
                SELECT followee_id
                FROM follows
                WHERE follower_id = ${userId}
            )
        GROUP BY u.id, u.name, u.email, u.bio, u.followers_count, u.following_count, u.password
        ORDER BY mutual_followers DESC, u.name
        LIMIT ${paginator.limit} OFFSET ${paginator.offset};
    `;

    return result.rows;
}