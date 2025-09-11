import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
    const token = req.cookies.get("token")?.value;

    let decoded = null;
    try {
        decoded = jwt.decode(token); // just decode, do NOT verify signature in middleware
    } catch (e) { }

    if (req.nextUrl.pathname.startsWith("/admin")) {
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.rewrite(new URL("/404", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
