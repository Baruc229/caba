"use client";

import type { SearchResultItem } from "@/lib/services/availability";

const TYPE_LABELS: Record<string, string> = {
  chambre: "Chambre",
  chambre_avec_salon: "Chambre avec salon",
  studio: "Studio",
  appartement_meuble: "Appartement meublé",
  suite: "Suite",
  villa: "Villa",
  duplex: "Duplex",
  maison_entiere: "Maison entière",
  personnalise: "Personnalisé",
};

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " " + currency;
}

export function PropertyCard({ item }: { item: SearchResultItem }) {
  const typeLabel = TYPE_LABELS[item.type] ?? item.type;

  return (
    <article className="property-card">
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
        <button
          type="button"
          className="property-card-fav"
          aria-label={`Ajouter ${item.nom} aux favoris`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="property-card-body">
        <h3 className="property-card-name">{item.nom}</h3>
        <p className="property-card-type">{typeLabel}</p>

        <div className="property-card-capacity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{item.capaciteMaximale} voyageurs</span>
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
            <span className="property-card-rating-count">({item.nombreAvis} avis)</span>
          </div>
        )}

        <div className="property-card-pricing">
          {item.promotionAppliquee && (
            <span className="property-card-price-promo-label">{item.promotionAppliquee}</span>
          )}
          <p className="property-card-price">
            {item.prixTotal > 0 ? (
              <>
                à partir de{" "}
                <strong>{formatPrice(item.prixTotal, item.devise)}</strong>
                {item.nuitsOuUnites > 1 && (
                  <span className="property-card-price-unit">
                    {" "}pour {item.nuitsOuUnites} nuit{item.nuitsOuUnites > 1 ? "s" : ""}
                  </span>
                )}
                {item.nuitsOuUnites === 1 && (
                  <span className="property-card-price-unit"> /nuit</span>
                )}
              </>
            ) : (
              <span className="property-card-price-unavailable">Prix non disponible</span>
            )}
          </p>
        </div>

        <div className="property-card-actions">
          <a href={`/logements/${item.id}`} className="property-card-btn property-card-btn--secondary">
            Voir le logement
          </a>
          {item.prixTotal > 0 && (
            <a
              href={`/logements/${item.id}?action=reserver`}
              className="property-card-btn property-card-btn--primary"
            >
              Réserver
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
