import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/espace-client"];
const authRoutes = ["/connexion", "/inscription"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !sessionToken) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/espace-client", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace-client/:path*", "/connexion", "/inscription"],
};
