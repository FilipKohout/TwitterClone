"use client";

import React, { Children } from "react";
import styles from "@/app/styles/dropdown.module.css";

type props = { title: string, negative?: boolean, children?: React.ReactNode, callbackFn?: () => void, index?: number, modalIdentifier?: string };

export default function DropdownOption({ title, children, negative, callbackFn, modalIdentifier }: props) {
    const icon = children && Children.only(children) as React.ReactElement;

    const handleClick = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        callbackFn && callbackFn();

        if (modalIdentifier) {
            const modalEvent = new Event("Modal_" + modalIdentifier);
            window.dispatchEvent(modalEvent);
        }
    }

    return (
        <button className={styles.option} onMouseDown={handleClick}>
            {icon && icon}
            <p className={negative ? styles.negative : styles.normal}>
                {title}
            </p>
        </button>
    );
}