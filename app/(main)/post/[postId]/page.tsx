import React from "react";
import Post from "@/app/components/posts/Post";
import { PostSuspense } from "@/app/components/posts/PostSuspense";
import CreatePost from "@/app/components/posts/CreatePost";
import PostsSuspense from "@/app/components/posts/PostsSuspense";
import { PostsFilter } from "@/app/lib/database/posts";

export default async function PostPage({ params }: { params: { postId: string } }) {
    const { postId } = await params;

    const filter: PostsFilter = { parentPostId: parseInt(postId) };

    return (
        <div className="flex flex-col content-center items-center w-main">
            <div className="flex flex-col gap-2 pt-2 w-main">
                <PostSuspense postId={parseInt(postId)} respondingEnabled={false} />
                <CreatePost templateText="Respond" filter={filter} />
            </div>
            <PostsSuspense filter={filter} isReplies />
        </div>
    );
}