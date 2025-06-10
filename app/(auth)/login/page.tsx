"use client";

import { useRouter } from 'next/navigation';
import { SimpleResponse } from "@/app/lib/definitions";
import React, { useState } from "react";
import Link from "next/link";
import styles from "@/app/styles/auth.module.css";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<boolean | string>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);
        const [username, password] = formData.values();

        setError(false);
        setLoading(true);

        loginAction(username as string, password as string)
            .then((json: SimpleResponse) => {
                if (!json.success && json.error)
                    setError(json.error);
                else
                    router.push("/home");
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }

    return (
        <div className={styles.layout}>
            <div className={styles.container}>
                <h1 className={styles.heading}>Login</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username"/>
                    <input type="password" name="password" placeholder="password"/>
                    <button type="submit">
                        {loading ? "Loading" : "Login"}
                    </button>
                    {error && <p className="error">{error}</p>}
                    <Link href="/register">
                        Don&#39;t have an account yet?
                    </Link>
                </form>
            </div>
        </div>
    );
}