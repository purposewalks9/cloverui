import { timingSafeEqual } from "node:crypto";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function matches(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLOVER_SESSION_SECRET;
  const password = process.env.CLOVER_ACCESS_PASSWORD;
  if (!secret || !password) {
    return new NextResponse("Access protection is not configured.", { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const supplied = form?.get("password");
  if (typeof supplied !== "string" || supplied.length > 512 || !matches(supplied, password)) {
    const url = new URL("/access?error=1", request.url);
    return NextResponse.redirect(url, 303);
  }

  const jwt = await new SignJWT({ access: "clover-ui" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("clover-ui")
    .setAudience("clover-ui-access")
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(secret));

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set("clover_access", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
