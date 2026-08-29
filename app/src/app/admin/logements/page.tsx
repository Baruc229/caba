import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { PropertiesManager } from "@/components/admin/properties-manager";

const STAFF_ROLES = ["administrateur", "gestionnaire"];

export default async function LogementsPage() {
  const session = await auth();
  const role = session?.user?.role ?? "";
  const isStaff = STAFF_ROLES.includes(role);

  if (!isStaff) {
    return (
      <div>
        <div className="bo-page-head">
          <div>
            <h2 className="bo-page-title">Logements</h2>
            <p className="bo-page-desc">Accès réservé aux administrateurs et gestionnaires.</p>
          </div>
        </div>
        <div className="bo-card">
          <div className="bo-empty">
            <h3 className="bo-empty-title">Accès refusé</h3>
            <p>Vous n&apos;avez pas les droits pour gérer les logements.</p>
          </div>
        </div>
      </div>
    );
  }

  const properties = await prisma.property.findMany({
    include: {
      photos: { where: { estPrincipale: true }, take: 1 },
      avis: { select: { note: true } },
      tarifs: { where: { actif: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const initialRows = properties.map((p) => ({
    id: p.id,
    nom: p.nom,
    type: p.type,
    statut: p.statut,
    capaciteMaximale: p.capaciteMaximale,
    nombreChambres: p.nombreChambres,
    ville: p.ville,
    photo: p.photos[0]?.url ?? null,
    tarifBase: p.tarifs[0]?.prix != null ? String(p.tarifs[0].prix) : null,
    devise: p.tarifs[0]?.devise ?? p.devise,
    nombreAvis: p.avis.length,
    note:
      p.avis.length > 0
        ? Math.round((p.avis.reduce((s, a) => s + a.note, 0) / p.avis.length) * 10) / 10
        : null,
  }));

  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">Logements</h2>
          <p className="bo-page-desc">
            Créez, modifiez et gérez les biens de la résidence (statut, tarifs, photos).
          </p>
        </div>
      </div>

      <PropertiesManager initialRows={initialRows} />
    </div>
  );
}
