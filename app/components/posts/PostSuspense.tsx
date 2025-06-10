import Post from "@/app/components/posts/Post";
import PostsSkeleton from "@/app/components/posts/PostsSkeleton";
import { Suspense } from "react";
import { getPostById } from "@/app/lib/database/posts";
import { cookies } from "next/headers";
import { validateToken } from "@/app/lib/auth";
import { getPostImages, getUserProfile } from "@/app/lib/utils";

type props = {
    postId: number,
    respondingEnabled?: boolean
}

async function ServerSidePost({ postId, respondingEnabled }: props) {
    const cookieStore = await cookies();
    const userId = await validateToken(cookieStore.get("token")?.value || "") || 0;
    const post = await getPostById(userId, postId);

    if (!post)
        return <p className="error">Post not found</p>;

    post.image_urls = await getPostImages(post.id);
    post.profile_url = await getUserProfile(post.poster_id);

    return (
        <div className="w-main">
            <Post post={post} respondingEnabled={respondingEnabled} />
        </div>
    );
}

export async function PostSuspense({ postId, respondingEnabled = true }: props) {
    return (
        <Suspense fallback={<PostsSkeleton posts={1} />}>
            <ServerSidePost postId={postId} respondingEnabled={respondingEnabled} />
        </Suspense>
    );
}