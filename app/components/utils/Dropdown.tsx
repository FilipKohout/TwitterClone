"use client";

import React, { Children, useState } from "react";
import styles from "@/app/styles/dropdown.module.css";
import { useSpring, animated } from "@react-spring/web";

export default function Dropdown({ children, button, styles: className }: { children: React.ReactNode, button: React.ReactNode, styles?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [springs, api] = useSpring(() => {});

    const animDuration = 50;

    const setAnim = async (state: boolean) => {
        if (state)
            api.start({ from: { transform: 'translateY(-100%)', opacity: 0 }, to: { transform: 'translateY(0%)', opacity: 1 }, config: { duration: animDuration } });
        else
            api.start({ from: { transform: 'translateY(0%)', opacity: 0 }, to: { transform: 'translateY(-100%)', opacity: 1 }, config: { duration: animDuration } });

        await new Promise(resolve => setTimeout(resolve, animDuration));
    };

    const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        if (isOpen)
            setAnim(false).then(() => setIsOpen(false));
        else {
            setIsOpen(true);
            setAnim(true);
        }
    };

    const handleButtonBlur = () => {
        setTimeout(() => {
            setAnim(false).then(() => setIsOpen(false));
        }, 100);
    };

    const options = Children.map(children, (child, index) =>
        <>
            {React.cloneElement(child as React.ReactElement, { key: index, index: index, ...(child as React.ReactElement).props })}
        </>
    );

     return (
         <div className={className ? className : ""}>
             {React.cloneElement(button as React.ReactElement, { onBlur: handleButtonBlur, onClick: handleButtonClick })}
             {isOpen &&
                 <div className={styles.overflow}>
                     <animated.div className={styles.layout} style={springs}>
                         {options as React.ReactNode}
                     </animated.div>
                 </div>
             }
         </div>
     );
}