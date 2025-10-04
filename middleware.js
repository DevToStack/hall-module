import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
    const logs = [];
    const log = (msg) => {
        console.log("[Middleware]", msg);
        logs.push(msg);
    };

    log(`Middleware hit for: ${req.nextUrl.pathname}`);

    const token = req.cookies.get("token")?.value;
    if (!token) {
        log("No token → rewriting to /404");
        return NextResponse.rewrite(new URL("/404", req.url));
    }
    log("Token found");

    let decoded;
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        decoded = verified.payload;
        log(`JWT decoded successfully: ${JSON.stringify(decoded)}`);
    } catch (err) {
        log(`JWT verification failed: ${err.message}`);
        return NextResponse.rewrite(new URL("/404", req.url));
    }

    // Protect both /admin pages and /api/admin/* routes
    if (
        req.nextUrl.pathname.startsWith("/admin") ||
        req.nextUrl.pathname.startsWith("/api/admin")
    ) {
        if (decoded.role === "admin") {
            log("Admin access allowed → next()");
            return NextResponse.next();
        } else {
            log("Non-admin → /404");
            return NextResponse.rewrite(new URL("/404", req.url));
        }
    }

    log("Non-admin page → next()");
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"], // <-- protect both
};
