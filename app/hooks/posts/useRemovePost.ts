import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostsFilter } from "@/app/lib/database/posts";
import { removePostAction } from "@/app/actions/posts";
import { useContext } from "react";
import { AlertsContext } from "@/app/providers/AlertsProvider";
import { PostsQuery } from "@/app/hooks/posts/usePosts";
import { getKeyFromPostFilter } from "@/app/lib/utils";

export default function useRemovePost({ filter = {} }: { filter?: PostsFilter }) {
    const { addAlert } = useContext(AlertsContext);
    const queryClient = useQueryClient();
    const key = getKeyFromPostFilter(filter);

    const { mutate: remove, isPending: isRemoving } = useMutation({
        mutationFn: ({ id }: { id: number }) => new Promise<number>((resolve, reject) => {
            removePostAction(id)
                .then(result => {
                    if (!result.success)
                        reject(result.error);

                    resolve(id);
                })
                .catch(reject);
        }),
        onSuccess: (id: number) => {
            queryClient.setQueryData([key], (oldPosts?: { pages: PostsQuery[] }) => {
                const posts = structuredClone(oldPosts);

                posts?.pages?.flatMap((page: PostsQuery) => page.posts).forEach(post => post.is_new = false);

                const pages = posts?.pages;

                if (pages)
                    pages.map(page => page.posts = page.posts.filter(post => post.id !== id));

                addAlert({ message: "Post deleted", severity: "success", timeout: 5 });
                return posts || { pages: [] };
            });
        },
        onError: (error: never) => {
            addAlert({ message: "Removal failed", severity: "error", timeout: 30 });
            console.error(error);
        }
    });

    return { remove, isRemoving };
}