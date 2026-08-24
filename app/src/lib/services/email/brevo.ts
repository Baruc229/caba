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

export function templateResetPassword(params: { prenom: string; lien: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f7f5f1; padding: 30px; text-align: center;">
    <h1 style="color: #001489; margin: 0;">Caba Résidence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Mot de passe oublié</h2>
    <p>Bonjour ${params.prenom},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien est valable <strong>1 heure</strong> et ne peut être utilisé qu'une seule fois.</p>
    <a href="${params.lien}" style="display: inline-block; background: #d21034; color: white; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-weight: bold;">Choisir un nouveau mot de passe</a>
    <p style="margin-top: 25px; color: #6b6459; font-size: 13px;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe actuel reste inchangé.</p>
  </div>
</body>
</html>`;
}

export function templateInvitationInterne(params: {
  prenom: string;
  role: string;
  lien: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
  <div style="background: #f7f5f1; padding: 30px; text-align: center;">
    <h1 style="color: #001489; margin: 0;">Caba Résidence</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Vous avez été invité(e)</h2>
    <p>Bonjour ${params.prenom},</p>
    <p>Un compte a été créé pour vous sur le back-office de Caba Résidence avec le rôle <strong>${params.role}</strong>.</p>
    <p>Cliquez ci-dessous pour définir votre mot de passe et activer votre accès. Ce lien est valable <strong>72 heures</strong>.</p>
    <a href="${params.lien}" style="display: inline-block; background: #d21034; color: white; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-weight: bold;">Définir mon mot de passe</a>
    <p style="margin-top: 25px; color: #6b6459; font-size: 13px;">Si vous ne devriez pas recevoir cet email, ignorez-le.</p>
  </div>
</body>
</html>`;
}

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
