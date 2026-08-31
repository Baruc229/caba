import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const { pathname } = request.nextUrl;

  // Routes d'authentification réservées aux NON-connectés
  const authPages = ["/connexion", "/inscription", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"];
  const isAuthPage = authPages.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Non authentifié : seules les pages d'auth sont accessibles, le reste → /connexion
  if (!token) {
    if (isAuthPage) return NextResponse.next();
    const url = new URL("/connexion", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authentifié : interdire les pages d'auth, rediriger selon le rôle
  if (isAuthPage) {
    const target = token.role === "client" ? "/" : "/admin";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Compte non vérifié : exiger la vérification d'email (sauf sur la page /verification)
  if (token.emailConfirme === false && pathname !== "/verification") {
    return NextResponse.redirect(new URL("/verification", request.url));
  }

  // Client connecté : n'a pas d'accès au back-office
  if (token.role === "client" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/reinitialiser-mot-de-passe",
    "/compte/:path*",
  ],
};
