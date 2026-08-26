import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

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

    const jwt = await new SignJWT({
      role: user.role,
      id: user.id,
      prenom: user.prenom,
      nom: user.nom,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);

    const redirectUrl = user.role === "client" ? "/" : "/admin";
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

    response.cookies.set("authjs.session-token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    return NextResponse.redirect(new URL("/verification?error=server", request.url));
  }
}
