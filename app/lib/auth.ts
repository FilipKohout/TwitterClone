import * as jose from "jose";

export async function validateToken(token: string) : Promise<number | null> {
    let userId = null;

    try {
        if (token) {
            const decoded = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

            if (decoded.payload)
                userId = decoded.payload.userId as number;
        }
    }
    catch {
        return null;
    }

    return userId;
}