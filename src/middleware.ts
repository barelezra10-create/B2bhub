import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "b2bhub_session";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (!url.pathname.startsWith("/admin")) return NextResponse.next();
  if (url.pathname === "/admin/login") return NextResponse.next();

  const res = NextResponse.next();
  const session = await getIronSession<{ userId?: string }>(req, res, {
    password: process.env.SESSION_SECRET as string,
    cookieName: SESSION_COOKIE,
  });

  if (!session.userId) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
