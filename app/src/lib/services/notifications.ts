import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      utilisateurId: params.userId,
      type: params.type,
      titre: params.title,
      message: params.message,
      lien: params.link || null,
      donnees: params.data ? JSON.parse(JSON.stringify(params.data)) : null,
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { utilisateurId: userId, lue: false },
  });
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { lue: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { utilisateurId: userId, lue: false },
    data: { lue: true },
  });
}

// ─── Notifications specifiques ────────────────────

export async function notifyNewBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { nom: true } },
      client: { select: { prenom: true, nom: true } },
    },
  });

  if (!booking) return;

  const admins = await prisma.user.findMany({
    where: { role: { in: ["administrateur", "gestionnaire"] }, actif: true },
    select: { id: true },
  });

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "nouvelle_reservation",
      title: `Nouvelle reservation ${booking.numero}`,
      message: `${booking.client.prenom} ${booking.client.nom} a reserve ${booking.property.nom} du ${booking.dateArrivee.toLocaleDateString("fr-FR")} au ${booking.dateDepart.toLocaleDateString("fr-FR")}`,
      link: `/admin/reservations/${booking.id}`,
      data: { bookingId: booking.id },
    });
  }
}

export async function notifyPaymentReceived(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { nom: true } },
      client: { select: { id: true, prenom: true, nom: true } },
    },
  });

  if (!booking) return;

  // Notifier le client
  await createNotification({
    userId: booking.client.id,
    type: "paiement",
    title: "Paiement recu",
    message: `Votre paiement de ${Number(booking.prixTotal)} ${booking.devise} pour la reservation ${booking.numero} a ete recu.`,
    link: `/espace-client/reservations/${booking.id}`,
  });

  // Notifier les admins
  const admins = await prisma.user.findMany({
    where: { role: { in: ["administrateur", "comptabilite"] }, actif: true },
    select: { id: true },
  });
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "paiement",
      title: `Paiement recu - ${booking.numero}`,
      message: `${Number(booking.prixTotal)} ${booking.devise} recus de ${booking.client.prenom} ${booking.client.nom}`,
      link: `/admin/reservations/${booking.id}`,
    });
  }
}

export async function notifyCancellation(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { nom: true } },
      client: { select: { id: true, prenom: true, nom: true } },
    },
  });

  if (!booking) return;

  await createNotification({
    userId: booking.client.id,
    type: "annulation",
    title: "Reservation annulee",
    message: `Votre reservation ${booking.numero} pour ${booking.property.nom} a ete annulee.`,
    link: `/espace-client/reservations/${booking.id}`,
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["administrateur", "gestionnaire"] }, actif: true },
    select: { id: true },
  });
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "annulation",
      title: `Annulation - ${booking.numero}`,
      message: `Reservation de ${booking.client.prenom} ${booking.client.nom} annulee.`,
      link: `/admin/reservations/${booking.id}`,
    });
  }
}

export async function notifyModification(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { nom: true } },
      client: { select: { id: true, prenom: true, nom: true } },
    },
  });

  if (!booking) return;

  await createNotification({
    userId: booking.client.id,
    type: "modification",
    title: "Reservation modifiee",
    message: `Votre reservation ${booking.numero} pour ${booking.property.nom} a ete modifiee.`,
    link: `/espace-client/reservations/${booking.id}`,
  });
}

export async function notifyNewReview(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      client: { select: { prenom: true, nom: true } },
      property: { select: { nom: true } },
    },
  });

  if (!review) return;

  const admins = await prisma.user.findMany({
    where: { role: { in: ["administrateur", "gestionnaire"] }, actif: true },
    select: { id: true },
  });

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "nouvel_avis",
      title: `Nouvel avis - ${review.property.nom}`,
      message: `${review.client.prenom} ${review.client.nom} a laisse un avis (${review.note}/5) sur ${review.property.nom}.`,
      link: `/admin/logements/${review.propertyId}`,
    });
  }
}

export async function notifyIcalError(syncId: string, propertyName: string, errorMsg: string) {
  const admins = await prisma.user.findMany({
    where: { role: "administrateur", actif: true },
    select: { id: true },
  });

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "erreur_sync",
      title: "Erreur de synchronisation iCal",
      message: `La synchronisation pour ${propertyName} a echoue : ${errorMsg}`,
      link: "/admin/ical",
    });
  }
}

// ─── Rappels arrivee/depart (a appeler via cron) ──

export async function sendArrivalReminders(): Promise<number> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      dateArrivee: { gte: tomorrow, lt: dayAfter },
      statut: { in: ["confirmee", "payee"] },
    },
    include: {
      property: { select: { nom: true, adresse: true } },
      client: { select: { id: true, prenom: true } },
    },
  });

  let sent = 0;
  for (const b of bookings) {
    await createNotification({
      userId: b.client.id,
      type: "rappel_arrivee",
      title: "Rappel : votre arrivee demain",
      message: `Votre arrivee au ${b.property.nom} est prevue demain.`,
      link: `/espace-client/reservations/${b.id}`,
    });
    sent++;
  }

  return sent;
}

export async function sendDepartureReminders(): Promise<number> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      dateDepart: { gte: tomorrow, lt: dayAfter },
      statut: { in: ["confirmee", "payee"] },
    },
    include: {
      property: { select: { nom: true } },
      client: { select: { id: true, prenom: true } },
    },
  });

  let sent = 0;
  for (const b of bookings) {
    await createNotification({
      userId: b.client.id,
      type: "rappel_depart",
      title: "Rappel : votre depart demain",
      message: `Votre depart du ${b.property.nom} est prevu demain.`,
      link: `/espace-client/reservations/${b.id}`,
    });
    sent++;
  }

  return sent;
}
