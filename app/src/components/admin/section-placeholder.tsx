import { FaRegFolderOpen } from "react-icons/fa6";

export const ADMIN_SECTIONS: Record<string, { title: string; phase: string }> = {
  reservations: { title: "Réservations", phase: "Phase 3" },
  calendrier: { title: "Calendrier", phase: "Phase 3" },
  logements: { title: "Logements", phase: "Phase 4" },
  clients: { title: "Clients", phase: "Phase 5" },
  tarifs: { title: "Tarifs", phase: "Phase 5" },
  promotions: { title: "Promotions", phase: "Phase 5" },
  caracteristiques: { title: "Caractéristiques", phase: "Phase 5" },
  avis: { title: "Avis", phase: "Phase 6" },
  paiements: { title: "Paiements", phase: "Phase 6" },
  messages: { title: "Messages", phase: "Phase 6" },
  whatsapp: {
    title: "WhatsApp",
    phase: "Phase 6 — maquette en attendant la validation technique",
  },
  galerie: { title: "Galerie (page d'accueil)", phase: "Phase 7" },
  ical: { title: "iCal/Synchronisation", phase: "Phase 10" },
  pages: { title: "Pages", phase: "Phase 7" },
  blog: { title: "Blog", phase: "Phase 7" },
  rapports: { title: "Rapports", phase: "Phase 7" },
  parametres: { title: "Paramètres", phase: "Phase 8" },
};

export function SectionPlaceholder({ slug }: { slug: string }) {
  const meta = ADMIN_SECTIONS[slug] ?? {
    title: slug,
    phase: "à planifier",
  };

  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">{meta.title}</h2>
          <p className="bo-page-desc">Section en préparation.</p>
        </div>
        <span className="bo-phase-tag">{meta.phase}</span>
      </div>

      <div className="bo-card">
        <div className="bo-empty">
          <FaRegFolderOpen aria-hidden="true" className="bo-empty-icon" />
          <h3 className="bo-empty-title">Contenu à venir</h3>
          <p>
            Cette section sera construite lorsque sa phase sera atteinte ({meta.phase}).
          </p>
        </div>
      </div>
    </div>
  );
}
