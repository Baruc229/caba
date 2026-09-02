"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { convertAmount, formatAmount } from "@/lib/i18n/currency";

export interface CheckoutProperty {
  id: string;
  nom: string;
  type: string;
  ville: string;
  pays: string;
  photo: string | null;
  tarifBase: number | null;
  devise: string;
  noteMoyenne: number | null;
  nombreAvis: number;
}

export interface CheckoutDates {
  arrivee: string;
  depart: string;
  heureArrivee: string;
  heureDepart: string;
  typeReservation: string;
  adultes: number;
  enfants: number;
  bebes: number;
}

export interface CheckoutSession {
  id?: string | null;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  emailConfirme?: boolean;
}

const TYPE_LABEL_KEYS: Record<string, string> = {
  nuee: "checkout.typeNuee",
  journee: "checkout.typeJournee",
  vingt_quatre_heures: "checkout.type24h",
  demi_journee: "checkout.typeDemiJournee",
  heure: "checkout.typeHeure",
  plusieurs_heures: "checkout.typePlusieursHeures",
  semaine: "checkout.typeSemaine",
  mois: "checkout.typeMois",
};

export function CheckoutClient({
  property,
  defaultDates,
  session,
  initialLockId,
}: {
  property: CheckoutProperty;
  defaultDates: CheckoutDates;
  session: CheckoutSession;
  initialLockId?: string;
}) {
  const { lang, t, currency } = useApp();
  const router = useRouter();

  const [dates] = useState<CheckoutDates>(defaultDates);
  const [price, setPrice] = useState<{
    total: number;
    currency: string;
    subtotal: number;
    cleaningFee: number;
    cityTax: number;
    supplements: number;
    discount: number;
  } | null>(null);

  // États compte
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cgvAcceptees, setCgvAcceptees] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needVerify, setNeedVerify] = useState<{ email: string; lockId: string } | null>(null);

  const isConnected = Boolean(session.id);
  const isVerified = session.emailConfirme === true;

  const typeLabel = property.type.replace(/_/g, " ");
  const formattedBase =
    property.tarifBase != null && property.tarifBase > 0
      ? formatAmount(convertAmount(property.tarifBase, property.devise, currency), lang)
      : null;

  const validDates = Boolean(dates.arrivee && dates.depart);

  // URL de retour au checkout après vérification d'email (pour le bouton "Vérifier mon email").
  const checkoutReturnUrl = `/logements/${property.id}/reserver?arrivee=${encodeURIComponent(dates.arrivee)}&depart=${encodeURIComponent(dates.depart)}&heureArrivee=${encodeURIComponent(dates.heureArrivee)}&heureDepart=${encodeURIComponent(dates.heureDepart)}&typeReservation=${encodeURIComponent(dates.typeReservation)}&adultes=${dates.adultes}&enfants=${dates.enfants}&bebes=${dates.bebes}`;

  useEffect(() => {
    if (!validDates) return;
    let actif = true;
    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: property.id,
        startDate: dates.arrivee,
        endDate: dates.depart,
        startTime: dates.heureArrivee,
        endTime: dates.heureDepart,
        typeReservation: dates.typeReservation,
        adults: dates.adultes,
        children: dates.enfants,
        babies: dates.bebes,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (actif && data && typeof data.total === "number") {
          setPrice(data);
        }
      })
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, [dates, property.id, validDates]);

  async function handleAccountSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validDates) {
      setError(t("checkout.errDates"));
      return;
    }
    if (!email || !password || !prenom || !nom) {
      setError(t("checkout.errAccount"));
      return;
    }
    if (!cgvAcceptees) {
      setError(t("checkout.errCgv"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          startDate: dates.arrivee,
          endDate: dates.depart,
          startTime: dates.heureArrivee || undefined,
          endTime: dates.heureDepart || undefined,
          typeReservation: dates.typeReservation,
          adults: dates.adultes,
          children: dates.enfants,
          babies: dates.bebes,
          email,
          password,
          prenom,
          nom,
          cgvAcceptees,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("checkout.errGeneric"));
        setSubmitting(false);
        return;
      }
      setNeedVerify({ email, lockId: data.lockId });
    } catch {
      setError(t("checkout.errGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (isConnected && !isVerified) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      if (needVerify?.lockId || initialLockId) {
        payload.lockId = needVerify?.lockId ?? initialLockId;
      } else {
        payload.propertyId = property.id;
        payload.startDate = dates.arrivee;
        payload.endDate = dates.depart;
        payload.startTime = dates.heureArrivee || undefined;
        payload.endTime = dates.heureDepart || undefined;
        payload.typeReservation = dates.typeReservation;
        payload.adults = dates.adultes;
        payload.children = dates.enfants;
        payload.babies = dates.bebes;
      }

      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("checkout.errGeneric"));
        setSubmitting(false);
        return;
      }
      router.push(`/confirmation/${data.numero}`);
    } catch {
      setError(t("checkout.errGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  // Écran « vérifiez votre email » — ne s'affiche que si l'utilisateur n'est
  // pas déjà vérifié (état local perdu après une vérification dans un autre onglet).
  if (needVerify && !(isConnected && isVerified)) {
    return (
      <section className="container-caba py-12">
        <div className="checkout-box">
          <p className="checkout-eyebrow">{t("checkout.eyebrow")}</p>
          <h1 className="checkout-title">{t("checkout.verifyTitle")}</h1>
          <p className="checkout-text">
            {t("checkout.verifyIntro")} <strong>{needVerify.email}</strong>.{" "}
            {t("checkout.verifyDetail")}
          </p>
          <p className="checkout-text">{t("checkout.lockHeld")}</p>
          <div className="checkout-actions">
            <Link
              href={`/verification?next=${encodeURIComponent(`${checkoutReturnUrl}&lockId=${needVerify.lockId}`)}`}
              className="btn-pill btn-primary"
            >
              {t("checkout.goVerify")}
            </Link>
          </div>
          <p className="checkout-note">{t("checkout.verifyAfter")}</p>
          <button type="button" className="btn-pill btn-outline" onClick={() => router.push(`/logements/${property.id}`)}>
            {t("checkout.cancel")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-caba py-12">
      <div className="checkout-grid">
        {/* Récapitulatif logement */}
        <div className="checkout-recap">
          <p className="checkout-eyebrow">{t("checkout.eyebrow")}</p>
          <h1 className="checkout-title">{t("checkout.title")}</h1>

          <div className="checkout-property">
            <div className="checkout-property-imgwrap">
              {property.photo ? (
                <img src={property.photo} alt={property.nom} className="checkout-property-img" />
              ) : (
                <div className="checkout-property-img checkout-property-img--none">{property.nom}</div>
              )}
            </div>
            <div>
              <span className="checkout-property-type">{typeLabel}</span>
              <h2 className="checkout-property-name">{property.nom}</h2>
              <p className="checkout-property-meta">
                {property.ville}, {property.pays}
              </p>
              {property.noteMoyenne !== null && (
                <p className="checkout-property-meta">
                  ★ {property.noteMoyenne} ({property.nombreAvis})
                </p>
              )}
            </div>
          </div>

          <div className="checkout-dates">
            <div className="checkout-dates-row">
              <span>{t("checkout.arrivee")}</span>
              <strong>{dates.arrivee ? new Date(dates.arrivee).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB") : "—"}</strong>
            </div>
            <div className="checkout-dates-row">
              <span>{t("checkout.depart")}</span>
              <strong>{dates.depart ? new Date(dates.depart).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB") : "—"}</strong>
            </div>
            <div className="checkout-dates-row">
              <span>{t("checkout.type")}</span>
              <strong>{t(TYPE_LABEL_KEYS[dates.typeReservation] ?? "checkout.typeNuee")}</strong>
            </div>
            <div className="checkout-dates-row">
              <span>{t("checkout.guests")}</span>
              <strong>
                {dates.adultes} {t("checkout.adultes")}, {dates.enfants} {t("checkout.enfants")}, {dates.bebes} {t("checkout.bebes")}
              </strong>
            </div>
          </div>

          {price ? (
            <div className="checkout-price">
              <div className="checkout-price-row">
                <span>{t("checkout.subtotal")}</span>
                <strong>{formatAmount(convertAmount(price.subtotal, price.currency, currency), lang)}</strong>
              </div>
              {price.cleaningFee > 0 && (
                <div className="checkout-price-row">
                  <span>{t("checkout.cleaningFee")}</span>
                  <strong>{formatAmount(convertAmount(price.cleaningFee, price.currency, currency), lang)}</strong>
                </div>
              )}
              {price.cityTax > 0 && (
                <div className="checkout-price-row">
                  <span>{t("checkout.cityTax")}</span>
                  <strong>{formatAmount(convertAmount(price.cityTax, price.currency, currency), lang)}</strong>
                </div>
              )}
              {price.supplements > 0 && (
                <div className="checkout-price-row">
                  <span>{t("checkout.supplements")}</span>
                  <strong>{formatAmount(convertAmount(price.supplements, price.currency, currency), lang)}</strong>
                </div>
              )}
              {price.discount > 0 && (
                <div className="checkout-price-row checkout-price-row--discount">
                  <span>{t("checkout.discount")}</span>
                  <strong>−{formatAmount(convertAmount(price.discount, price.currency, currency), lang)}</strong>
                </div>
              )}
              <div className="checkout-price-row checkout-price-row--total">
                <span>{t("checkout.total")}</span>
                <strong>{formatAmount(convertAmount(price.total, price.currency, currency), lang)} {currency}</strong>
              </div>
            </div>
          ) : (
            <p className="checkout-note">
              {formattedBase ? t("checkout.basePrice") + " " + formattedBase : t("checkout.noticesValid")}
            </p>
          )}
        </div>

        {/* Formulaire */}
        <div className="checkout-form">
          {!isConnected ? (
            <form onSubmit={handleAccountSubmit} className="checkout-card">
              <h3 className="checkout-form-title">{t("checkout.accountTitle")}</h3>

              <label className="checkout-field">
                <span className="checkout-label">{t("checkout.prenom")}</span>
                <input
                  className="checkout-input"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-label">{t("checkout.nom")}</span>
                <input
                  className="checkout-input"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-label">{t("checkout.email")}</span>
                <input
                  type="email"
                  className="checkout-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-label">{t("checkout.password")}</span>
                <input
                  type="password"
                  className="checkout-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="checkout-cgv">
                <input
                  type="checkbox"
                  checked={cgvAcceptees}
                  onChange={(e) => setCgvAcceptees(e.target.checked)}
                />
                <span>{t("checkout.cgvLabel")}</span>
              </label>

              {error && <p role="alert" className="checkout-error">{error}</p>}

              <button type="submit" className="btn-pill btn-primary checkout-submit" disabled={submitting}>
                {submitting ? t("checkout.creating") : t("checkout.createAndContinue")}
              </button>
              <p className="checkout-note">{t("checkout.verifyAfter")}</p>
            </form>
          ) : !isVerified ? (
            <div className="checkout-card">
              <h3 className="checkout-form-title">{t("checkout.notVerifiedTitle")}</h3>
              <p className="checkout-text">{t("checkout.notVerifiedText")}</p>
              <div className="checkout-actions">
                <Link href={`/verification?next=${encodeURIComponent(checkoutReturnUrl)}`} className="btn-pill btn-primary">
                  {t("checkout.goVerify")}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePay} className="checkout-card">
              <h3 className="checkout-form-title">{t("checkout.paymentTitle")}</h3>
              <div className="checkout-connected-info">
                <strong>{session.prenom} {session.nom}</strong>
                <span>{session.email}</span>
              </div>
              {error && <p role="alert" className="checkout-error">{error}</p>}
              <button type="submit" className="btn-pill btn-primary checkout-submit" disabled={submitting}>
                {submitting ? t("checkout.paying") : t("checkout.payNow")}
              </button>
              <p className="checkout-note">{t("checkout.stubNote")}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
