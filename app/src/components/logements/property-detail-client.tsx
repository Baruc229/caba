"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaClock, FaShareNodes, FaHeart, FaArrowLeft } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { useApp } from "@/components/providers/app-provider";
import { DoubleMonthCalendar } from "@/components/logements/double-month-calendar";
import { ReservationDatePicker } from "@/components/logements/reservation-date-picker";
import { PropertyMap } from "@/components/logements/property-map";
import { GuestsField } from "@/components/ui/guests-field";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { formatISODate, nightsBetween } from "@/lib/calendar-utils";
import { convertAmount, formatAmount } from "@/lib/i18n/currency";
import type { IconType } from "react-icons";
import {
  FaBath,
  FaBed,
  FaCar,
  FaCircleCheck,
  FaCube,
  FaFireBurner,
  FaKitchenSet,
  FaPersonSwimming,
  FaPlug,
  FaPumpSoap,
  FaShower,
  FaSnowflake,
  FaSquareParking,
  FaTv,
  FaUtensils,
  FaWater,
  FaWifi,
} from "react-icons/fa6";

const SEJOUR_ENTRIES: [string, string][] = [
  ["nuee", "sejourNuee"],
  ["journee", "sejourJournee"],
  ["vingt_quatre_heures", "sejourVingtQuatreHeures"],
  ["demi_journee", "sejourDemiJournee"],
  ["plusieurs_heures", "sejourPlusieursHeures"],
  ["heure", "sejourHeure"],
  ["semaine", "sejourSemaine"],
  ["mois", "sejourMois"],
];

const EQUIPMENT_ICONS: Record<string, IconType> = {
  faa: FaCube,
  baignoire: FaBath,
  bed: FaBed,
  "chauffage climatisation": FaSnowflake,
  chauffe_eau: FaFireBurner,
  climatisation: FaSnowflake,
  coffre_fort: FaCube,
  cuisine: FaKitchenSet,
  "cuisine equipee": FaKitchenSet,
  douche: FaShower,
  fauteuil: FaCube,
  fibre: FaWifi,
  humidificateur: FaWater,
  internet: FaWifi,
  jardin: FaCube,
  lit: FaBed,
  lit_parasol: FaBed,
  machine_a_laver: FaPumpSoap,
  matelas: FaBed,
  parking: FaSquareParking,
  piscine: FaPersonSwimming,
  piscine_privee: FaPersonSwimming,
  pizza: FaUtensils,
  placard: FaCube,
  plage: FaWater,
  prise: FaPlug,
  salle_de_bain: FaBath,
  seche_cheveux: FaFireBurner,
  seche_linge: FaPumpSoap,
  service: FaCircleCheck,
  table: FaUtensils,
  television: FaTv,
  tv: FaTv,
  tv_satellite: FaTv,
  "vaisselle-cuisine": FaKitchenSet,
  ventilateur: FaSnowflake,
  voiture: FaCar,
  wifi: FaWifi,
};

function normalizeEquipmentKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_");
}

function resolveEquipmentIcon(icone: string | null, nom: string): IconType {
  if (icone) {
    const direct = EQUIPMENT_ICONS[icone.toLowerCase()];
    if (direct) return direct;
    const normalized = EQUIPMENT_ICONS[normalizeEquipmentKey(icone)];
    if (normalized) return normalized;
  }
  return EQUIPMENT_ICONS[normalizeEquipmentKey(nom)] ?? FaCircleCheck;
}

export interface PropertyDetailPhoto {
  id: string;
  url: string;
  legende: string | null;
}

export interface PropertyDetailFeature {
  nom: string;
  icone: string | null;
}

export interface PropertyDetailData {
  id: string;
  nom: string;
  type: string;
  descriptionCourte: string | null;
  descriptionComplete: string | null;
  capaciteMaximale: number;
  adultesMax: number;
  enfantsMax: number;
  bebesMax: number;
  nombreChambres: number;
  nombreLits: number;
  nombreSallesDeBains: number;
  superficieM2: number | null;
  adresse: string | null;
  ville: string;
  pays: string;
  photos: PropertyDetailPhoto[];
  caracteristiques: PropertyDetailFeature[];
  tarifBase: number | null;
  devise: string;
  noteMoyenne: number | null;
  nombreAvis: number;
  defaultCheckIn: string;
  defaultCheckOut: string;
  latitude: number | null;
  longitude: number | null;
}

