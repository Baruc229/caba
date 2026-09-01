import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { checkAvailability } from "./availability";
import { calculatePrice } from "./pricing";
import { acquireTemporaryLock } from "./availability";
import { sendVerificationEmail, sendBookingConfirmationEmail } from "@/lib/email";
import { notifyNewBooking, notifyPaymentReceived } from "./notifications";
import type { BookingType, BookingSource } from "@/generated/prisma/client";

export interface CheckoutParams {
  propertyId: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  typeReservation: BookingType;
  adults: number;
  children?: number;
  babies?: number;
  source?: BookingSource;
}

export interface CheckoutAccountParams extends CheckoutParams {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  telephone?: string;
  cgvAcceptees: boolean;
  baseUrl: string;
}

export async function createCheckoutAccount(
  params: CheckoutAccountParams
): Promise<{ success: boolean; error?: string; user?: { id: string; email: string }; lockId?: string }> {
  const {
    propertyId, startDate, endDate, startTime, endTime, typeReservation,
    adults, children = 0, babies = 0,
    email, password, prenom, nom, telephone, cgvAcceptees, baseUrl,
  } = params;

  if (!email || !password || !nom || !prenom) {
    return { success: false, error: "Tous les champs obligatoires doivent etre remplis" };
  }
  if (typeof password !== "string" || password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return { success: false, error: "Le mot de passe doit contenir au moins 8 caracteres, une majuscule et un chiffre" };
  }
  if (!cgvAcceptees) {
    return { success: false, error: "Vous devez accepter les CGV et la politique de confidentialite" };
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return { success: false, error: "Un compte existe deja avec cet email" };
  }

  const availability = await checkAvailability({
    propertyId, startDate, endDate, startTime, endTime,
    typeReservation, adults, children, babies,
  });
  if (!availability.available) {
    return { success: false, error: availability.reason };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verifyToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      nom,
      prenom,
      telephone: telephone || null,
      role: "client",
      actif: true,
      emailConfirme: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpire: new Date(Date.now() + 24 * 60 * 60 * 1000),
      cgvAccepteesAt: new Date(),
    },
  });

  const lock = await acquireTemporaryLock({
    propertyId, clientId: user.id, startDate, endDate,
    startTime, endTime, typeReservation, adults, children, babies,
  });

  if (!lock.success || !lock.lockId) {
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    return { success: false, error: lock.error || "Impossible de verrouiller le creneau" };
  }

  await sendVerificationEmail(normalizedEmail, prenom, verifyToken, baseUrl);

  return { success: true, user: { id: user.id, email: normalizedEmail }, lockId: lock.lockId };
}

export interface FinalizePaymentParams {
  lockId: string;
  clientId: string;
}

export async function finalizeCheckoutPayment(
  params: FinalizePaymentParams
): Promise<{ success: boolean; error?: string; booking?: { id: string; numero: string; statut: string; prixTotal: number; devise: string } }> {
  const { lockId, clientId } = params;

  const lock = await prisma.booking.findUnique({ where: { id: lockId } });
  if (!lock) return { success: false, error: "Reservation introuvable" };
  if (lock.clientId !== clientId) return { success: false, error: "Acces refuse" };
  if (lock.statut !== "reservation_temporaire") {
    return { success: false, error: "Cette reservation a deja ete finalisee" };
  }
  if (lock.dateArrivee.getTime() <= Date.now()) {
    return { success: false, error: "Ce creneau est expire" };
  }

  const price = await calculatePrice({
    propertyId: lock.propertyId,
    startDate: lock.dateArrivee,
    endDate: lock.dateDepart,
    startTime: lock.heureArrivee || undefined,
    endTime: lock.heureDepart || undefined,
    typeReservation: lock.typeReservation as BookingType,
    adults: lock.nombreAdultes,
    children: lock.nombreEnfants,
    babies: lock.nombreBebes,
  });

  const numero = `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;

  const booking = await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: lockId },
      data: {
        numero,
        statut: "payee",
        prixSejour: price.subtotal,
        fraisMenage: price.cleaningFee,
        taxeSejour: price.cityTax,
        supplements: price.supplements,
        reductions: price.discount,
        prixTotal: price.total,
        devise: price.currency,
      },
    });

    await tx.bookingHistory.create({
      data: { reservationId: lockId, action: "confirmation", details: JSON.parse(JSON.stringify({ price, reference: numero })) },
    });

    await tx.paiement.create({
      data: {
        numero: `PAY-${Date.now().toString(36).toUpperCase()}`,
        reservationId: lockId,
        montant: price.total,
        devise: price.currency,
        statut: "confirme",
        moyenPaiement: "autre",
        referenceExterne: `STUB-${crypto.randomBytes(8).toString("hex")}`,
        datePaiement: new Date(),
      },
    });

    return updated;
  });

  notifyNewBooking(lockId);
  notifyPaymentReceived(lockId);

  const client = await prisma.user.findUnique({
    where: { id: lock.clientId },
    select: { email: true, prenom: true },
  });
  if (client) {
    await sendBookingConfirmationEmail({
      to: client.email,
      prenom: client.prenom,
      numero,
      prixTotal: Number(booking.prixTotal),
      devise: booking.devise,
    });
  }

  return {
    success: true,
    booking: {
      id: booking.id,
      numero: booking.numero,
      statut: booking.statut,
      prixTotal: Number(booking.prixTotal),
      devise: booking.devise,
    },
  };
}
