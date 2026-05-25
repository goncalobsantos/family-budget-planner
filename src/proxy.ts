import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page and auth API without session
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  try {
    const token = req.cookies.get("session")?.value;

    if (!token || !(await verifySession(token))) {
      // For API routes, return 401
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // For pages, redirect to login
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // If session verification fails, redirect to login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
