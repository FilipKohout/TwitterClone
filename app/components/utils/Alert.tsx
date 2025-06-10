"use client";

import { useEffect } from "react";
import { AlertInfo } from "@/app/providers/AlertsProvider";
import styles from "@/app/styles/alerts.module.css";
import { useSpringValue, animated } from "@react-spring/web";

export const colors = {
    info: "var(--primary)",
    success: "var(--positive)",
    warning: "var(--warning)",
    error: "var(--negative)",
};

interface AlertProps extends AlertInfo {
    handleDismiss?: () => void;
}

export default function Alert({ message = "", severity = "info", timeout = 0, handleDismiss }: AlertProps) {
    const opacity = useSpringValue(0, { config: { duration: 200 } });

    useEffect(() => {
        opacity.start(1);

        if (timeout > 0 && handleDismiss) {
            const timer = setTimeout(() => opacity.start(0).then(() => handleDismiss()), timeout * 1000);

            return () => clearTimeout(timer);
        }
    }, [handleDismiss, opacity, timeout]);

    return (
        message?.length && (
            <animated.div className={styles.layout} style={{ backgroundColor: colors[severity], opacity }}>
                <p className={styles.message}>{message}</p>
                {handleDismiss &&
                    <button onClick={() => opacity.start(0).then(() => handleDismiss())} className={styles.dismiss}>
                        <i className="fi fi-br-cross h-5 w-5 m-auto" />
                    </button>
                }
            </animated.div>
        )
    );
}