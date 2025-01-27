"use client";

import React, { Children, ReactElement, useEffect } from "react";
import styles from "@/app/styles/modals.module.css";
import { animated, useSpring, useSpringValue } from "@react-spring/web";

export default function Modal({ modal, children, callbackFn, identifier }: { modal: React.ReactElement, children?: React.ReactNode, callbackFn?: () => void, identifier?: string }) {
    const button = children && Children.only(children) as React.ReactElement;
    const [isOpen, setIsOpen] = React.useState(false);
    const [springs, api] = useSpring(() => {});
    const opacity = useSpringValue(0, { config: { duration: 200 } });

    const handleOpen = (event?: React.MouseEvent<HTMLElement> | any) => {
        event && event.preventDefault();
        callbackFn && callbackFn();

        setIsOpen(true);
        opacity.start(1);
        api.start({ from: { transform: 'translateY(-200%)' }, to: { transform: 'translateY(0%)' }, config: { duration: 100 } });
    };

    const handleClose = () => {
        api.start({ from: { transform: 'translateY(0%)' }, to: { transform: 'translateY(-200%)' }, config: { duration: 100 } });
        opacity.start(0).then(() => setIsOpen(false));
    };

    useEffect(() => {
        window.addEventListener("Modal_" + identifier, handleOpen);

        return () => {
            window.removeEventListener("Modal_" + identifier, handleOpen)
        }
    }, []);

    return (
        <>
            {button && React.cloneElement(button, { onClick: handleOpen })}
            {isOpen &&
                <animated.div style={{ opacity }}>
                    <div className={styles.layout}>
                        <animated.div style={springs}>
                            {React.cloneElement(modal, { closeFunction: handleClose })}
                        </animated.div>
                    </div>
                </animated.div>
            }
        </>
    );
}