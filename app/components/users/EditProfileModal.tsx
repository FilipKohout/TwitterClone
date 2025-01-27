"use client";

import styles from "@/app/styles/modals.module.css";
import React, { useContext, useId } from "react";
import { AlertsContext } from "@/app/providers/AlertsProvider";
import useProfile from "@/app/hooks/users/useProfile";
import { useCookies } from "next-client-cookies";
import { PrivateUserInfo, UserInfo } from "@/app/actions/users";
import { maxImageSize } from "@/app/lib/consts";

export default function EditProfileModal({ closeFunction, updateUserInfo }: { closeFunction?: () => void, updateUserInfo?: React.Dispatch<React.SetStateAction<UserInfo | undefined>> }) {
    const { addAlert } = useContext(AlertsContext);
    const cookies = useCookies();
    const { error, updating, privateUserInfo, lastPrivateUserInfo, updateProfile, updatePrivateUserInfo, changeProfileImage, profileImagePreview } = useProfile({ userId: parseInt(cookies.get("userId") || ""), onUpdatingSuccess: closeFunction });
    const fileUploadId = useId();

    const sameName = privateUserInfo?.name === lastPrivateUserInfo?.name;
    const sameEmail = privateUserInfo?.email === lastPrivateUserInfo?.email;
    const sameBio = privateUserInfo?.bio === lastPrivateUserInfo?.bio;
    const sameProfileImage = privateUserInfo?.profileURL === lastPrivateUserInfo?.profileURL;

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (sameName && sameEmail && sameProfileImage && sameBio) {
            addAlert({ message: "No changes detected", severity: "warning", timeout: 5 });
            return;
        }

        const formData = new FormData(event.target as HTMLFormElement);
        const [name, email, bio] = formData.values();

        if (name.toString().replace(" ", "") == "")
            addAlert({ message: "Username cannot be empty", severity: "warning", timeout: 5 });
        if (email.toString().replace(" ", "") == "")
            addAlert({ message: "Email cannot be empty", severity: "warning", timeout: 5 });
        else {
            updateProfile({ name: name as string, id: privateUserInfo?.id || 0, email: email as string, profileURL: privateUserInfo?.profileURL, bio } as PrivateUserInfo)
                .then(info => {
                    updateUserInfo && updateUserInfo(info as UserInfo);
                    addAlert({ message: "Profile updated", severity: "success", timeout: 5 });
                })
        }
    };

    const onProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file)
            return;

        if (file.size > maxImageSize) {
            addAlert({ message: "Image is too large", severity: "warning", timeout: 5 });
            return;
        }

        changeProfileImage(file);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Edit Profile</h1>
            <div className={updating ? "opacity-50" : ""} >
                <form className={styles.form} onSubmit={onSubmit}>
                    <label htmlFor={fileUploadId} className="h-full primarySelect mb-1">
                        <input multiple id={fileUploadId} onChange={onProfileChange} className="hidden" type="file" accept="image/png, image/gif, image/jpeg"/>
                        <div>
                            <img src={profileImagePreview || ""} className="rounded-full w-60 h-60 mr-auto ml-auto border-0"/>
                            <i className="fi fi-sr-upload rounded-full w-60 h-60 mr-auto ml-auto flex -mt-60 bigProfileIcon outline"/>
                        </div>
                    </label>
                    <input name="name" type="text" placeholder={privateUserInfo?.name} value={privateUserInfo?.name}
                           onChange={event => updatePrivateUserInfo({
                               ...privateUserInfo,
                               name: event.target.value
                           } as PrivateUserInfo)}
                    />
                    <input name="email" type="email" placeholder={privateUserInfo?.email} value={privateUserInfo?.email}
                           onChange={event => updatePrivateUserInfo({
                               ...privateUserInfo,
                               email: event.target.value
                           } as PrivateUserInfo)}
                    />
                    <textarea name="bio" className="textarea" placeholder={privateUserInfo?.bio} value={privateUserInfo?.bio}
                            onChange={event => updatePrivateUserInfo({
                                ...privateUserInfo,
                                bio: event.target.value
                            } as PrivateUserInfo)}
                    />
                    <button type="reset" className="negativeButton" onClick={closeFunction}>Cancel</button>
                    <button type="submit">{updating ? "Updating" : "Update"}</button>
                    {error && <p className="error">Updating error</p>}
                </form>
            </div>
        </div>
    );
}