import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { emailConfirme: true, actif: true },
    });

    if (!user) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({
      exists: true,
      emailConfirme: user.emailConfirme,
      actif: user.actif,
    });
  } catch (error) {
    console.error("[CONNEXION-STATE] Error:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
