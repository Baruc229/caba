import { BrevoClient } from "@getbrevo/brevo";

let client: BrevoClient | null = null;

function getClient(): BrevoClient {
  if (!client) {
    client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
  }
  return client;
}

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams): Promise<boolean> {
  try {
    const brevo = getClient();
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL!,
        name: process.env.BREVO_SENDER_NAME || "Caba Residence",
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    });
    return true;
  } catch (error) {
    console.error("[EMAIL] Brevo send error:", error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  prenom: string,
  verifyToken: string
): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://caba-five.vercel.app";
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${verifyToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f7f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:14px;border:1px solid #eae6de;overflow:hidden;box-shadow:0 24px 48px -12px rgba(31,26,20,.28),0 6px 16px -6px rgba(31,26,20,.12);">
        <div style="padding:36px 32px 28px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#d21034;">Caba Résidence</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#1a1a1a;">Bienvenue ${prenom}</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.55;color:#6b6459;">
            Merci pour votre inscription. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;padding:14px 36px;border-radius:999px;background-color:#d21034;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
            Vérifier mon email
          </a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#6b6459;">
            Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
          </p>
        </div>
        <div style="padding:18px 32px;border-top:1px solid #eae6de;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a29a8c;">
            © ${new Date().getFullYear()} Caba Résidence — Cotonou, Bénin
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject: "Vérifiez votre email — Caba Résidence", htmlContent });
}
