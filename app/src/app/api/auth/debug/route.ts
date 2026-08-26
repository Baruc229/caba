import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. DATABASE_URL exists?
  checks.dbUrlSet = !!process.env.DATABASE_URL;
  checks.dbUrlPrefix = process.env.DATABASE_URL?.slice(0, 30) ?? "NOT SET";

  // 2. Prisma can connect?
  try {
    await prisma.$connect();
    checks.prismaConnect = "ok";
  } catch (e: unknown) {
    checks.prismaConnect = "error";
    checks.prismaConnectError = e instanceof Error ? e.message : String(e);
    return NextResponse.json(checks, { status: 500 });
  }

  // 3. Count users
  try {
    const count = await prisma.user.count();
    checks.userCount = count;
  } catch (e: unknown) {
    checks.userCount = "error";
    checks.userCountError = e instanceof Error ? e.message : String(e);
  }

  // 4. List all user emails (first 10)
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        actif: true,
        verrouilleJusqua: true,
        tentativesEchouees: true,
        password: true,
      },
      take: 10,
    });
    checks.users = users.map((u) => ({
      email: u.email,
      role: u.role,
      actif: u.actif,
      locked: u.verrouilleJusqua ? u.verrouilleJusqua > new Date() : false,
      tentatives: u.tentativesEchouees,
      passwordPrefix: u.password.slice(0, 7),
      passwordLength: u.password.length,
    }));
  } catch (e: unknown) {
    checks.users = "error";
    checks.usersError = e instanceof Error ? e.message : String(e);
  }

  // 5. Test bcrypt with a known hash
  try {
    const testPlain = "Test1234";
    const testHash = await bcrypt.hash(testPlain, 12);
    const compareOk = await bcrypt.compare(testPlain, testHash);
    const compareBad = await bcrypt.compare("WrongPassword", testHash);
    checks.bcrypt = {
      hashPrefix: testHash.slice(0, 7),
      compareCorrect: compareOk,
      compareWrong: compareBad,
    };
  } catch (e: unknown) {
    checks.bcrypt = "error";
    checks.bcryptError = e instanceof Error ? e.message : String(e);
  }

  // 6. Test bcrypt against first user's actual hash
  if (Array.isArray(checks.users) && checks.users.length > 0) {
    const firstUser = checks.users[0];
    try {
      const userRecord = await prisma.user.findUnique({
        where: { email: firstUser.email },
        select: { password: true },
      });
      if (userRecord) {
        // We can't know the plain password, but we can test that bcrypt.compare doesn't throw
        const noThrow = await bcrypt.compare("anything", userRecord.password);
        checks.bcryptOnRealHash = {
          noThrow: true,
          result: noThrow,
          hashPrefix: userRecord.password.slice(0, 7),
          hashLength: userRecord.password.length,
        };
      }
    } catch (e: unknown) {
      checks.bcryptOnRealHash = {
        noThrow: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  return NextResponse.json(checks, { status: 200 });
}
