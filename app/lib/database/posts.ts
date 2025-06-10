import { QueryResult, sql } from "@vercel/postgres";
import { Paginator } from "@/app/lib/definitions";

export interface Post {
    id: number;
    content: string;
    poster_id: number;
    user_name: string;
    timestamp: string;
    replies_count: number;
    likes_count: number;
    is_liked: boolean;
    parent_post_id?: number;

    // This is not in the database, but is used in the frontend
    profile_url?: string;
    image_urls?: string[];
    is_new?: boolean;
}

export interface PostsFilter {
    posterId?: number;
    parentPostId?: number;
    query?: string;
    useAlgorithm?: boolean;
    fromFollwing?: boolean;
}

export async function createPost(userId: number, content: string, parentPostId?: number): Promise<Post> {
    const result: QueryResult<{ post_id: number }> = await sql`
        INSERT INTO posts (poster_id, post_content, parent_post_id)         
        VALUES (${userId}, ${content}, ${parentPostId || null}) 
        RETURNING post_id
    `;

    if (result.rowCount === 0)
        throw new Error("Posting failed");

    const post = await getPostById(userId, result.rows[0].post_id)

    if (!post)
        throw new Error("Posting failed");

    return post;
}

export async function getPosts(userId: number, paginator: Paginator, filter: PostsFilter): Promise<Post[]> {
    const query = filter.query || "";
    const searchQuery = query
        .split(/\s+/)
        .map(word => `${word}:*`)
        .join(' & ');

    const result: QueryResult<Post> = await sql`
       SELECT *,
            EXISTS (
                SELECT 1
                FROM post_likes
                WHERE post_likes.post_id = post_details.id AND post_likes.user_id = ${userId}
            ) AS is_liked,
            CASE 
                WHEN ${query} = '' THEN 0
                ELSE ts_rank(to_tsvector(content), to_tsquery(${searchQuery})) + ts_rank(to_tsvector(user_name), to_tsquery(${searchQuery}))
            END AS relevance
        FROM post_details
        LEFT JOIN follows AS f ON f.followee_id = post_details.poster_id AND f.follower_id = ${userId}
        WHERE 
            (poster_id = ${filter.posterId || 0}::int OR ${filter.posterId || ""} LIKE '') AND
            (parent_post_id = ${filter.parentPostId || 0}::int OR (${filter.parentPostId || ""} LIKE '' AND parent_post_id IS NULL)) AND
            (
                (to_tsvector(content) @@ to_tsquery(${searchQuery}) OR ${query} = '') OR
                (to_tsvector(user_name) @@ to_tsquery(${searchQuery}) OR ${query} = '') OR
                (content ILIKE ${'%' + query + '%'} OR user_name ILIKE ${'%' + query + '%'} OR ${query} = '')
            )
        ORDER BY 
            relevance DESC, 
            CASE
                WHEN ${filter.fromFollwing} THEN 
                    CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END -- Prioritize followed users
                ELSE 0
            END DESC,
            CASE
                WHEN ${filter.useAlgorithm} THEN CAST(likes_count AS text) -- Prioritize likes
                ELSE CAST(timestamp AS text) 
            END DESC
        LIMIT ${paginator.limit} OFFSET ${paginator.offset};
    `;

    return result.rows;
}

export async function removePost(postId: number): Promise<boolean> {
    await sql`
        DELETE FROM post_likes
        WHERE post_id IN (
            SELECT post_id
            FROM posts
            WHERE parent_post_id = ${postId}
        );
    `;

    await sql`
        DELETE FROM post_likes
        WHERE post_id = ${postId};
    `;

    await sql`
        DELETE FROM posts
        WHERE parent_post_id = ${postId};
    `;

    const result: QueryResult<Post> = await sql`
        DELETE FROM posts
        WHERE post_id = ${postId}
    `;

    return result.rowCount ? result.rowCount > 0 : false;
}

export async function getPostById(userId: number, id: number): Promise<Post | null> {
    const result: QueryResult<Post> = await sql`
        SELECT *,
            EXISTS (
                SELECT 1
                FROM post_likes
                WHERE post_likes.post_id = post_details.id AND post_likes.user_id = ${userId}
            ) AS is_liked
        FROM post_details
        WHERE id = ${id};
    `;

    if (result.rowCount === 0)
        return null;

    return result.rows[0];
}

export async function likePost(userId: number, postId: number): Promise<boolean> {
    const result: QueryResult = await sql`
        INSERT INTO post_likes (post_id, user_id)
        VALUES (${postId}, ${userId})
        ON CONFLICT DO NOTHING;
    `;

    if (result.rowCount === 0) {
        await sql`
            DELETE FROM post_likes
            WHERE post_id = ${postId} AND user_id = ${userId};
        `;

        return false;
    }
    else
        return true;
}
