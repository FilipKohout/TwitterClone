import { useEffect, useRef, useState } from "react";
import { getPrivateUserInfoAction, PrivateUserInfo, updatePrivateUserInfoAction } from "@/app/actions/users";

export default function useProfile({ userId, onUpdatingSuccess }: { userId?: number, onUpdatingSuccess?: () => void }) {
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<PrivateUserInfo | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const profileImage = useRef<File | null>(null);
    const lastUserInfo = useRef<PrivateUserInfo | null>(null);

    const updateProfile = async (user: PrivateUserInfo) => new Promise<PrivateUserInfo>((resolve, reject) => {
        if (updating)
            return;

        setUpdating(true);
        setError(null);

        updatePrivateUserInfoAction(user)
            .then(async response => {
                if (!response.success || !response.privateUserInfo) {
                    setError(response.error || null);
                    resolve(userInfo as PrivateUserInfo);
                    return;
                }

                if (profileImage.current) {
                    const formData = new FormData();
                    formData.append("image", profileImage.current);

                    const profileImageResponse = await fetch("/api/users/upload", {
                        method: "POST",
                        body: formData,
                    })

                    const data = await profileImageResponse.json();
                    response.privateUserInfo.profileURL = data.profileURL;
                }

                setUserInfo(response.privateUserInfo);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                onUpdatingSuccess && onUpdatingSuccess();
                resolve(response.privateUserInfo);
            })
            .catch(error => {
                setError(error.message || "An error occurred");
                reject(error.message);
            })
            .finally(() => setUpdating(false));
    });

    const changeProfileImage = (image: File) => {
        const url = URL.createObjectURL(image);
        profileImage.current = image;
        setImagePreview(url);
        setUserInfo({ ...userInfo, profileURL: url } as PrivateUserInfo)
    }

    useEffect(() => {
        if (!userId)
            return;

        getPrivateUserInfoAction(userId)
            .then(response => {
                if (!response.success) {
                    setError(response.error || null);
                    return;
                }

                setUserInfo(response.privateUserInfo || null);
                setImagePreview(response.privateUserInfo?.profileURL || null);
                lastUserInfo.current = response.privateUserInfo || null;
            })
            .catch(error => setError(error.message || "An error occurred"));
    }, [userId]);

    return { updating, error, privateUserInfo: userInfo, lastPrivateUserInfo: lastUserInfo.current, updateProfile, updatePrivateUserInfo: setUserInfo, changeProfileImage: changeProfileImage, profileImagePreview: imagePreview, profileImageURL: profileImage };
}