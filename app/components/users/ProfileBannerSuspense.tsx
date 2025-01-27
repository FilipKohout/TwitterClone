"use server";

import { getUserInfoAction } from "@/app/actions/users";
import { Suspense } from "react";
import ProfileBannerSkeleton from "@/app/components/users/ProfileBannerSkeleton";
import ProfileBanner from "@/app/components/users/ProfileBanner";

async function ProfileBannerServer({ userId }: { userId: number }) {
    const response = await getUserInfoAction(userId);
    const { userInfo } = response;

    return (
        <ProfileBanner userInfo={userInfo} />
    );
}

export default async function ProfileBannerSuspense({ userId }: { userId: number }) {
    return (
        <Suspense fallback={<ProfileBannerSkeleton />}>
            <ProfileBannerServer userId={userId} />
        </Suspense>
    );
}
