import { maxImages, maxImageSize } from "@/app/lib/consts";
import { list } from "@vercel/blob";
import { UserInfo } from "@/app/actions/users";
import { User } from "@/app/lib/database/users";
import { PostsFilter } from "@/app/lib/database/posts";

export function validateImages(images: File[]): File[] {
    let newImages = structuredClone(images);

    newImages = newImages.filter(image => image.size <= maxImageSize);
    newImages = newImages.slice(0, maxImages);

    return newImages;
}

export async function getPostImages(postId: number): Promise<string[]> {
    const blob = await list({
        limit: maxImages,
        prefix: `posts/${postId}`
    });

    return blob.blobs.map(blob => blob.url);
}

export async function getUserProfile(userId: number): Promise<string | undefined> {
    const blob = await list({
        limit: 1,
        prefix: `profiles/${userId}`
    });

    return blob.blobs[0]?.url;
}

export function userToUserInfo(user: User, additional?: object): UserInfo {
    return {
        id: user.id,
        name: user.name,
        followers_count: user.followers_count,
        following_count: user.following_count,
        is_followed: user.is_followed,
        bio: user.bio,
        ...additional
    };
}

export function getKeyFromPostFilter(filter: PostsFilter): string {
    return `postsU${filter.posterId || ""}P${filter.parentPostId || ""}Q${filter.query || ""}A${filter.useAlgorithm || ""}F${filter.fromFollwing || ""}`;
}