"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { DocumentTitle } from "@/components/seo/document-title";
import { convertAmount } from "@/lib/i18n/currency";

export interface ConfirmationBooking {
  numero: string;
  statut: string;
  propertyNom: string;
  propertyType: string;
  ville: string;
  pays: string;
  photo: string | null;
  dateArrivee: string;
  dateDepart: string;
  nombreAdultes: number;
  nombreEnfants: number;
  nombreBebes: number;
  prixSejour: number;
  fraisMenage: number;
  taxeSejour: number;
  supplements: number;
  reductions: number;
  prixTotal: number;
  devise: string;
}

export function ConfirmationClient({ booking }: { booking: ConfirmationBooking }) {
  const { lang, t, currency } = useApp();

  const lDates = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const fmt = (n: number) =>
    lang === "fr" ? n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const typeLabel = booking.propertyType.replace(/_/g, " ");

  return (
    <section className="container-caba py-12">
      <DocumentTitle titleKey="meta.confirmationTitle" />
      <div className="confirmation-box">
        <div className="confirmation-check">✓</div>
        <p className="checkout-eyebrow">{t("checkout.eyebrow")}</p>
        <h1 className="confirmation-title">{t("confirmation.title")}</h1>
        <p className="confirmation-ref">
          {t("confirmation.reference")} <strong>{booking.numero}</strong>
        </p>

        <div className="confirmation-property">
          {booking.photo && (
            <div className="checkout-property-imgwrap">
              <img src={booking.photo} alt={booking.propertyNom} className="checkout-property-img" />
            </div>
          )}
          <div>
            <span className="checkout-property-type">{typeLabel}</span>
            <h2 className="checkout-property-name">{booking.propertyNom}</h2>
            <p className="checkout-property-meta">{booking.ville}, {booking.pays}</p>
          </div>
        </div>

        <div className="checkout-dates">
          <div className="checkout-dates-row">
            <span>{t("confirmation.arrivee")}</span>
            <strong>{lDates(booking.dateArrivee)}</strong>
          </div>
          <div className="checkout-dates-row">
            <span>{t("confirmation.depart")}</span>
            <strong>{lDates(booking.dateDepart)}</strong>
          </div>
          <div className="checkout-dates-row">
            <span>{t("checkout.guests")}</span>
            <strong>
              {booking.nombreAdultes} {t("checkout.adultes")}, {booking.nombreEnfants} {t("checkout.enfants")}, {booking.nombreBebes} {t("checkout.bebes")}
            </strong>
          </div>
        </div>

        <div className="checkout-price">
          <div className="checkout-price-row">
            <span>{t("checkout.subtotal")}</span>
            <strong>{fmt(convertAmount(booking.prixSejour, booking.devise, currency))} {currency}</strong>
          </div>
          {booking.fraisMenage > 0 && (
            <div className="checkout-price-row">
              <span>{t("checkout.cleaningFee")}</span>
              <strong>{fmt(convertAmount(booking.fraisMenage, booking.devise, currency))} {currency}</strong>
            </div>
          )}
          {booking.taxeSejour > 0 && (
            <div className="checkout-price-row">
              <span>{t("checkout.cityTax")}</span>
              <strong>{fmt(convertAmount(booking.taxeSejour, booking.devise, currency))} {currency}</strong>
            </div>
          )}
          {booking.supplements > 0 && (
            <div className="checkout-price-row">
              <span>{t("checkout.supplements")}</span>
              <strong>{fmt(convertAmount(booking.supplements, booking.devise, currency))} {currency}</strong>
            </div>
          )}
          {booking.reductions > 0 && (
            <div className="checkout-price-row checkout-price-row--discount">
              <span>{t("checkout.discount")}</span>
              <strong>−{fmt(convertAmount(booking.reductions, booking.devise, currency))} {currency}</strong>
            </div>
          )}
          <div className="checkout-price-row checkout-price-row--total">
            <span>{t("checkout.total")}</span>
            <strong>{fmt(convertAmount(booking.prixTotal, booking.devise, currency))} {currency}</strong>
          </div>
        </div>

        <p className="confirmation-email-note">
          {t("confirmation.emailSent")} <strong>{booking.numero}</strong>.
        </p>

        <div className="confirmation-actions">
          <Link href="/compte/reservations" className="btn-pill btn-primary">
            {t("confirmation.viewBookings")}
          </Link>
          <Link href="/logements" className="btn-pill btn-outline">
            {t("confirmation.browseMore")}
          </Link>
        </div>
      </div>
    </section>
  );
}
