import React from "react";
import PostsSuspense from "@/app/components/posts/PostsSuspense";
import ProfileBannerSuspense from "@/app/components/users/ProfileBannerSuspense";
import ProfileBanner from "@/app/components/users/ProfileBanner";
import PostsList from "@/app/components/posts/PostsList";

export default async function ProfilePage({ params }: { params: { userId: string } }) {
    const { userId } = await params;

    return (
        <div className="flex flex-col content-center items-center">
            <div className="w-main mr-auto ml-auto">
                <ProfileBannerSuspense userId={parseInt(userId)}/>
                <h2 className="text-2xl font-bold text-left w-full mt-2">Latest</h2>
            </div>
            <PostsList filter={{ posterId: parseInt(userId) }}/>
        </div>
    );
}