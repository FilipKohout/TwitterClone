import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsAction } from "@/app/actions/posts";
import { Post, PostsFilter } from "@/app/lib/database/posts";
import { defaultQueryStaleTime } from "@/app/lib/consts";
import { getKeyFromPostFilter } from "@/app/lib/utils";

export interface PostsQuery {
    nextCursor?: number;
    posts: Post[];
}

export default function usePosts({ filter = {} }: { filter?: PostsFilter }) {
    const key = getKeyFromPostFilter(filter);

    const { data, isError, isLoading, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery<PostsQuery>({
        queryKey: [key], // @ts-ignore
        queryFn: ({ pageParam = 1 }: { pageParam?: number }) => new Promise((resolve, reject) => {
            getPostsAction(pageParam, filter)
                .then(result => {
                    if (!result.success || !result.posts || !result.currentPage)
                        reject(result.error || "Failed to fetch posts");

                    const nextCursor = result.hasNextPage ? (result.currentPage as number) + 1 : undefined;

                    resolve({ posts: result.posts || [], nextCursor });
                })
                .catch(reject);
        }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: 1,
        staleTime: defaultQueryStaleTime,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        keepPreviousData: true,
    });

    return { data, isError, isLoading, isFetching, fetchNextPage, hasNextPage };
}