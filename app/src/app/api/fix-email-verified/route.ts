import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (key !== "caba-fix-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "emailConfirme" = true WHERE "emailConfirme" = false`
    );
    return NextResponse.json({ success: true, updated: result });
  } catch (error) {
    console.error("[FIX-EMAIL] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
