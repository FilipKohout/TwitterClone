import { type NextRequest, NextResponse } from 'next/server'
import { validateToken } from "@/app/lib/auth";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value || "";
    const userId = await validateToken(token);
    const { pathname } = request.nextUrl;

    if (pathname.includes("/home") && !userId)
        return NextResponse.redirect(new URL('/login', request.url));

    if ((pathname.endsWith("/login") || pathname.endsWith("/register")) && userId)
        return NextResponse.redirect(new URL('/home', request.url));

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
}