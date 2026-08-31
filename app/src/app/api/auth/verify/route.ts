import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "@auth/core/jwt";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verification?error=missing", request.url));
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpire: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/verification?error=invalid", request.url));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirme: true,
        emailVerifyToken: null,
        emailVerifyExpire: null,
      },
    });

    const redirectUrl = user.role === "client" ? "/?verified=1" : "/admin?verified=1";
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";
    const maxAge = Number(process.env.AUTH_SESSION_HEURES ?? 8) * 3600;

    // Encode le jeton dans le format chiffré attendu par NextAuth (JWE),
    // avec le nom du cookie comme "salt" — seul format que auth()/getToken() reconaissent.
    const sessionToken = await encode({
      salt: cookieName,
      secret: process.env.AUTH_SECRET!,
      maxAge,
      token: {
        sub: user.id,
        name: `${user.prenom} ${user.nom}`,
        email: user.email,
        picture: user.avatarUrl,
        role: user.role,
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
      },
    });

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    return NextResponse.redirect(new URL("/verification?error=server", request.url));
  }
}
