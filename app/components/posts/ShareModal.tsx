"use client";

import styles from "@/app/styles/modals.module.css";
import { useContext } from "react";
import { AlertsContext } from "@/app/providers/AlertsProvider";


export default function ShareModal({ closeFunction, postId }: { closeFunction?: () => void, postId: number }) {
    const { addAlert } = useContext(AlertsContext);
    const url = window.location.origin + "/post/" + postId;

    const handleCopy = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        navigator.clipboard.writeText(url);
        addAlert({ message: "Link copied", severity: "success", timeout: 5 });
    }

    const handleClose = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        closeFunction && closeFunction();
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Share</h1>
            <div>
                <form className={styles.form}>
                    <input readOnly name="link" type="text" value={url}/>
                    <button onClick={handleCopy}>Copy</button>
                    <button className="negativeButton" onClick={handleClose}>Close</button>
                </form>
            </div>
        </div>
    );
}