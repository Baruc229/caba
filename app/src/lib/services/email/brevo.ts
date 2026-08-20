const BREVO_API = "https://api.brevo.com/v3";

interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey === "votre-cle-api-brevo-ici") {
    console.warn("[Brevo] Cle API non configuree — email non envoye");
    return false;
  }

  try {
    const response = await fetch(`${BREVO_API}/smtp/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL || "noreply@caba-residence.com",
          name: process.env.BREVO_SENDER_NAME || "Caba Residence",
        },
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent || "",
        replyTo: params.replyTo || undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Brevo] Erreur envoi:", response.status, err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Brevo] Erreur reseau:", error);
    return false;
  }
}

// ─── Templates ─────────────────────────────────────

export function templateBookingConfirmation(params: {
  prenom: string;
  numero: string;
  propertyNom: string;
  dateArrivee: string;
  dateDepart: string;
  voyageurs: string;
  montant: string;
  devise: string;
  lien: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin: 0;">Caba Residence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Confirmation de reservation</h2>
    <p>Bonjour ${params.prenom},</p>
    <p>Votre reservation <strong>${params.numero}</strong> est confirmee !</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Logement :</strong> ${params.propertyNom}</p>
      <p><strong>Arrivee :</strong> ${params.dateArrivee}</p>
      <p><strong>Depart :</strong> ${params.dateDepart}</p>
      <p><strong>Voyageurs :</strong> ${params.voyageurs}</p>
      <p><strong>Total :</strong> ${params.montant} ${params.devise}</p>
    </div>
    <a href="${params.lien}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir ma reservation</a>
    <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">Nous vous attendons avec impatience !<br>Caba Residence</p>
  </div>
</body>
</html>`;
}

export function templateArrivalReminder(params: {
  prenom: string;
  propertyNom: string;
  dateArrivee: string;
  heureArrivee: string;
  adresse: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin: 0;">Caba Residence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Rappel : votre arrivee demain</h2>
    <p>Bonjour ${params.prenom},</p>
    <p>Nous vous rappelons que votre arrivee est prevue <strong>demain</strong>.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Logement :</strong> ${params.propertyNom}</p>
      <p><strong>Date :</strong> ${params.dateArrivee}</p>
      <p><strong>Heure :</strong> ${params.heureArrivee}</p>
      <p><strong>Adresse :</strong> ${params.adresse}</p>
    </div>
    <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">A demain !<br>Caba Residence</p>
  </div>
</body>
</html>`;
}

export function templateDepartureReminder(params: {
  prenom: string;
  propertyNom: string;
  dateDepart: string;
  heureDepart: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin: 0;">Caba Residence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Rappel : votre depart demain</h2>
    <p>Bonjour ${params.prenom},</p>
    <p>Nous vous rappelons que votre depart est prevu <strong>demain</strong>.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Logement :</strong> ${params.propertyNom}</p>
      <p><strong>Date :</strong> ${params.dateDepart}</p>
      <p><strong>Heure :</strong> ${params.heureDepart}</p>
    </div>
    <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">Merci et a bientot !<br>Caba Residence</p>
  </div>
</body>
</html>`;
}

export function templateNewBookingAdmin(params: {
  numero: string;
  clientNom: string;
  propertyNom: string;
  dateArrivee: string;
  dateDepart: string;
  voyageurs: string;
  montant: string;
  devise: string;
  source: string;
  lien: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin: 0;">Caba Residence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Nouvelle reservation</h2>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Numero :</strong> ${params.numero}</p>
      <p><strong>Client :</strong> ${params.clientNom}</p>
      <p><strong>Logement :</strong> ${params.propertyNom}</p>
      <p><strong>Dates :</strong> ${params.dateArrivee} au ${params.dateDepart}</p>
      <p><strong>Voyageurs :</strong> ${params.voyageurs}</p>
      <p><strong>Montant :</strong> ${params.montant} ${params.devise}</p>
      <p><strong>Source :</strong> ${params.source}</p>
    </div>
    <a href="${params.lien}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Consulter</a>
  </div>
</body>
</html>`;
}

export function templatePaymentConfirmation(params: {
  prenom: string;
  numero: string;
  montant: string;
  devise: string;
  lien: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin: 0;">Caba Residence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Paiement recu</h2>
    <p>Bonjour ${params.prenom},</p>
    <p>Nous avons bien recu votre paiement de <strong>${params.montant} ${params.devise}</strong> pour la reservation <strong>${params.numero}</strong>.</p>
    <a href="${params.lien}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">Voir ma reservation</a>
  </div>
</body>
</html>`;
}

export function templateCancellation(params: {
  prenom: string;
  numero: string;
  propertyNom: string;
  dates: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 30px; text-align: center;">
    <h1 style="color: #2563eb; margin: 0;">Caba Residence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Reservation annulee</h2>
    <p>Bonjour ${params.prenom},</p>
    <p>Votre reservation <strong>${params.numero}</strong> pour <strong>${params.propertyNom}</strong> (${params.dates}) a ete annulee.</p>
    <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">Caba Residence</p>
  </div>
</body>
</html>`;
}
