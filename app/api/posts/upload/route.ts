import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/lib/auth";
import { validateImages } from "@/app/lib/utils";
import { put } from "@vercel/blob";
import { getPostById } from "@/app/lib/database/posts";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const postId = Number(formData.get("postId"));
    const images = formData.getAll("image") as File[];

    const userId = await validateToken(request.cookies.get("token")?.value || "") || 0;
    const post = await getPostById(userId, postId);

    if (!post)
        return NextResponse.json({ error: "Post doesn't exist"}, { status: 404 });

    if (post.poster_id !== userId)
        return NextResponse.json({ error: "Not authorized"}, { status: 403 });

    const validatedImages = validateImages(images);

    const imageURLs = await Promise.all(validatedImages.map(async (image, index) => {
        const blob = await put(`posts/${postId}/${index}`, image, {
            access: 'public',
        });

        return blob.url;
    }));

    return NextResponse.json({ imageURLs });
}