interface PriceQuote {
  baseRate: number;
  unitPrice: number;
  subtotal: number;
  cleaningFee: number;
  cityTax: number;
  supplements: number;
  discount: number;
  total: number;
  currency: string;
  promotionAppliquee: string | null;
}

export function PropertyDetailClient({
  property,
  action,
}: {
  property: PropertyDetailData;
  action?: string;
}) {
  const { lang, t, currency } = useApp();
  const router = useRouter();
  const { data: session } = useSession();

  const photos =
    property.photos.length > 0
      ? property.photos
      : [{ id: "none", url: "", legende: null }];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [favori, setFavori] = useState(false);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  const typeLabel = property.type.replace(/_/g, " ");
  const formattedPrice =
    property.tarifBase != null && property.tarifBase > 0
      ? formatAmount(
          convertAmount(property.tarifBase, property.devise, currency),
          lang
        )
      : null;

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (action !== "reserver" || !formRef.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    formRef.current.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    requestAnimationFrame(() => {
      formRef.current?.focus();
    });
  }, [action]);

  const [arrivee, setArrivee] = useState("");
  const [depart, setDepart] = useState("");
  const [sejourType, setSejourType] = useState("nuee");
  const [adultes, setAdultes] = useState(2);
  const [enfants, setEnfants] = useState(0);
  const [bebes, setBebes] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  function handleDatesChange(a: string, d: string) {
    setArrivee(a);
    setDepart(d);
  }

  useEffect(() => {
    if (!arrivee || !depart) return;
    const controller = new AbortController();
    let cancelled = false;
    queueMicrotask(() => setQuoteLoading(true));
    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: property.id,
        startDate: arrivee,
        endDate: depart,
        typeReservation: sejourType,
        adults: adultes,
        children: enfants,
        babies: bebes,
      }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PriceQuote | null) => setQuote(data))
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [property.id, arrivee, depart, sejourType, adultes, enfants, bebes]);

  const hasDates = Boolean(arrivee && depart);
  const nights = hasDates ? nightsBetween(arrivee, depart) : 0;

  function handleCountsChange(counts: {
    adultes: number;
    enfants: number;
    bebes: number;
  }) {
    setAdultes(counts.adultes);
    setEnfants(counts.enfants);
    setBebes(counts.bebes);
  }

  function attemptReserve() {
    setMessage(null);

    if (!arrivee || !depart) {
      setMessage(t("logements.emptyDesc"));
      if (window.innerWidth <= 900) scrollToPicker();
      return;
    }

    const params = new URLSearchParams({
      arrivee,
      depart,
      heureArrivee: property.defaultCheckIn,
      heureDepart: property.defaultCheckOut,
      typeReservation: sejourType,
      adultes: String(adultes),
      enfants: String(enfants),
      bebes: String(bebes),
    });
    router.push(`/logements/${property.id}/reserver?${params.toString()}`);
  }

  function handleReserve(e: FormEvent) {
    e.preventDefault();
    attemptReserve();
  }

  const scrollToPicker = () => {
    document
      .getElementById("reservation-dates")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const composedH1 = [
    typeLabel,
    property.nombreChambres > 0
      ? `${property.nombreChambres} ${t("logementDetail.chambres").toLowerCase()}`
      : null,
    property.nombreSallesDeBains > 0
      ? `${property.nombreSallesDeBains} sdb`
      : null,
    `jusqu'à ${property.capaciteMaximale} ${t("logementDetail.pers").toLowerCase()}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const infoParts = [
    typeLabel,
    `${property.ville}, ${property.pays}`,
    `${property.capaciteMaximale} ${t("logementDetail.voyageurs")}`,
    property.nombreChambres > 0
      ? `${property.nombreChambres} ${t("logementDetail.chambres")}`
      : null,
    property.nombreLits > 0
      ? `${property.nombreLits} ${t("logementDetail.lits")}`
      : null,
    property.nombreSallesDeBains > 0
      ? `${property.nombreSallesDeBains} sdb`
      : null,
  ].filter(Boolean) as string[];

  const VISIBLE_EQUIPMENTS = 5;
  const visibleEquipments = equipmentOpen
    ? property.caracteristiques
    : property.caracteristiques.slice(0, VISIBLE_EQUIPMENTS);
  const extraEquipments =
    property.caracteristiques.length - VISIBLE_EQUIPMENTS;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: property.nom, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleFavori = () => {
    if (!session) {
      router.push(
        `/connexion?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    setFavori((v) => !v);
  };

  const totalPhotos = photos.length;

  const activePhoto = photos[activePhotoIndex]?.url ?? "";

  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;

    const updateIndex = () => {
      const items = track.querySelectorAll(".detail-gallery-mobile-item");
      if (items.length === 0) return;
      const trackRect = track.getBoundingClientRect();
      let closest = 0;
      let closestDist = Infinity;
      items.forEach((item, i) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const trackCenter = trackRect.left + trackRect.width / 2;
        const dist = Math.abs(itemCenter - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActivePhotoIndex(closest);
    };

    track.addEventListener("scroll", updateIndex, { passive: true });
    return () => track.removeEventListener("scroll", updateIndex);
  }, []);

  return (
    <section className="detail-page">
      {/* ─── Fil d'ariane ─── */}
      <PageHeader
        crumbs={[
          { labelKey: "logementDetail.breadcrumbAccueil", href: "/" },
          { labelKey: "logementDetail.breadcrumbChambres", href: "/logements" },
          { label: property.nom },
        ]}
      />

      {/* ─── Galerie ─── */}
      <div className="detail-gallery">
        {/* Overlay flottant */}
        <div className="detail-gallery-overlay">
          <Link
            href="/logements"
            className="detail-gallery-back"
            aria-label={t("logementDetail.retour")}
          >
            <FaArrowLeft size={16} />
          </Link>
          <span className="detail-gallery-counter" aria-live="polite">
            {activePhotoIndex + 1}/{totalPhotos}
          </span>
          <div className="detail-gallery-actions">
            <button
              type="button"
              className="detail-gallery-action"
              onClick={handleShare}
              aria-label={t("logementDetail.partager") ?? "Partager"}
            >
              <FaShareNodes size={15} />
            </button>
            <button
              type="button"
              className={`detail-gallery-action${favori ? " is-favori" : ""}`}
              onClick={handleFavori}
              aria-label={t("logementDetail.favori") ?? "Favori"}
            >
              <FaHeart size={15} />
            </button>
          </div>
        </div>

        {/* Desktop: grande photo à gauche + grille de vignettes à droite */}
        <div className="detail-gallery-desktop">
          <div
            className="detail-gallery-main"
            onClick={() => setGalleryOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setGalleryOpen(true)}
            aria-label={`${t("logementDetail.voirPhoto") ?? "Voir la galerie"} (${totalPhotos} photos)`}
          >
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={`${property.nom} — photo ${activePhotoIndex + 1}`}
                className="detail-gallery-main-img"
              />
            ) : (
              <div className="detail-gallery-placeholder">{property.nom}</div>
            )}
          </div>
          {property.photos.length > 1 && (
            <div className="detail-gallery-side">
              {property.photos.slice(0, 5).map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`detail-gallery-thumb${i === activePhotoIndex ? " is-active" : ""}`}
                  onClick={() => setActivePhotoIndex(i)}
                  aria-label={
                    p.legende ??
                    `${t("logementDetail.photo") ?? "Photo"} ${i + 1}`
                  }
                >
                  <img
                    src={p.url}
                    alt={`${property.nom} — ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
              {property.photos.length > 5 && (
                <button
                  type="button"
                  className="detail-gallery-thumb detail-gallery-thumb--more"
                  onClick={() => setGalleryOpen(true)}
                  aria-label={
                    t("logementDetail.toutesPhotos") ??
                    `+${property.photos.length - 5} photos de plus`
                  }
                >
                  <img
                    src={property.photos[5].url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="detail-gallery-more-overlay">
                    +{property.photos.length - 5}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile: swipe horizontal */}
        <div className="detail-gallery-mobile" aria-hidden="true">
          <div className="detail-gallery-mobile-track" ref={mobileTrackRef}>
            {property.photos.map((p, i) => (
              <div key={p.id} className="detail-gallery-mobile-item">
                <img
                  src={p.url}
                  alt={`${property.nom} — ${i + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="detail-gallery-mobile-dots" aria-hidden="true">
            {property.photos.map((_, i) => (
              <span
                key={i}
                className={`detail-gallery-mobile-dot${i === activePhotoIndex ? " is-active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Hero ─── */}
      <div className="detail-hero">
        <p className="detail-title-eyebrow">{property.nom}</p>
        <h1 className="heading-display detail-title">{composedH1}</h1>
        <div className="detail-info-chips">
          {infoParts.map((part) => (
            <span key={part} className="detail-info-chip">
              {part}
            </span>
          ))}
        </div>
        <div className="detail-meta">
          {property.noteMoyenne !== null && (
            <span className="detail-meta-rating">
              <span className="detail-meta-stars">★</span>
              <strong>{property.noteMoyenne}</strong>
              <span className="detail-meta-reviews">
                ({property.nombreAvis} {t("logementDetail.avis")})
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ─── Contenu principal ─── */}
      <div className="detail-layout">
        <div className="detail-main">
          {/* Description */}
          <div className="detail-block">
            <h2 className="detail-block-title">
              {t("logementDetail.description")}
            </h2>
            <p className="detail-desc">
              {property.descriptionComplete ||
                property.descriptionCourte ||
                property.nom}
            </p>
          </div>

          {/* Équipements */}
          {property.caracteristiques.length > 0 && (
            <div className="detail-block">
              <h2 className="detail-block-title">
                {t("logementDetail.equipements")}
              </h2>
              <div className="detail-features">
                {visibleEquipments.map((c) => {
                  const Icon = resolveEquipmentIcon(c.icone, c.nom);
                  return (
                    <span key={c.nom} className="detail-feature-tag">
                      <Icon
                        aria-hidden="true"
                        className="detail-feature-icon"
                        size={13}
                      />
                      {c.nom}
                    </span>
                  );
                })}
              </div>
              {extraEquipments > 0 && !equipmentOpen && (
                <button
                  type="button"
                  className="detail-features-more"
                  onClick={() => setEquipmentOpen(true)}
                >
                  {t("logementDetail.afficherEquipements") ??
                    `Afficher tous les ${property.caracteristiques.length} équipements`}
                </button>
              )}
            </div>
          )}

          {/* Disponibilité */}
          <div className="detail-block" id="disponibilite">
            <h2 className="detail-block-title">
              {t("logementDetail.disponibilite")}
            </h2>
            <DoubleMonthCalendar
              propertyId={property.id}
              arrivee={arrivee}
              depart={depart}
            />
            {hasDates && (
              <p className="detail-cal-selection" aria-live="polite">
                <strong>{formatISODate(arrivee, lang, { weekday: true })}</strong>
                <span aria-hidden="true"> → </span>
                <strong>{formatISODate(depart, lang, { weekday: true })}</strong>
                <span className="detail-cal-selection-nights">
                  · {nights} {nights > 1 ? t("logementDetail.nuits") : t("logementDetail.nuit")}
                </span>
              </p>
            )}
          </div>

          {/* Localisation */}
          {property.ville && (
            <div className="detail-block">
              <h2 className="detail-block-title">
                {t("logementDetail.localisation") ?? "Localisation"}
              </h2>
              <p className="detail-address">
                {property.adresse ? `${property.adresse}, ` : ""}
                {property.ville}, {property.pays}
              </p>
              <PropertyMap
                lat={property.latitude}
                lon={property.longitude}
                nom={property.nom}
                adresse={property.adresse}
                ville={property.ville}
                pays={property.pays}
              />
            </div>
          )}
        </div>

        {/* ─── Colonne réservation sticky ─── */}
        <aside id="reserver" className="detail-side" ref={formRef} tabIndex={-1}>
          <div className="detail-card">
            <div className="detail-card-price">
              <span className="detail-card-price-label">
                {t("logementDetail.tarifBase")}
              </span>
              {formattedPrice ? (
                <div className="detail-card-price-row">
                  <span className="detail-card-price-from">
                    {t("logementDetail.parNuitDepuis")}
                  </span>
                  <span className="detail-card-price-amount">
                    {formattedPrice} {currency}
                  </span>
                  <span className="detail-card-price-per">
                    / {t("logementDetail.nuit")}
                  </span>
                </div>
              ) : (
                <span>{t("common.prixNonDisponible")}</span>
              )}
            </div>

            {property.noteMoyenne !== null && (
              <div className="detail-rating">
                <span className="detail-rating-score">
                  ★ {property.noteMoyenne}
                </span>
                <span className="detail-rating-count">
                  {t("logementDetail.noteAvis")} ({property.nombreAvis})
                </span>
              </div>
            )}

            {property.tarifBase != null && (
              <form onSubmit={handleReserve} className="detail-form">
                <div className="search-field">
                  <span className="search-label">
                    {t("home.stayTypeLabel")}
                  </span>
                  <div className="search-value">
                    <FaClock aria-hidden="true" size={15} />
                    <Select
                      variant="field"
                      ariaLabel={t("home.stayTypeAria")}
                      name="typeReservation"
                      options={SEJOUR_ENTRIES.map(([value, key]) => ({
                        value,
                        label: t(`home.${key}`),
                      }))}
                      value={sejourType}
                      onChange={(v) => setSejourType(v)}
                    />
                  </div>
                </div>

                <ReservationDatePicker
                  propertyId={property.id}
                  arrivee={arrivee}
                  depart={depart}
                  onChange={handleDatesChange}
                />

                <GuestsField
                  maxes={{
                    adultes: property.adultesMax,
                    enfants: property.enfantsMax,
                    bebes: property.bebesMax,
                  }}
                  initial={{ adultes: 2, enfants: 0, bebes: 0 }}
                  onCountsChange={handleCountsChange}
                />

                {hasDates && quoteLoading && <p className="detail-quote-loading" aria-hidden="true" />}

                {hasDates && quote && !quoteLoading && (
                  <div className="detail-quote">
                    <div className="detail-quote-line">
                      <span>
                        {nights}{" "}
                        {nights > 1
                          ? t("logementDetail.nuits")
                          : t("logementDetail.nuit")}{" "}
                        ×{" "}
                        {formatAmount(
                          convertAmount(quote.unitPrice, quote.currency, currency),
                          lang
                        )}{" "}
                        {currency}
                      </span>
                      <span>
                        {formatAmount(
                          convertAmount(quote.subtotal, quote.currency, currency),
                          lang
                        )}{" "}
                        {currency}
                      </span>
                    </div>
                    {quote.discount > 0 && (
                      <div className="detail-quote-line detail-quote-promo">
                        <span>
                          {quote.promotionAppliquee ?? t("common.promo")}
                        </span>
                        <span>
                          −
                          {formatAmount(
                            convertAmount(quote.discount, quote.currency, currency),
                            lang
                          )}{" "}
                          {currency}
                        </span>
                      </div>
                    )}
                    <div className="detail-quote-line detail-quote-total">
                      <span>{t("logementDetail.total") ?? "Total"}</span>
                      <span>
                        {formatAmount(
                          convertAmount(quote.total, quote.currency, currency),
                          lang
                        )}{" "}
                        {currency}
                      </span>
                    </div>
                  </div>
                )}

                {message && (
                  <p className="detail-form-error">{message}</p>
                )}
                <button type="submit" className="detail-submit">
                  {t("logementDetail.reserver")}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* ─── Barre Réserver mobile ─── */}
      {property.tarifBase != null && (
        <div className="detail-mobile-bar">
          <div className="detail-mobile-bar-price">
            <span className="detail-mobile-bar-from">
              {t("logementDetail.parNuitDepuis")}
            </span>
            <strong className="detail-mobile-bar-amount">
              {formattedPrice} {currency}
            </strong>
          </div>
          <button
            type="button"
            onClick={attemptReserve}
            className="detail-mobile-bar-cta"
          >
            {t("logementDetail.reserver")}
          </button>
        </div>
      )}

      {/* ─── Lightbox ─── */}
      {galleryOpen && (
        <div
          className="detail-gallery-lightbox"
          role="dialog"
          aria-label={t("logementDetail.galerie") ?? "Galerie photos"}
          onClick={() => setGalleryOpen(false)}
        >
          <button
            type="button"
            className="detail-gallery-lightbox-close"
            onClick={() => setGalleryOpen(false)}
            aria-label={t("common.fermer") ?? "Fermer"}
          >
            ×
          </button>
          <div
            className="detail-gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto}
              alt={`${property.nom} — ${activePhotoIndex + 1}`}
              className="detail-gallery-lightbox-img"
            />
            <button
              type="button"
              className="detail-gallery-lightbox-prev"
              onClick={() =>
                setActivePhotoIndex(
                  (i) => (i - 1 + totalPhotos) % totalPhotos
                )
              }
              aria-label={t("calendar.prevMonth")}
            >
              ‹
            </button>
            <button
              type="button"
              className="detail-gallery-lightbox-next"
              onClick={() =>
                setActivePhotoIndex((i) => (i + 1) % totalPhotos)
              }
              aria-label={t("calendar.nextMonth")}
            >
              ›
            </button>
            <div className="detail-gallery-lightbox-counter">
              {activePhotoIndex + 1} / {totalPhotos}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
