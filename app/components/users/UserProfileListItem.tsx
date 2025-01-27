import { UserInfo } from "@/app/actions/users";
import React from "react";
import Link from "next/link";

export default function UserProfileListItem({ userInfo }: { userInfo?: UserInfo }) {
    return (
        <Link href={"/user/" + userInfo?.id} className="flex flex-row gap-3 w-full bgframe primarySelect borderSelect">
            <img className="w-10 h-10 rounded-full" alt="Profile Image" src={userInfo?.profileURL}/>
            <h2 className="text-2xl font-bold h-7 mt-auto mb-auto">{userInfo?.name}</h2>
        </Link>
    );
}