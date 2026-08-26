import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.redirect(new URL("/connexion?verifie=1", request.url));
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.redirect(new URL("/verification?error=server", request.url));
  }
}
