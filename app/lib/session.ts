// @ts-ignore
import jwt from "jsonwebtoken";

export function createSession(userId: number): string {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
        expiresIn: '365d',
    })
}