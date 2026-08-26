import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "emailConfirme" = true WHERE "emailConfirme" = false`
    );
    return NextResponse.json({ success: true, updated: result });
  } catch (error) {
    console.error("[CLEANUP] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
