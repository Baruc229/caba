import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const emails = ["schallom2003@gmail.com", "baruc.sossi@gmail.com", "admin@caba-residence.com"];
  const results: Record<string, unknown> = {};

  for (const email of emails) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        results[email] = {
          id: user.id,
          role: user.role,
          actif: user.actif,
          emailConfirme: user.emailConfirme,
          emailVerifyToken: user.emailVerifyToken ? "present" : null,
          exist: true,
        };
      } else {
        results[email] = { exist: false };
      }
    } catch (e) {
      results[email] = { error: String(e) };
    }
  }

  return NextResponse.json(results);
}
