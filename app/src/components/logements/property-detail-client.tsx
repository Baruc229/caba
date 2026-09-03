"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaClock, FaShareNodes, FaHeart, FaArrowLeft } from "react-icons/fa6";
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

  const photos = property.photos.length > 0 ? property.photos : [{ id: "none", url: "", legende: null }];
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [favori, setFavori] = useState(false);

  const typeLabel = property.type.replace(/_/g, " ");
  const formattedPrice =
    property.tarifBase != null && property.tarifBase > 0
      ? formatAmount(convertAmount(property.tarifBase, property.devise, currency), lang)
      : null;

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (action !== "reserver" || !formRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
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

  function handleCountsChange(counts: { adultes: number; enfants: number; bebes: number }) {
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
    property.nombreChambres > 0 ? `${property.nombreChambres} ${t("logementDetail.chambres")}` : null,
    property.nombreLits > 0 ? `${property.nombreLits} ${t("logementDetail.lits")}` : null,
    property.nombreSallesDeBains > 0 ? `${property.nombreSallesDeBains} sdb` : null,
  ].filter(Boolean);

  const shortCapacity = capacityParts.join(" · ");

  const h1Parts = [typeLabel];
  if (property.nombreChambres > 0) h1Parts.push(`${property.nombreChambres} ${t("logementDetail.chambres").toLowerCase()}`);
  if (property.nombreSallesDeBains > 0) h1Parts.push(`${property.nombreSallesDeBains} sdb`);
  h1Parts.push(`jusqu'à ${property.capaciteMaximale} pers.`);
  const h1Subtitle = h1Parts.join(" · ");

  const VISIBLE_EQUIPMENTS = 5;
  const visibleEquipments = equipmentOpen ? property.caracteristiques : property.caracteristiques.slice(0, VISIBLE_EQUIPMENTS);
  const extraEquipments = property.caracteristiques.length - VISIBLE_EQUIPMENTS;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: property.nom, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const activePhoto = photos[activePhotoIndex]?.url ?? "";
  const totalPhotos = photos.length;

  return (
    <section className="detail-page">
      {/* Galerie */}
      <div className="detail-gallery">
        {/* Overlay top: back + counter + actions */}
        <div className="detail-gallery-overlay">
          <Link href="/logements" className="detail-gallery-back" aria-label={t("logementDetail.retour")}>
            <FaArrowLeft size={16} />
          </Link>
          <span className="detail-gallery-counter" aria-live="polite">
            {activePhotoIndex + 1}/{totalPhotos}
          </span>
          <div className="detail-gallery-actions">
            <button type="button" className="detail-gallery-action" onClick={handleShare} aria-label={t("logementDetail.partager") ?? "Partager"}>
              <FaShareNodes size={15} />
            </button>
            <button type="button" className={`detail-gallery-action${favori ? " is-favori" : ""}`} onClick={() => setFavori((v) => !v)} aria-label={t("logementDetail.favori") ?? "Favori"}>
              <FaHeart size={15} />
            </button>
          </div>
        </div>

        {/* Desktop: main + thumbnail grid */}
        <div className="detail-gallery-grid">
          <div className="detail-gallery-main" onClick={() => setGalleryOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setGalleryOpen(true)} aria-label={`${t("logementDetail.voirPhoto") ?? "Voir la galerie"} (${totalPhotos} photos)`}>
            {activePhoto ? (
              <img src={activePhoto} alt={`${property.nom} — photo ${activePhotoIndex + 1}`} className="detail-gallery-main-img" />
            ) : (
              <div className="detail-gallery-placeholder">{property.nom}</div>
            )}
          </div>
          {property.photos.length > 1 && (
            <div className="detail-gallery-thumbs">
              {property.photos.slice(0, 4).map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`detail-gallery-thumb${i === activePhotoIndex ? " is-active" : ""}`}
                  onClick={() => setActivePhotoIndex(i)}
                  aria-label={p.legende ?? `${t("logementDetail.photo") ?? "Photo"} ${i + 1}`}
                >
                  <img src={p.url} alt={`${property.nom} — ${i + 1}`} loading="lazy" />
                </button>
              ))}
              {property.photos.length > 4 && (
                <button
                  type="button"
                  className="detail-gallery-thumb detail-gallery-thumb--more"
                  onClick={() => setGalleryOpen(true)}
                  aria-label={t("logementDetail.toutesPhotos") ?? `${property.photos.length - 4} photos de plus`}
                >
                  <img src={property.photos[4].url} alt="" loading="lazy" />
                  <span className="detail-gallery-more-overlay">+{property.photos.length - 4}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="detail-gallery-mobile">
          <div className="detail-gallery-mobile-track">
            {property.photos.map((p, i) => (
              <div key={p.id} className="detail-gallery-mobile-item">
                <img src={p.url} alt={`${property.nom} — ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="detail-gallery-mobile-dots">
            {property.photos.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`detail-gallery-dot${i === activePhotoIndex ? " is-active" : ""}`}
                onClick={() => setActivePhotoIndex(i)}
                aria-label={`${i + 1}/${totalPhotos}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hero info */}
      <div className="detail-hero">
        <h1 className="heading-display detail-title">{property.nom}</h1>
        <p className="detail-title-sub">{h1Subtitle}</p>
        <div className="detail-meta">
          <span className="detail-meta-location">{property.ville}, {property.pays}</span>
          {property.noteMoyenne !== null && (
            <span className="detail-meta-rating">
              <span className="detail-meta-stars">★</span>
              <strong>{property.noteMoyenne}</strong>
              <span className="detail-meta-reviews">({property.nombreAvis} {t("logementDetail.avis")})</span>
            </span>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="detail-layout">
        <div className="detail-main">
          {/* Description */}
          <div className="detail-block">
            <h2 className="detail-block-title">{t("logementDetail.description")}</h2>
            <p className="detail-desc">
              {property.descriptionComplete || property.descriptionCourte || property.nom}
            </p>
          </div>

          {/* Capacité condensée */}
          <div className="detail-block">
            <h2 className="detail-block-title">{t("logementDetail.capacite")}</h2>
            <p className="detail-capacity-line">{shortCapacity}</p>
          </div>

          {/* Équipements */}
          {property.caracteristiques.length > 0 && (
            <div className="detail-block">
              <h2 className="detail-block-title">{t("logementDetail.equipements")}</h2>
              <div className="detail-features">
                {visibleEquipments.map((c) => (
                  <span key={c.nom} className="detail-feature-tag">{c.nom}</span>
                ))}
              </div>
              {extraEquipments > 0 && !equipmentOpen && (
                <button type="button" className="detail-features-more" onClick={() => setEquipmentOpen(true)}>
                  {t("logementDetail.afficherEquipements") ?? `Afficher tous les ${property.caracteristiques.length} équipements`}
                </button>
              )}
            </div>
          )}

          {/* Disponibilité */}
          <div className="detail-block">
            <h2 className="detail-block-title">{t("logementDetail.disponibilite")}</h2>
            <AvailabilityCalendar propertyId={property.id} />
          </div>

          {/* Localisation */}
          {property.adresse && (
            <div className="detail-block">
              <h2 className="detail-block-title">{t("logementDetail.localisation") ?? "Localisation"}</h2>
              <p className="detail-address">{property.adresse}, {property.ville}, {property.pays}</p>
              <div className="detail-map">
                <iframe
                  title={t("logementDetail.carteLocalisation") ?? "Carte de localisation"}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(property.adresse + " " + property.ville)}&layer=mapnik&marker=${encodeURIComponent(property.adresse + " " + property.ville)}`}
                  className="detail-map-iframe"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        {/* Colonne réservation */}
        <aside className="detail-side" ref={formRef} tabIndex={-1}>
          <div className="detail-card">
            <div className="detail-card-price">
              <span className="detail-card-price-label">{t("logementDetail.tarifBase")}</span>
              {formattedPrice ? (
                <strong className="detail-card-price-value">
                  {formattedPrice}
                  <span className="detail-card-price-unit"> {currency} {t("logementDetail.parNuitDepuis")}</span>
                </strong>
              ) : (
                <span>{t("common.prixNonDisponible")}</span>
              )}
            </div>

            {property.noteMoyenne !== null && (
              <div className="detail-rating">
                <span className="detail-rating-score">★ {property.noteMoyenne}</span>
                <span className="detail-rating-count">
                  {t("logementDetail.noteAvis")} ({property.nombreAvis})
                </span>
              </div>
            )}

            {property.tarifBase != null && (
              <form onSubmit={handleReserve} className="detail-form">
                <div className="search-field">
                  <span className="search-label">{t("home.stayTypeLabel")}</span>
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
                  maxes={{ adultes: property.adultesMax, enfants: property.enfantsMax, bebes: property.bebesMax }}
                  initial={{ adultes: 2, enfants: 0, bebes: 0 }}
                  onCountsChange={handleCountsChange}
                />

                {message && <p className="detail-form-error">{message}</p>}
                <button type="submit" className="detail-submit">
                  {t("logementDetail.reserver")}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {/* Barre Réserver mobile */}
      {property.tarifBase != null && (
        <div className="detail-mobile-bar">
          <div className="detail-mobile-bar-price">
            <strong>{formattedPrice}</strong>
            <span>{t("logementDetail.parNuitDepuis")}</span>
          </div>
          <a href="#reserver" className="detail-mobile-bar-cta">
            {t("logementDetail.reserver")}
          </a>
        </div>
      )}

      {/* Lightbox galerie */}
      {galleryOpen && (
        <div className="detail-gallery-lightbox" role="dialog" aria-label={t("logementDetail.galerie") ?? "Galerie photos"} onClick={() => setGalleryOpen(false)}>
          <button type="button" className="detail-gallery-lightbox-close" onClick={() => setGalleryOpen(false)} aria-label={t("common.fermer") ?? "Fermer"}>×</button>
          <div className="detail-gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto} alt={`${property.nom} — ${activePhotoIndex + 1}`} className="detail-gallery-lightbox-img" />
            <button type="button" className="detail-gallery-lightbox-prev" onClick={() => setActivePhotoIndex((i) => (i - 1 + totalPhotos) % totalPhotos)} aria-label={t("calendar.prevMonth")}>
              ‹
            </button>
            <button type="button" className="detail-gallery-lightbox-next" onClick={() => setActivePhotoIndex((i) => (i + 1) % totalPhotos)} aria-label={t("calendar.nextMonth")}>
              ›
            </button>
            <div className="detail-gallery-lightbox-dots">
              {property.photos.map((_, i) => (
                <button key={i} type="button" className={`detail-gallery-dot${i === activePhotoIndex ? " is-active" : ""}`} onClick={() => setActivePhotoIndex(i)} aria-label={`${i + 1}/${totalPhotos}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
