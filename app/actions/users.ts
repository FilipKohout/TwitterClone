"use server";

import { Paginator, SimpleResponse } from "@/app/lib/definitions";
import {
    followUser,
    getFollowers, getFollowing,
    getUserByEmail,
    getUserById,
    getUserByName, getYouMayKnow,
    updateUser, User,
} from "@/app/lib/database/users";
import { validateToken } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { getUserProfile, userToUserInfo } from "@/app/lib/utils";
import { usersQueryPageSize } from "@/app/lib/consts";
import { createNotification } from "@/app/lib/database/notifications";

export interface UserInfo {
    id: number;
    name: string;
    bio: string;
    following_count: number;
    followers_count: number;
    is_followed?: boolean;
    profileURL?: string;
}

export interface PrivateUserInfo extends UserInfo {
    email: string;
}

export interface UserListResponse extends SimpleResponse {
    users?: UserInfo[];
    currentPage?: number;
    hasNextPage?: boolean;
}

interface UserInfoResponse extends SimpleResponse {
    userInfo?: UserInfo;
    privateUserInfo?: PrivateUserInfo;
}

export type UsersFilter = "followers" | "following" | "recommendations";

export async function getUserInfoAction(userId: number): Promise<UserInfoResponse> {
    const cookieStore = await cookies();
    const requesterUserId = await validateToken(cookieStore.get("token")?.value || "");
    const user = await getUserById(userId, requesterUserId || undefined);

    if (!user)
        return { success: false, error: "User doesn't exist" };

    const profileURL = await getUserProfile(userId);

    return { success: true, userInfo: userToUserInfo(user, { profileURL }) };
}

export async function getPrivateUserInfoAction(userId: number): Promise<UserInfoResponse> {
    const cookieStore = await cookies();
    const user = await getUserById(userId);
    const requesterUserId = await validateToken(cookieStore.get("token")?.value || "");

    if (!user)
        return { success: false, error: "User doesn't exist" };

    if (!requesterUserId || requesterUserId !== userId)
        return { success: false, error: "Not authorized" };

    const profileURL = await getUserProfile(userId);

    return { success: true, privateUserInfo: userToUserInfo(user, { profileURL, email: user.email }) as PrivateUserInfo };
}

export async function updatePrivateUserInfoAction(privateUserInfo: PrivateUserInfo): Promise<UserInfoResponse> {
    const cookieStore = await cookies();
    const requesterUserId = await validateToken(cookieStore.get("token")?.value || "");
    const oldData = await getUserById(privateUserInfo.id);

    if (!requesterUserId || requesterUserId !== privateUserInfo.id)
        return { success: false, error: "Please login first" };

    if (oldData?.email !== privateUserInfo.email && await getUserByEmail(privateUserInfo.email) !== null)
        return { success: false, error: "Email already in use" };

    if (oldData?.name !== privateUserInfo.name && await getUserByName(privateUserInfo.name) !== null)
        return { success: false, error: "Username already in use" };

    const user = await updateUser(privateUserInfo.id, privateUserInfo.name, privateUserInfo.email, privateUserInfo.bio);

    if (!user)
        return { success: false, error: "Updating failed" };

    console.log("Updated user", user);

    return { success: true, privateUserInfo: userToUserInfo(user, { profileURL: privateUserInfo.profileURL, email: user.email }) as PrivateUserInfo };
}

export async function followUserAction(followeeUserId: number): Promise<SimpleResponse> {
    const cookieStore = await cookies();
    const followerUserId = await validateToken(cookieStore.get("token")?.value || "");

    if (!followerUserId)
        return { success: false, error: "Please login first" };

    const user = await getUserById(followeeUserId);

    if (!user)
        return { success: false, error: "User doesn't exist" };

    await followUser(followerUserId, followeeUserId);
    await createNotification(followeeUserId, "follow", followerUserId);

    return { success: true };
}

export async function getProfileURLAction(userId: number): Promise<string | undefined> {
    return await getUserProfile(userId);
}

export async function getUsersAction(page: number, userId: number, action: UsersFilter): Promise<UserListResponse> {
    const cookieStore = await cookies();
    const requesterUserId = await validateToken(cookieStore.get("token")?.value || "");
    const user = await getUserById(userId, requesterUserId || undefined);

    if (!user)
        return { success: false, error: "User doesn't exist" };

    const paginator = new Paginator(usersQueryPageSize, page);
    let result: User[] = [];

    switch (action) {
        case "followers":
            result = await getFollowers(userId, paginator); break;
        case "following":
            result = await getFollowing(userId, paginator); break;
        case "recommendations":
            result = await getYouMayKnow(userId, paginator); break;
    }

    const hasNextPage = result.length === usersQueryPageSize + 1;
    if (hasNextPage)
        result.pop();

    const userInfos = result.map(user => userToUserInfo(user));

    for (const userInfo of userInfos) {
        userInfo.profileURL = await getUserProfile(userInfo.id);
    }

    return { success: true, users: userInfos, currentPage: paginator.currentPage, hasNextPage };
}