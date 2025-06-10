"use client";

import { type Post, PostsFilter } from "@/app/lib/database/posts";
import Dropdown from "@/app/components/utils/Dropdown";
import DropdownOption from "@/app/components/utils/DropdownOption";
import { useCookies } from "next-client-cookies";
import Link from "next/link";
import useRemovePost from "@/app/hooks/posts/useRemovePost";
import React, { useContext, useState } from "react";
import { likePostAction } from "@/app/actions/posts";
import { AlertsContext } from "@/app/providers/AlertsProvider";
import CreatePost from "@/app/components/posts/CreatePost";
import Modal from "@/app/components/utils/Modal";
import ShareModal from "@/app/components/posts/ShareModal";
import { redirect } from "next/navigation";

export default function Post({ post, filter = {}, isReply, respondingEnabled = true, isPreview = false, dark = false }: { post: Post, filter?: PostsFilter, isReply?: boolean, respondingEnabled?: boolean, isPreview?: boolean, dark?: boolean }) {
    const { content, id, is_new, user_name, poster_id, timestamp, replies_count, likes_count, is_liked, image_urls, profile_url } = post;

    const cookies = useCookies();
    const { addAlert } = useContext(AlertsContext);
    const { remove, isRemoving } = useRemovePost({ filter });
    const [likeState, setLikeState] = useState<{ likeCount: number, isLiked: boolean }>({ likeCount: likes_count, isLiked: is_liked });
    const [isReplying, setIsReplying] = useState(false);

    const date = new Date(timestamp.replace(" ", "T"));
    const dateString = date.toLocaleString(navigator?.language || 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const handleDelete = () => {
        remove({ id });
    }

    const handleLike = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        if (likeState.isLiked)
            setLikeState({ likeCount: parseInt(String(likeState.likeCount)) - 1, isLiked: false });
        else
            setLikeState({ likeCount: parseInt(String(likeState.likeCount)) + 1, isLiked: true });

        likePostAction(id).catch(() => addAlert({ message: "Liking failed", severity: "error", timeout: 30 }));
    }

    const handleReply = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        if (!respondingEnabled)
            return

        setIsReplying(!isReplying);
    }

    const handleReplyBlur = () => {
        setIsReplying(false);
    }

    const onReply = () => {
        setIsReplying(false);

        redirect("/post/" + id);
    }

    const postClassName = "borderSelect flex flex-row gap-3 w-full " + (is_new ? "highlight " : "") + (isRemoving ? "opacity-50 " : "") + (dark ? "bgframe " : "frame ");
    const PostDiv = ({ children }: { children: React.ReactNode }) => isReply
        ? <div id={"post" + id} className={postClassName}>{children}</div>
        : <Link href={"/post/" + id} id={"post" + id} className={postClassName}>{children}</Link>;

    return (
        <div>
            <PostDiv>
                <div className="w-12">
                    <Link className="w-10 h-10" href={"/user/" + poster_id}>
                        <img className="w-10 h-10 rounded-full" alt="Profile Image" src={profile_url} />
                    </Link>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex w-full h-6">
                        <Link href={"/user/" + poster_id} className="mb-0 font-extrabold">
                            {user_name}
                        </Link>
                        {!isPreview &&
                            <>
                                <p className="text-xs ml-2 mt-1.5 h-4">{dateString}</p>
                                {poster_id.toString() == cookies.get("userId") &&
                                    <Dropdown styles="ml-auto" button={
                                        <button className="blankButton">
                                            <i className="fi fi-bs-menu-dots-vertical"/>
                                        </button>
                                    }>
                                        <DropdownOption negative title="Delete" callbackFn={handleDelete}>
                                            <i className="fi fi-sr-trash"
                                               style={{ color: "var(--negative)", marginTop: "2px", marginBottom: "-2px" }}/>
                                        </DropdownOption>
                                    </Dropdown>
                                }
                            </>
                        }
                    </div>
                    <p>{content}</p>
                    {!isPreview &&
                        <>
                            <div className="mr-9 gap-1 flex flex-col">
                            {image_urls && image_urls.map((url, index) => (
                                <img key={index} src={url} alt="uploaded image" className="transition-all w-full"/>
                            ))}
                            </div>
                            <div className="flex flex-row gap-1">
                                <button className="blankButton -mb-3 flex" onClick={handleLike}>
                                    {likeState.isLiked ? <i className="fi fi-ss-heart"/> : <i className="fi fi-rs-heart"/>}
                                    <p className="ml-1 -mt-0.5">{likeState.likeCount}</p>
                                </button>
                                {!isReply && <>
                                    <button className="blankButton -mb-3 flex" onClick={handleReply}>
                                        <i className="fi fi-sr-comment"/>
                                        <p className="ml-1 -mt-0.5">{replies_count}</p>
                                    </button>
                                    <Modal modal={<ShareModal postId={id}/>}>
                                        <button className="blankButton -mb-3 flex">
                                            <i className="fi fi-sr-share"/>
                                        </button>
                                    </Modal>
                                </>}
                            </div>
                        </>
                    }
                </div>
            </PostDiv>
            {isReplying &&
                <div className={"overflow-hidden transition-all " + (isReplying ? "pt-1" : "pt-0")}>
                    <CreatePost autoFocus hideOnBlur filter={{ parentPostId: id }} templateText={"Replying to " + user_name} onBlur={handleReplyBlur} onPosted={onReply} />
                </div>
            }
        </div>
    );
}