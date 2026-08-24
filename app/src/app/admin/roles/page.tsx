import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users-manager";

export default async function RolesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "administrateur") {
    return (
      <div>
        <div className="bo-page-head">
          <div>
            <h2 className="bo-page-title">Rôles &amp; Permissions</h2>
            <p className="bo-page-desc">Accès réservé aux administrateurs.</p>
          </div>
        </div>
        <div className="bo-card">
          <div className="bo-empty">
            <h3 className="bo-empty-title">Accès refusé</h3>
            <p>
              Seul un administrateur peut consulter et gérer les comptes internes — même
              en lecture.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    where: { role: { not: "client" } },
    select: {
      id: true,
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      role: true,
      actif: true,
      lastLogin: true,
      invitationExpire: true,
    },
    orderBy: [{ actif: "desc" }, { createdAt: "asc" }],
  });

  const initialUsers = users.map((user) => ({
    id: user.id,
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: user.telephone,
    role: user.role,
    actif: user.actif,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    invitationEnAttente: Boolean(user.invitationExpire),
  }));

  return (
    <div>
      <div className="bo-page-head">
        <div>
          <h2 className="bo-page-title">Rôles &amp; Permissions</h2>
          <p className="bo-page-desc">
            Gestion des comptes de l&apos;équipe : invitation, rôle, activation. Les rôles
            personnalisés arriveront en Phase 8.
          </p>
        </div>
        <span className="bo-phase-tag">Phase 1/8 — socle</span>
      </div>

      <UsersManager initialUsers={initialUsers} />
    </div>
  );
}
