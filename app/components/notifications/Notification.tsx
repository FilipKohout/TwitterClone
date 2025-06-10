"use client";

import { type Notification } from "@/app/lib/database/notifications";
import React, { useMemo } from "react";
import Link from "next/link";
import Post from "@/app/components/posts/Post";

export default function Notification({ notification, isPreview, dark }: { notification: Notification, isPreview?: boolean, dark?: boolean }) {
    const { id, type, data, source_user, post } = notification;

    const content: React.ReactElement = useMemo(() => {
        switch (type) {
            case "follow":
                return (
                    <h2 className="text-2xl font-bold h-7 mt-auto mb-auto">Started following you</h2>
                );
            case "like":
                return (
                    <h2 className="text-2xl font-bold h-7">
                        <i className="fi fi-ss-heart error"/>
                        {" Liked your post"}
                    </h2>
                );
            case "reply":
                const { parentPostId } = JSON.parse(data || "");

                return (
                    <h2 className="text-2xl font-bold h-7">
                        <i className="fi fi-sr-comment"/>
                        {" Replied to your "}
                        {(data && parentPostId)
                            ?   <Link href={"/post/" + parseInt(parentPostId)} className="underline primarySelect">
                                    post
                                </Link>
                            :   "deleted"
                        }
                    </h2>
                );
            case "mention":
                return <p>mentioned you</p>;
            case "warning":
                return <p>warning</p>;
            default:
                return <p>unknown</p>;
        }
    }, [data, type]);

    return (
        <>
            <div id={"notification" + id} className="frame flex flex-row gap-3 w-full">
                {source_user &&
                    <div className="w-12">
                        <Link className="w-10 h-10" href={"/user/" + source_user.id}>
                            <img className="w-10 h-10 rounded-full" alt="Profile Image" src={source_user.profileURL}/>
                        </Link>
                    </div>
                }
                <div className="flex flex-col w-full">
                    <div className="flex w-full h-6">
                        {source_user &&
                            <Link href={"/user/" + source_user.id} className="mb-0 font-extrabold">
                                {source_user.name}
                            </Link>
                        }
                        <p className="text-xs ml-2 mt-1.5 h-4">{/*dateString*/}</p>
                    </div>
                    <div className="flex">
                        {content}
                    </div>
                </div>
            </div>
            {post &&
                <div className="pl-10 w-full">
                    <Post isPreview={isPreview} post={post} respondingEnabled={false} dark={dark} isReply={post.parent_post_id !== null} />
                </div>
            }
        </>
    )
}