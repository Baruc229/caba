"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaClock, FaShareNodes, FaHeart, FaArrowLeft } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { useApp } from "@/components/providers/app-provider";
import { AvailabilityCalendar } from "@/components/logements/availability-calendar";
import { DateRangeField } from "@/components/ui/double-calendar";
import { GuestsField } from "@/components/ui/guests-field";
import { Select } from "@/components/ui/select";
import {
  convertAmount,
  formatAmount,
} from "@/lib/i18n/currency";

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

export interface PropertyDetailPhoto {
  id: string;
  url: string;
  legende: string | null;
}

export interface PropertyDetailFeature {
  nom: string;
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

  function handleDatesChange(a: string, d: string) {
    setArrivee(a);
    setDepart(d);
  }

  function handleCountsChange(counts: {
    adultes: number;
    enfants: number;
    bebes: number;
  }) {
    setAdultes(counts.adultes);
    setEnfants(counts.enfants);
    setBebes(counts.bebes);
  }

  async function handleReserve(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!arrivee || !depart) {
      setMessage(t("logements.emptyDesc"));
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

  const capacityParts = [
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
  ].filter(Boolean);

  const shortCapacity = capacityParts.join(" · ");

  const h1Parts = [typeLabel];
  if (property.nombreChambres > 0)
    h1Parts.push(
      `${property.nombreChambres} ${t("logementDetail.chambres").toLowerCase()}`
    );
  if (property.nombreSallesDeBains > 0)
    h1Parts.push(`${property.nombreSallesDeBains} sdb`);
  h1Parts.push(`jusqu'à ${property.capaciteMaximale} pers.`);
  const h1Subtitle = h1Parts.join(" · ");

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

        {/* Desktop: grande image + vignettes en dessous */}
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
            <div className="detail-gallery-thumbs">
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
        <h1 className="heading-display detail-title">{property.nom}</h1>
        <p className="detail-title-sub">{h1Subtitle}</p>
        <div className="detail-meta">
          <span className="detail-meta-location">
            {property.ville}, {property.pays}
          </span>
          {property.noteMoyenne !== null && (
            <span className="detail-meta-rating">
              <span className="detail-meta-stars">★</span>
              <strong>{property.noteMoyenne}</strong>
              <span className="detail-meta-reviews">
                ({property.nombreAvis}{" "}
                {t("logementDetail.avis")})
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

          {/* Capacité */}
          <div className="detail-block">
            <h2 className="detail-block-title">
              {t("logementDetail.capacite")}
            </h2>
            <p className="detail-capacity-line">{shortCapacity}</p>
          </div>

          {/* Équipements */}
          {property.caracteristiques.length > 0 && (
            <div className="detail-block">
              <h2 className="detail-block-title">
                {t("logementDetail.equipements")}
              </h2>
              <div className="detail-features">
                {visibleEquipments.map((c) => (
                  <span key={c.nom} className="detail-feature-tag">
                    {c.nom}
                  </span>
                ))}
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
          <div className="detail-block">
            <h2 className="detail-block-title">
              {t("logementDetail.disponibilite")}
            </h2>
            <AvailabilityCalendar propertyId={property.id} />
          </div>

          {/* Localisation */}
          {property.adresse && (
            <div className="detail-block">
              <h2 className="detail-block-title">
                {t("logementDetail.localisation") ?? "Localisation"}
              </h2>
              <p className="detail-address">
                {property.adresse}, {property.ville}, {property.pays}
              </p>
              <div className="detail-map">
                {property.latitude != null && property.longitude != null ? (
                  <iframe
                    title={
                      t("logementDetail.carteLocalisation") ??
                      "Carte de localisation"
                    }
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.01},${property.latitude - 0.005},${property.longitude + 0.01},${property.latitude + 0.005}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                    className="detail-map-iframe"
                    loading="lazy"
                  />
                ) : (
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                      `${property.adresse ?? ""} ${property.ville} ${property.pays}`.trim()
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-map-link"
                  >
                    {property.adresse ?? property.ville}, {property.pays}
                  </a>
                )}
              </div>
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

                <DateRangeField onDatesChange={handleDatesChange} />

                <GuestsField
                  maxes={{
                    adultes: property.adultesMax,
                    enfants: property.enfantsMax,
                    bebes: property.bebesMax,
                  }}
                  initial={{ adultes: 2, enfants: 0, bebes: 0 }}
                  onCountsChange={handleCountsChange}
                />

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
          <a href="#reserver" className="detail-mobile-bar-cta">
            {t("logementDetail.reserver")}
          </a>
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
