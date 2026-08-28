import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const results: Record<string, unknown> = {};

  if (!email) {
    return NextResponse.json({ error: "email param required" }, { status: 400 });
  }

  const verifiedEmail = String(email).toLowerCase().trim();

  // Step 1: check existing user
  try {
    const existing = await prisma.user.findUnique({ where: { email: verifiedEmail } });
    results.step1_existingUser = existing ? `EXISTS (id=${existing.id})` : "none";
  } catch (e) {
    results.step1_error = String(e);
  }

  // Step 2: try full flow
  try {
    const hashedPassword = await bcrypt.hash("Test1234", 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email: verifiedEmail,
        password: hashedPassword,
        nom: "Test",
        prenom: "Probe",
        role: "client",
        actif: true,
        emailConfirme: false,
        emailVerifyToken: verifyToken,
        emailVerifyExpire: new Date(Date.now() + 24 * 60 * 60 * 1000),
        cgvAccepteesAt: new Date(),
      },
    });
    results.step2_created = `OK (id=${user.id})`;

    // Step 3: send email
    try {
      const { sent, verifyUrl } = await sendVerificationEmail(verifiedEmail, "Probe", verifyToken);
      results.step3_emailSent = sent;
      results.step3_verifyUrl = verifyUrl;
    } catch (e) {
      results.step3_emailError = String(e);
    }
  } catch (e) {
    results.step2_error = String(e);
  }

  return NextResponse.json(results, { status: 200 });
}
