"use client";

import type { SearchResultItem } from "@/lib/services/availability";
import { useApp } from "@/components/providers/app-provider";
import {
  convertAmount,
  formatAmount,
} from "@/lib/i18n/currency";

const TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  chambre: { fr: "Chambre", en: "Room" },
  chambre_avec_salon: { fr: "Chambre avec salon", en: "Room with living room" },
  studio: { fr: "Studio", en: "Studio" },
  appartement_meuble: { fr: "Appartement meublé", en: "Furnished apartment" },
  suite: { fr: "Suite", en: "Suite" },
  villa: { fr: "Villa", en: "Villa" },
  duplex: { fr: "Duplex", en: "Duplex" },
  maison_entiere: { fr: "Maison entière", en: "Whole house" },
  personnalise: { fr: "Personnalisé", en: "Custom" },
};

export function PropertyCard({ item }: { item: SearchResultItem }) {
  const { lang, t, currency } = useApp();
  const typeLabel = TYPE_LABELS[item.type]?.[lang] ?? item.type;
  const formattedPrixParNuit =
    item.prixParNuit > 0
      ? formatAmount(convertAmount(item.prixParNuit, item.devise, currency), lang)
      : "";

  return (
    <article className="property-card">
      <a href={`/logements/${item.id}`} className="property-card-photo-link" aria-label={`${t("common.voirLogement")} ${item.nom}`}>
        <div className="property-card-photo-wrap">
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.nom}
              className="property-card-photo"
              loading="lazy"
            />
          ) : (
            <div className="property-card-photo-placeholder">
              <span>{typeLabel}</span>
            </div>
          )}
          <span className="property-card-badge">{typeLabel}</span>
        </div>
      </a>

      <div className="property-card-body">
        <h3 className="property-card-name">{item.nom}</h3>

        <div className="property-card-capacity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{t("common.voyageurs").replace("{n}", String(item.capaciteMaximale))}</span>
        </div>

        {item.equipements.length > 0 && (
          <div className="property-card-equipments">
            {item.equipements.slice(0, 4).map((eq) => (
              <span key={eq} className="property-card-equip-tag">{eq}</span>
            ))}
            {item.equipements.length > 4 && (
              <span className="property-card-equip-more">+{item.equipements.length - 4}</span>
            )}
          </div>
        )}

        {item.noteMoyenne !== null && (
          <div className="property-card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-accent-gold)" stroke="none" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="property-card-rating-value">{item.noteMoyenne}</span>
            <span className="property-card-rating-count">{t("common.avis").replace("{n}", String(item.nombreAvis))}</span>
          </div>
        )}

        <div className="property-card-pricing">
          {item.promotionAppliquee && (
            <span className="property-card-price-promo-label">{item.promotionAppliquee}</span>
          )}
          <p className="property-card-price">
            {item.prixParNuit > 0 ? (
              <>
                {t("common.aPartirDe")}{" "}
                <strong>{formattedPrixParNuit} {currency}</strong>
                <span className="property-card-price-unit"> / {t("common.parNuit")}</span>
              </>
            ) : (
              <span className="property-card-price-unavailable">{t("common.prixNonDisponible")}</span>
            )}
          </p>
        </div>

        <div className="property-card-actions">
          <a href={`/logements/${item.id}`} className="property-card-btn property-card-btn--secondary">
            {t("common.voirLogement")}
          </a>
          {item.prixTotal > 0 && (
            <a
              href={`/logements/${item.id}?action=reserver`}
              className="property-card-btn property-card-btn--primary"
            >
              {t("common.reserver")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
