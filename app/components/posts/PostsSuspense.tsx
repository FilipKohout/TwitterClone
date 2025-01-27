"use server";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import PostsSkeleton from "@/app/components/posts/PostsSkeleton";
import PostsList, { postListProps } from "@/app/components/posts/PostsList";
import React, { Suspense } from "react";
import { postsQueryPageSize, defaultQueryStaleTime } from "@/app/lib/consts";
import { getPostsAction } from "@/app/actions/posts";
import { PostsQuery } from "@/app/hooks/posts/usePosts";
import { getKeyFromPostFilter } from "@/app/lib/utils";
import { getServerQueryClient } from "@/app/lib/queryClient";

async function ServerSidePosts({ filter = {}, isReplies = false }: postListProps) {
    const queryClient = getServerQueryClient();
    const key = getKeyFromPostFilter(filter);

    const fetch = ({ pageParam }: { pageParam: number }) =>
        new Promise<PostsQuery>((resolve, reject) => {
            getPostsAction(pageParam, filter)
                .then(result => {
                    if (!result.success || !result.posts || !result.currentPage)
                        reject(result.error || "Failed to fetch posts");

                    const nextCursor = result.hasNextPage ? (result.currentPage as number) + 1 : undefined;

                    resolve({ posts: result.posts || [], nextCursor });
                })
                .catch(reject);
        }
    );

    await queryClient.prefetchInfiniteQuery({
        queryKey: [key],
        queryFn: fetch,
        initialPageParam: 1,
        staleTime: defaultQueryStaleTime,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostsList filter={filter} isReplies={isReplies} />
        </HydrationBoundary>
    );
}

export default async function PostsSuspense({ filter = {}, isReplies = false }: postListProps) {
    return (
        <Suspense fallback={<div className="flex flex-col gap-2 p-2 min-w-96" ><PostsSkeleton posts={postsQueryPageSize} /></div>}>
            <ServerSidePosts filter={filter} isReplies={isReplies} />
        </Suspense>
    );
}