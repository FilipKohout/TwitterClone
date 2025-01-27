"use client";

import Post from "@/app/components/posts/Post";
import usePosts, { PostsQuery } from "@/app/hooks/posts/usePosts";
import { useMemo } from "react";
import PostsSkeleton from "@/app/components/posts/PostsSkeleton";
import { postsQueryPageSize } from "@/app/lib/consts";
import { PostsFilter } from "@/app/lib/database/posts";

export interface postListProps {
    filter?: PostsFilter;
    isReplies?: boolean;
}

export default function PostsList({ filter = {}, isReplies = false }: postListProps) {
    const { data, isError, isLoading, hasNextPage, fetchNextPage, isFetching } = usePosts({ filter });
    const pagelessPosts = useMemo(() =>
        (data?.pages as PostsQuery[])?.flatMap((page: PostsQuery) => page.posts),
        [data?.pages]
    );

    return (
        <div className="flex flex-col gap-2 pt-2 w-main">
            {pagelessPosts &&
                 (
                     pagelessPosts.length > 0
                    ? pagelessPosts.map(post => <Post post={post} key={post.id} filter={filter} isReply={isReplies} />)
                    : <h1 className="w-main text-center">No Posts Yet</h1>
                )
            }

            {isError && <p className="w-main text-center">Error fetching posts</p>}

            {(isFetching || isLoading) && <PostsSkeleton posts={postsQueryPageSize} />}

            {!isLoading && !isError && hasNextPage && !isFetching && <button className="mr-auto ml-auto" onClick={() => { void fetchNextPage() }}>Load more</button>}

            {!isLoading && !isError && !hasNextPage && !isFetching && pagelessPosts?.length > postsQueryPageSize && <p className="w-main text-center">No more posts</p>}
        </div>
    );
}