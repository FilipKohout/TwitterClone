"use server";

import { SimpleResponse } from "@/app/lib/definitions";
import { createUser, getUserByEmail, getUserByName } from "@/app/lib/database/users";
import { createSession } from "@/app/lib/session";
import { cookies } from "next/headers";
// @ts-ignore
import bcrypt from "bcrypt";

export async function loginAction(username: string, password: string): Promise<SimpleResponse> {
    const cookieStore = await cookies();
    const user = await getUserByName(username);

    if (user === null)
        return { success: false, error: "Please register first" };

    const match = await bcrypt.compare(password, user.password);

    if (!match)
        return { success: false, error: "Invalid password" };

    const token = createSession(user.id);
    cookieStore.set("token", token);
    cookieStore.set("userId", user.id.toString());

    return { success: true };
}

export async function registerAction(username: string, email: string, password: string): Promise<SimpleResponse> {
    const cookieStore = await cookies();
    const hash = await bcrypt.hash(password, 10);

    if (await getUserByEmail(email) !== null)
        return { success: false, error: "Email already in use" };

    if (await getUserByName(username) !== null)
        return { success: false, error: "Username already in use" };

    const user = await createUser(username, email, hash);
    const token = createSession(user.id);
    cookieStore.set("token", token);
    cookieStore.set("userId", user.id.toString());

    return { success: true };
}