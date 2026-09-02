import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const { pathname } = request.nextUrl;

  let invalidReason: string | null = null;

  if (token?.id) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, actif: true },
      });
      if (!dbUser || !dbUser.actif) {
        invalidReason = dbUser ? "account_deactivated" : "account_deleted";
      }
    } catch {
      // DB error — don't block on it, let the request proceed
    }
  }

  // Routes d'authentification réservées aux NON-connectés
  const authPages = ["/connexion", "/inscription", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"];
  const isAuthPage = authPages.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Non authentifié ou session invalidée : seules les pages d'auth sont accessibles
  if (!token || invalidReason) {
    const response = isAuthPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/connexion", request.url));

    if (invalidReason) {
      response.cookies.set("session_invalidated", invalidReason, {
        maxAge: 60,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
      if (!isAuthPage) {
        const redirectUrl = new URL("/connexion", request.url);
        redirectUrl.searchParams.set("reason", invalidReason);
        return NextResponse.redirect(redirectUrl);
      }
    } else if (!isAuthPage) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return response;
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
