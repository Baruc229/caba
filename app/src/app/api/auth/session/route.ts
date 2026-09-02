import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({
    connected: true,
    id: session.user.id,
    email: session.user.email,
    emailConfirme: session.user.emailConfirme ?? false,
  });
}
