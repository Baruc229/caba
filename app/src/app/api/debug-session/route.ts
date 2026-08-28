import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  const all = store.getAll().map((c) => ({ name: c.name }));
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";

  const token = await getToken({
    req: { headers: { cookie: store.toString() } } as never,
    secret: process.env.AUTH_SECRET,
    secureCookie: isProd,
  });

  return NextResponse.json({
    prod: isProd,
    cookieName,
    cookies: all,
    decodedRole: token?.role ?? null,
    decodedId: token?.id ?? null,
    tokenDepth: token ? Object.keys(token) : null,
  });
}
