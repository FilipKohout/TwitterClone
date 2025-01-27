import styles from "@/app/styles/modals.module.css";
import UserProfileListItem from "@/app/components/users/UserProfileListItem";
import useUsers, { UsersQuery } from "@/app/hooks/users/useUsers";
import { useMemo } from "react";
import { usersQueryPageSize } from "@/app/lib/consts";
import { getUsersAction, UsersFilter } from "@/app/actions/users";
import UserProfileListItemSkeleton from "@/app/components/users/UserProfileListItemSkeleton";

export default function UserProfileList({ source, userId, limit }: { source: UsersFilter, userId: number, limit?: number }) {
    const { data, isError, isLoading, isFetching, fetchNextPage, hasNextPage } = useUsers({
        sourceFunction: (pageParam: number) => getUsersAction(pageParam, userId, source),
        identificator: userId + source
    });
    const pagelessPosts = useMemo(
        () => (data?.pages as UsersQuery[])?.flatMap((page: UsersQuery) => page.users),
        [data?.pages]
    );

    return (
        <div className="flex flex-col gap-1">
            {pagelessPosts &&
                (
                    pagelessPosts.length > 0
                        ? pagelessPosts.slice(0, limit || undefined).map(userInfo => <UserProfileListItem userInfo={userInfo}/>)
                        : <p className="w-full text-center">No users</p>
                )
            }

            {isError && <p className="w-full text-center">Error fetching users</p>}

            {(isFetching || isLoading) && <UserProfileListItemSkeleton users={limit || usersQueryPageSize} />}

            {!isLoading && !isError && hasNextPage && !isFetching && <button className="mr-auto ml-auto" onClick={() => { void fetchNextPage() }}>Load more</button>}

            {!isLoading && !isError && !hasNextPage && !isFetching && pagelessPosts?.length > usersQueryPageSize && <p className="w-full text-center">No more users</p>}
        </div>
    );
}