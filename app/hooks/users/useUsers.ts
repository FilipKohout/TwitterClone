import { useInfiniteQuery } from "@tanstack/react-query";
import { defaultQueryStaleTime } from "@/app/lib/consts";
import { UserInfo, UserListResponse } from "@/app/actions/users";

export interface UsersQuery {
    nextCursor?: number;
    users: UserInfo[];
}

export default function useUsers({ sourceFunction, identificator }: { sourceFunction: (pageParam: number) => Promise<UserListResponse>, identificator: string | number }) {
    const key = `usersI${identificator}`;

    const { data, isError, isLoading, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery<UsersQuery>({
        queryKey: [key],
        // @ts-expect-error Types don't match, but this is the correct usage
        queryFn: ({ pageParam = 1 }: { pageParam?: number }) => new Promise((resolve, reject) => {
            sourceFunction(pageParam)
                .then(result => {
                    if (!result.success || !result.users || !result.currentPage)
                        reject(result.error || "Failed to fetch users");

                    const nextCursor = result.hasNextPage ? (result.currentPage as number) + 1 : undefined;

                    resolve({ users: result.users || [], nextCursor });
                })
                .catch(reject);
        }),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: 1,
        staleTime: defaultQueryStaleTime,
    });

    return { data, isError, isLoading, isFetching, fetchNextPage, hasNextPage };
}