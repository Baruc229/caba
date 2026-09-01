"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { AvailabilityCalendar } from "@/components/logements/availability-calendar";
import {
  convertAmount,
  formatAmount,
} from "@/lib/i18n/currency";

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
}

export function PropertyDetailClient({
  property,
}: {
  property: PropertyDetailData;
}) {
  const { lang, t, currency } = useApp();
  const router = useRouter();

  const photos = property.photos.length > 0 ? property.photos : [{ id: "none", url: "", legende: null }];
  const [activePhoto, setActivePhoto] = useState(photos[0]?.url ?? "");

  const typeLabel = property.type.replace(/_/g, " ");
  const formattedPrice =
    property.tarifBase != null && property.tarifBase > 0
      ? formatAmount(convertAmount(property.tarifBase, property.devise, currency), lang)
      : null;

  const [arrivee, setArrivee] = useState("");
  const [depart, setDepart] = useState("");
  const [adultes, setAdultes] = useState(2);
  const [message, setMessage] = useState<string | null>(null);

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
      heureArrivee: "14:00",
      heureDepart: "11:00",
      typeReservation: "nuee",
      adultes: String(adultes),
    });
    router.push(`/logements/${property.id}/reserver?${params.toString()}`);
  }

  return (
    <section className="detail-page">
      <div className="detail-hero">
        <div className="detail-back">
          <Link href="/logements" className="detail-back-link">← {t("logementDetail.retour")}</Link>
        </div>
        <h1 className="heading-display detail-title">{property.nom}</h1>
        <p className="detail-eyebrow">
          {typeLabel} · {property.ville}, {property.pays}
        </p>
      </div>

      {/* Galerie */}
      <div className="detail-layout">
        <div className="detail-main">
          {property.photos.length > 0 ? (
            <div className="detail-gallery">
              <div className="detail-gallery-main">
                {activePhoto ? (
                  <img src={activePhoto} alt={property.nom} className="detail-gallery-main-img" />
                ) : (
                  <div className="detail-gallery-placeholder">{property.nom}</div>
                )}
              </div>
              {property.photos.length > 1 && (
                <div className="detail-gallery-thumbs">
                  {property.photos.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`detail-gallery-thumb${p.url === activePhoto ? " is-active" : ""}`}
                      onClick={() => setActivePhoto(p.url)}
                      aria-label={p.legende ?? property.nom}
                    >
                      <img src={p.url} alt={property.nom} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="detail-gallery-placeholder detail-gallery--full">
              {t("logementDetail.aucunePhoto")}
            </div>
          )}

          {/* Description */}
          <div className="detail-block">
            <h2 className="detail-block-title">{t("logementDetail.description")}</h2>
            <p className="detail-desc">
              {property.descriptionComplete || property.descriptionCourte || property.nom}
            </p>
          </div>

          {/* Capacité */}
          <div className="detail-block">
            <h2 className="detail-block-title">{t("logementDetail.capacite")}</h2>
            <div className="detail-capacity">
              <span>{property.capaciteMaximale} {t("logementDetail.voyageurs")}</span>
              {property.nombreChambres > 0 && (
                <span>{property.nombreChambres} {t("logementDetail.chambres")}</span>
              )}
              {property.nombreLits > 0 && (
                <span>{property.nombreLits} {t("logementDetail.lits")}</span>
              )}
              {property.adultesMax > 0 && (
                <span>{property.adultesMax} {t("logementDetail.adultes")}</span>
              )}
              {property.nombreSallesDeBains > 0 && (
                <span>{property.nombreSallesDeBains} sdb</span>
              )}
              {property.superficieM2 != null && (
                <span>{property.superficieM2} m²</span>
              )}
            </div>
          </div>

          {/* Équipements */}
          {property.caracteristiques.length > 0 && (
            <div className="detail-block">
              <h2 className="detail-block-title">{t("logementDetail.equipements")}</h2>
              <div className="detail-features">
                {property.caracteristiques.map((c) => (
                  <span key={c.nom} className="detail-feature-tag">{c.nom}</span>
                ))}
              </div>
            </div>
          )}

          {/* Disponibilité */}
          <div className="detail-block">
            <h2 className="detail-block-title">{t("logementDetail.disponibilite")}</h2>
            <AvailabilityCalendar propertyId={property.id} />
          </div>
        </div>

        {/* Colonne réservation */}
        <aside className="detail-side">
          <div className="detail-card">
            <div className="detail-card-price">
              <span className="detail-card-price-label">{t("logementDetail.tarifBase")}</span>
              {formattedPrice ? (
                <strong className="detail-card-price-value">
                  {formattedPrice} {currency}
                  <span className="detail-card-price-unit">{t("logementDetail.parNuitDepuis")}</span>
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
                <div className="detail-form-grid">
                  <label className="detail-field">
                    <span className="detail-field-label">Arrivée</span>
                    <input type="date" value={arrivee} onChange={(e) => setArrivee(e.target.value)} className="detail-input" />
                  </label>
                  <label className="detail-field">
                    <span className="detail-field-label">Départ</span>
                    <input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="detail-input" />
                  </label>
                </div>
                <label className="detail-field">
                  <span className="detail-field-label">{t("logementDetail.adultes")}</span>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, property.adultesMax)}
                    value={adultes}
                    onChange={(e) => setAdultes(parseInt(e.target.value || "1", 10))}
                    className="detail-input"
                  />
                </label>
                {message && <p className="detail-form-error">{message}</p>}
                <button type="submit" className="detail-submit">
                  {t("logementDetail.reserver")}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
