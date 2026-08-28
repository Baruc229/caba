const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getApiKey(): string {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error("BREVO_API_KEY manquante");
  return key;
}

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail({ to, subject, htmlContent, textContent }: SendEmailParams): Promise<boolean> {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": getApiKey(),
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL!,
          name: process.env.BREVO_SENDER_NAME || "Caba Residence",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || subject,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[EMAIL] Brevo API error:", response.status, body);
      return false;
    }

    console.log("[EMAIL] Sent OK to:", to);
    return true;
  } catch (error) {
    console.error("[EMAIL] Brevo fetch error:", error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  prenom: string,
  verifyToken: string
): Promise<{ sent: boolean; verifyUrl: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://caba-five.vercel.app";
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${verifyToken}`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f5f1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f1;padding:32px 16px 24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #eae6de;overflow:hidden;">
          <!-- Marque -->
          <tr>
            <td align="center" style="padding:34px 32px 0;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#d21034;">Caba Résidence</span>
            </td>
          </tr>
          <!-- Titre -->
          <tr>
            <td align="center" style="padding:12px 32px 0;">
              <h1 style="margin:0;font-family:'Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:26px;line-height:1.05;letter-spacing:.02em;text-transform:uppercase;font-style:italic;color:#1a1a1a;">Bienvenue,<br/>${prenom}</h1>
            </td>
          </tr>
          <!-- Intro -->
          <tr>
            <td align="center" style="padding:18px 32px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#6b6459;">
                Merci pour votre inscription. Il ne reste qu'une étape :<br/>
                confirmez votre adresse email pour activer votre compte.
              </p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td align="center" style="padding:26px 32px 0;">
              <a href="${verifyUrl}" style="display:inline-block;padding:15px 40px;border-radius:999px;background:#001489;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:.01em;">Vérifier mon email</a>
            </td>
          </tr>
          <!-- Lien fallback (sans afficher l'URL contenant le token) -->
          <tr>
            <td align="center" style="padding:14px 32px 0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a29a8c;">
                Si le bouton ne fonctionne pas,
                <a href="${verifyUrl}" style="color:#001489;text-decoration:underline;">vérifiez votre email en cliquant ici</a>.
              </p>
            </td>
          </tr>
          <!-- Info expiration -->
          <tr>
            <td align="center" style="padding:22px 32px 0;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:#6b6459;">
                Ce lien expire dans <strong>24 heures</strong>.<br/>
                Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
              </p>
            </td>
          </tr>
          <!-- Pied -->
          <tr>
            <td align="center" style="padding:26px 32px 22px;background:#ffffff;">
              <div style="width:100%;border-top:1px solid #eae6de;margin:0 0 18px;"></div>
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#001489;">Caba Résidence</p>
              <p style="margin:0;font-size:12px;color:#a29a8c;">Cotonou, Bénin — © ${new Date().getFullYear()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textContent = `Bienvenue ${prenom}\n\nVérifiez votre email en cliquant sur ce lien :\n${verifyUrl}\n\nCe lien expire dans 24 heures.`;

  const sent = await sendEmail({ to: email, subject: "Vérifiez votre email — Caba Résidence", htmlContent, textContent });

  return { sent, verifyUrl };
}
