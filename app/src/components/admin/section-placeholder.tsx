import { FaRegFolderOpen } from "react-icons/fa6";

export const ADMIN_SECTIONS: Record<string, { title: string }> = {
  reservations: { title: "Réservations" },
  calendrier: { title: "Calendrier" },
  logements: { title: "Logements" },
  clients: { title: "Clients" },
  tarifs: { title: "Tarifs" },
  promotions: { title: "Promotions" },
  caracteristiques: { title: "Caractéristiques" },
  avis: { title: "Avis" },
  paiements: { title: "Paiements" },
  messages: { title: "Messages" },
  whatsapp: { title: "WhatsApp" },
  galerie: { title: "Galerie (page d'accueil)" },
  ical: { title: "iCal/Synchronisation" },
  pages: { title: "Pages" },
  blog: { title: "Blog" },
  rapports: { title: "Rapports" },
  parametres: { title: "Paramètres" },
};

export function SectionPlaceholder({ slug }: { slug: string }) {
  const meta = ADMIN_SECTIONS[slug] ?? {
    title: slug,
  };

  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">{meta.title}</h2>
          <p className="bo-page-desc">Section en préparation.</p>
        </div>
      </div>

      <div className="bo-card">
        <div className="bo-empty">
          <FaRegFolderOpen aria-hidden="true" className="bo-empty-icon" />
          <h3 className="bo-empty-title">Contenu à venir</h3>
          <p>
            Cette section sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
}
