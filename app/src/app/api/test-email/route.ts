import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const toEmail = searchParams.get("to") || process.env.BREVO_SENDER_EMAIL;
  const results: Record<string, unknown> = {};

  results.brevoKey = process.env.BREVO_API_KEY
    ? "present (" + process.env.BREVO_API_KEY.slice(0, 12) + "...)"
    : "MISSING";
  results.senderEmail = process.env.BREVO_SENDER_EMAIL || "MISSING";
  results.senderName = process.env.BREVO_SENDER_NAME || "MISSING";

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    results.error = "Missing BREVO_API_KEY or BREVO_SENDER_EMAIL";
    return NextResponse.json(results, { status: 500 });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: "Caba Residence" },
        to: [{ email: toEmail }],
        subject: "Test Caba Residence",
        htmlContent: "<p>Test email from Caba Residence API</p>",
        textContent: "Test email from Caba Residence API",
      }),
    });

    results.httpStatus = response.status;
    results.sentTo = toEmail;
    const body = await response.text();
    results.responseBody = body;
  } catch (err) {
    results.fetchError = String(err);
  }

  return NextResponse.json(results, { status: 200 });
}
