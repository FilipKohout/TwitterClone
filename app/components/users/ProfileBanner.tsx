"use client";

import Dropdown from "@/app/components/utils/Dropdown";
import DropdownOption from "@/app/components/utils/DropdownOption";
import React, { useContext, useState } from "react";
import Modal from "@/app/components/utils/Modal";
import { followUserAction, UserInfo } from "@/app/actions/users";
import EditProfileModal from "@/app/components/users/EditProfileModal";
import { useCookies } from "next-client-cookies";
import { AlertsContext } from "@/app/providers/AlertsProvider";
import UserListProfileModal from "@/app/components/users/UserListProfileModal";

export default function ProfileBanner({ userInfo }: { userInfo?: UserInfo }) {
    const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | undefined>(userInfo);
    const { addAlert } = useContext(AlertsContext);
    const cookies = useCookies();

    const localUserId = cookies.get("userId");

    const handleFollow = () => {
        if (!currentUserInfo)
            return;

        setCurrentUserInfo(
            currentUserInfo && {
                ...currentUserInfo,
                is_followed: !currentUserInfo.is_followed,
                followers_count: currentUserInfo.is_followed ? Number(currentUserInfo.followers_count) - 1 : Number(currentUserInfo.followers_count) + 1
            }
        );

        followUserAction(currentUserInfo.id).catch(() => addAlert({ message: "Following failed", severity: "error", timeout: 30 }));
    }

    return (
        <div className="flex flex-col content-center items-center w-full h-auto">
            <div className="w-full">
                <div className="flex">
                    <img className="w-24 h-24 rounded-full" alt="Profile Image" src={currentUserInfo?.profileURL}/>
                    <div>
                        <h1 className="ml-4">{currentUserInfo?.name || "error"}</h1>
                        <div className="flex flex-row gap-4 ml-4 justify-center">
                            <Modal modal={<UserListProfileModal userId={currentUserInfo?.id || 0} title="Followers" source="followers"/>}>
                                <button className="-mt-0.5 blankButton p-0 h-5">Followers {currentUserInfo?.followers_count}</button>
                            </Modal>
                            <Modal modal={<UserListProfileModal userId={currentUserInfo?.id || 0} title="Following" source="following"/>}>
                                <button className="-mt-0.5 blankButton p-0 h-5">Following {currentUserInfo?.following_count}</button>
                            </Modal>
                        </div>
                    </div>
                    {parseInt(localUserId || "") === userInfo?.id &&
                        <>
                            <Modal modal={<EditProfileModal updateUserInfo={setCurrentUserInfo}/>} identifier="EditProfile"/>
                            <Dropdown styles="ml-auto" button={
                                <button className="blankButton">
                                    <i className="fi fi-bs-menu-dots-vertical"/>
                                </button>
                            }>
                                <DropdownOption title="Edit" modalIdentifier="EditProfile">
                                    <i className="fi fi-sr-pencil" style={{ marginTop: "2px", marginBottom: "-2px" }}/>
                                </DropdownOption>
                            </Dropdown>
                        </>
                    }
                </div>
                <div className="flex flex-row gap-1 w-full justify-center">
                    {parseInt(localUserId || "") !== userInfo?.id &&
                        <>
                            <button className="min-w-20 h-10" onClick={handleFollow}>{currentUserInfo?.is_followed ? "Unfollow" : "Follow"}</button>
                            <button className="negativeButton w-20 h-10">Block</button>
                        </>
                    }
                </div>
                <h2 className="text-2xl font-bold mt-2">About</h2>
                <p>{currentUserInfo?.bio || ""}</p>
            </div>
        </div>
    );
}
