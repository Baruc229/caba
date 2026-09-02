import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encode } from "@auth/core/jwt";

// N'accepte qu'un chemin relatif interne pour éviter toute redirection ouverte.
function safeNext(value: string | null): string | null {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const nextParam = safeNext(searchParams.get("next"));

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

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, prenom: true, nom: true, email: true, role: true, avatarUrl: true, emailConfirme: true },
    });

    const baseRedirect =
      nextParam ? `${nextParam}${nextParam.includes("?") ? "&" : "?"}verified=1`
      : user.role === "client" ? "/?verified=1" : "/admin?verified=1";
    const response = NextResponse.redirect(new URL(baseRedirect, request.url));

    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";
    const maxAge = Number(process.env.AUTH_SESSION_HEURES ?? 8) * 3600;

    const sessionToken = await encode({
      salt: cookieName,
      secret: process.env.AUTH_SECRET!,
      maxAge,
      token: {
        sub: dbUser!.id,
        name: `${dbUser!.prenom} ${dbUser!.nom}`,
        email: dbUser!.email,
        picture: dbUser!.avatarUrl,
        role: dbUser!.role,
        id: dbUser!.id,
        prenom: dbUser!.prenom,
        nom: dbUser!.nom,
        emailConfirme: dbUser!.emailConfirme,
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
