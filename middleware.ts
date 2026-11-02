import { NextRequest, NextResponse } from "next/server";

// Vérification rapide de présence du cookie. La validité réelle est contrôlée
// par /api/auth/session. Le nom du cookie doit rester identique à SESSION_COOKIE.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("bisou_session")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
