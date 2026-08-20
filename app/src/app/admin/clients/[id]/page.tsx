import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { property: { select: { nom: true, type: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      reviews: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { bookings: true, reviews: true, favorites: true } },
    },
  });

  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/clients" className="text-sm text-caba-blue hover:underline mb-4 inline-block">
        &larr; Retour
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-caba-blue/10 rounded-full flex items-center justify-center text-caba-blue font-bold">
          {user.prenom[0]}{user.nom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">{user.prenom} {user.nom}</h1>
          <p className="text-gray-600 text-sm">{user.email} {user.telephone ? `· ${user.telephone}` : ""}</p>
        </div>
        <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${user.actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {user.actif ? "Actif" : "Inactif"}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
          <p className="text-2xl font-bold text-black">{user._count.bookings}</p>
          <p className="text-xs text-gray-500">Reservations</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
          <p className="text-2xl font-bold text-black">{user._count.reviews}</p>
          <p className="text-xs text-gray-500">Avis</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
          <p className="text-2xl font-bold text-black">{user._count.favorites}</p>
          <p className="text-xs text-gray-500">Favoris</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-semibold text-black mb-4">Dernieres reservations</h2>
          {user.bookings.length > 0 ? (
            <div className="space-y-3">
              {user.bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/reservations/${b.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded"
                >
                  <div>
                    <p className="text-sm font-medium text-black">{b.property.nom}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(b.dateArrivee).toLocaleDateString("fr-FR")} → {new Date(b.dateDepart).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{Number(b.prixTotal)} {b.devise}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucune reservation.</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-semibold text-black mb-4">Informations</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{user.role}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email confirme</span><span className="font-medium">{user.emailConfirme ? "Oui" : "Non"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Inscription</span><span className="font-medium">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Derniere connexion</span><span className="font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "-"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
