import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "clover_access";

export async function proxy(request: NextRequest) {
  const secret = process.env.CLOVER_SESSION_SECRET;
  const password = process.env.CLOVER_ACCESS_PASSWORD;

  // Access protection is enabled only after both secrets are configured.
  if (!secret || !password) return NextResponse.next();

  const path = request.nextUrl.pathname;
  if (path === "/access" || path === "/api/access") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), {
        issuer: "clover-ui",
        audience: "clover-ui-access",
      });
      return NextResponse.next();
    } catch {
      // Invalid or expired session: require a fresh login.
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
