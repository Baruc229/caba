import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Check env vars
  results.brevoKey = process.env.BREVO_API_KEY ? "present (" + process.env.BREVO_API_KEY.slice(0, 10) + "...)" : "MISSING";
  results.senderEmail = process.env.BREVO_SENDER_EMAIL || "MISSING";
  results.senderName = process.env.BREVO_SENDER_NAME || "MISSING";
  results.nextauthUrl = process.env.NEXTAUTH_URL || "MISSING";

  // Try sending test email to the sender itself
  try {
    const sent = await sendEmail({
      to: process.env.BREVO_SENDER_EMAIL!,
      subject: "Test Caba Residence",
      htmlContent: "<p>Test email from Caba Residence API</p>",
    });
    results.sendResult = sent;
  } catch (err) {
    results.sendError = String(err);
  }

  return NextResponse.json(results, { status: 200 });
}
