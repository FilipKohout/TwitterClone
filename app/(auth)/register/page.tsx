"use client";

import { useRouter } from 'next/navigation'
import { SimpleResponse } from "@/app/lib/definitions";
import React, { useState } from "react";
import Link from "next/link";
import styles from "@/app/styles/auth.module.css";
import { registerAction } from "@/app/actions/auth";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<boolean | string>(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const [username, email, password] = formData.values();

        setError(false);
        setLoading(true);

        registerAction(username as string, email as string, password as string)
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
                <h1 className={styles.heading}>Register</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username"/>
                    <input type="email" name="email" placeholder="Email"/>
                    <input type="password" name="password" placeholder="password"/>
                    <button type="submit">
                        {loading ? "Loading" : "Register"}
                    </button>
                    {error && <p className="error">{error}</p>}
                    <Link href="/login">
                        Already have an account?
                    </Link>
                </form>
            </div>
        </div>
    );
}