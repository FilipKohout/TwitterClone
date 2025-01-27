import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/lib/auth";
import { validateImages } from "@/app/lib/utils";
import { put } from "@vercel/blob";
import { getPostById } from "@/app/lib/database/posts";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    const userId = await validateToken(request.cookies.get("token")?.value || "") || 0;

    if (!userId)
        return NextResponse.json({ error: "Not authorized"}, { status: 403 });

    const validatedImages = validateImages([image])?.[0];

    if (!validatedImages)
        return NextResponse.json({ error: "Invalid image"}, { status: 400 });

    const blob = await put(`profiles/${userId}`, image, {
        access: 'public',
    });

    return NextResponse.json({ profileURL: blob.url });
}