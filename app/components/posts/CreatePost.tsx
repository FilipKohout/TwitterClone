"use client";

import React, { useContext, useId, useRef, useState } from "react";
import { AlertsContext } from "@/app/providers/AlertsProvider";
import useNewPost from "@/app/hooks/posts/useNewPost";
import { PostsFilter } from "@/app/lib/database/posts";
import { maxImages, maxImageSize, maxImageSizeString } from "@/app/lib/consts";

export default function CreatePost({ filter = {}, templateText, autoFocus, hideOnBlur, onBlur: onBlurCallback, onPosted }: { filter?: PostsFilter, templateText?: string, autoFocus?: boolean, hideOnBlur?: boolean, onBlur?: () => void, onPosted?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState("");
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const images = useRef<File[]>([]);
    const { addAlert } = useContext(AlertsContext);
    const { post, isPostingPending, isPostingError } = useNewPost({ onPostingSuccess: () => {
            setContent("");
            setIsOpen(false);
            images.current = [];
            setImagePreviews([]);
        }, filter });
    const fileUploadId = useId();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (content.toString().replace(" ", "") === "")
            addAlert({ message: "Description cannot be empty", severity: "warning", timeout: 5 });
        else {
            post({ content: content, images: images.current });
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            onPosted && onPosted();
        }
    }

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (!files || files.length === 0)
            return;

        if (images.current.length + files.length > maxImages) {
            addAlert({ message: "You can only upload up to " + maxImages + " images", severity: "warning", timeout: 5 });
            return;
        }

        const newImages = Array.from(files).filter(file => {
            const smaller = file.size <= maxImageSize;

            if (!smaller)
                addAlert({ message: "Image " + file.name + " is larger than " + maxImageSizeString, severity: "warning", timeout: 5 });

            return smaller;
        });
        images.current = [...images.current, ...newImages].slice(0, maxImages);

        const newPreviews = newImages.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews].slice(0, maxImages));
    }

    const removeImage = (index: number) => {
        images.current = images.current.filter((_, i) => i !== index);
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    }

    const onBlur = () => {
        if (content.toString().replace(" ", "") === "") {
            setIsOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            onBlurCallback && setTimeout(onBlurCallback, 150);
        }
    }

    const hasImages = images.current.length > 0;
    const height = hasImages ? "h-52" : "h-36";

    return (
        <div className={isPostingPending ? "opacity-50" : ""}>
            <form className={"textboxContainer noBorder transition-all flex flex-col w-main " + (isOpen ? height +" primaryOutline" : "overflow-hidden border-0 " + (hideOnBlur ? "h-0" : "h-10"))} onSubmit={onSubmit}>
                <textarea
                    className="blankTextbox h-36 transition-all resize-none"
                    onFocus={() => setIsOpen(true)}
                    onBlur={onBlur}
                    onChange={event => setContent(event.target.value)}
                    name="description"
                    placeholder={templateText || "What's up?"}
                    value={content}
                    autoFocus={autoFocus}
                />
                <div className="flex flex-row gap-1 w-full">
                    {imagePreviews.map((url, index) => (
                        <div key={index} className="h-16 w-16">
                            <button className="blankButton negativeSelect absolute" onClick={() => removeImage(index)}>
                                <i className="fi fi-sr-trash midIcon"/>
                            </button>
                            <img key={index} src={url} alt="uploaded image" className="transition-all h-16 w-16"/>
                        </div>
                    ))}
                </div>
                <div className={"flex flex-row gap-1 transition-all overflow-clip " + (isOpen ? "h-5 mt-1" : "h-0 noText p-0 m-0")}>
                    <label htmlFor={fileUploadId} className="h-5 primarySelect">
                        <input multiple id={fileUploadId} onChange={onFileChange} className="hidden" type="file" accept="image/png, image/gif, image/jpeg"/>
                        <i className="fi fi-sr-add-image midIcon"/>
                    </label>
                    <button type="submit" className="ml-auto h-5 blankButton p-0">
                        <i className="fi fi-ss-paper-plane midIcon"/>
                    </button>
                    {isPostingError && <p className="error">Posting error</p>}
                </div>
            </form>
        </div>
    );
}