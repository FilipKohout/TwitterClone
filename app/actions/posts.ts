"use server";

import {
    createPost,
    getPostById,
    getPosts, likePost,
    Post, PostsFilter,
    removePost
} from "../lib/database/posts";
import { validateToken } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { Paginator, SimpleResponse } from "@/app/lib/definitions";
import { postsQueryPageSize } from "@/app/lib/consts";
import { getPostImages, getUserProfile } from "@/app/lib/utils";
import { createNotification } from "@/app/lib/database/notifications";

export interface CreatePostResponse extends SimpleResponse {
    post?: Post;
    imageURLs?: string[];
}

export interface PostsResponse extends SimpleResponse {
    posts?: Post[];
    currentPage?: number;
    hasNextPage?: boolean;
}

export async function createPostAction(content: string, parentPostId?: number): Promise<CreatePostResponse> {
    const cookieStore = await cookies();
    const userId = await validateToken(cookieStore.get("token")?.value || "");

    if (!userId)
        return { success: false, error: "Please login first" };

    let parentPost: Post | null = null;

    if (parentPostId) {
        parentPost = await getPostById(userId, parentPostId);

        if (!parentPost)
            return { success: false, error: "Parent post doesn't exist" };
    }

    const result = await createPost(userId, content, parentPostId);

    if (!result)
        return { success: false, error: "Posting failed" };

    if (parentPost && parentPost.poster_id !== userId)
        await createNotification(parentPost.poster_id, "reply", userId, JSON.stringify({ postId: result.id, parentPostId: parentPost.id }));

    return { success: true, post: result };
}

export async function getPostsAction(page: number, filter: PostsFilter): Promise<PostsResponse> {
    const cookieStore = await cookies();
    const userId = await validateToken(cookieStore.get("token")?.value || "") || 0;
    const paginator = new Paginator(postsQueryPageSize, page);
    let result = await getPosts(userId, paginator, filter);

    const hasNextPage = result.length === postsQueryPageSize + 1;
    if (hasNextPage)
        result.pop();

    for (const post of result) {
        post.profile_url = await getUserProfile(post.poster_id);
        post.image_urls = await getPostImages(post.id);
    }

    return { success: true, posts: result, currentPage: paginator.currentPage, hasNextPage };
}

export async function removePostAction(postId: number): Promise<SimpleResponse> {
    const cookieStore = await cookies();
    const userId = await validateToken(cookieStore.get("token")?.value || "");

    if (!userId)
        return { success: false, error: "Please login first" };

    const post = await getPostById(userId, postId);

    if (!post)
        return { success: false, error: "Post doesn't exist" };

    if (userId !== post.poster_id)
        return { success: false, error: "You are not the author of this post" };

    const result = await removePost(postId);

    return { success: result, error: !result ? "Removing failed" : undefined };
}

export async function likePostAction(postId: number): Promise<SimpleResponse> {
    const cookieStore = await cookies();
    const userId = await validateToken(cookieStore.get("token")?.value || "");

    if (!userId)
        return { success: false, error: "Please login first" };

    const post = await getPostById(userId, postId);

    if (!post)
        return { success: false, error: "Post doesn't exist" };

    await likePost(userId, postId);
    await createNotification(post.poster_id, "like", userId, post.id.toString());

    return { success: true };
}