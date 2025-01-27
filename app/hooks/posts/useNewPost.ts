import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post, PostsFilter } from "@/app/lib/database/posts";
import { createPostAction } from "@/app/actions/posts";
import { PostsQuery } from "@/app/hooks/posts/usePosts";
import { getProfileURLAction } from "@/app/actions/users";
import { getKeyFromPostFilter } from "@/app/lib/utils";

export default function useNewPost({ onPostingSuccess, filter = {} }: { onPostingSuccess?: () => void, filter?: PostsFilter }) {
    const queryClient = useQueryClient();
    const key = getKeyFromPostFilter(filter);

    const uploadImages = async (images: File[], postId?: number) => {
        const formData = new FormData();
        formData.append("postId", postId?.toString() || "0");
        images.forEach(image => formData.append("image", image));

        const response = await fetch("/api/posts/upload", {
            method: "POST",
            body: formData,
        })
        const data = await response.json();

        return data?.imageURLs;
    }

    const { mutate: post, isPending: isPostingPending, isError: isPostingError } = useMutation({
        mutationFn: ({ content, images }: { content: string, images: File[] }) => new Promise<Post>((resolve, reject) => {
            createPostAction(content, filter.parentPostId)
                .then(async result => {
                    if (!result.success || !result.post)
                        reject(result.error);

                    const urls = await uploadImages(images, result.post?.id);
                    resolve({...result.post, image_urls: urls} as Post);
                })
                .catch(reject);
        }),
        onSuccess: async (newPost: Post) => {
            onPostingSuccess && onPostingSuccess();

            newPost.is_new = true;
            newPost.profile_url = await getProfileURLAction(newPost.poster_id);

            queryClient.setQueryData([key], (oldPosts?: { pages: PostsQuery[] }) => {
                let posts = structuredClone(oldPosts);

                posts?.pages?.flatMap((page: PostsQuery) => page.posts).forEach(post => post.is_new = false);

                const pages = posts?.pages;

                if (pages)
                    pages[0].posts = [newPost, ...pages[0].posts];

                return posts || { pages: [{ posts: [newPost] }] };
            });
        }
    });

    return { post, isPostingPending, isPostingError };
}