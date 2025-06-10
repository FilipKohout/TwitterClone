import React from "react";
import PostsSuspense from "@/app/components/posts/PostsSuspense";
import CreatePost from "@/app/components/posts/CreatePost";

export default async function HomePage() {
    return (
        <div className="flex flex-col content-center items-center w-main">
            <CreatePost />
            <PostsSuspense filter={{ fromFollwing: true }}/>
        </div>
    );
}