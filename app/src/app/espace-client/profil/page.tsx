import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Mon profil — Caba Residence" };

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      createdAt: true,
      _count: { select: { bookings: true, reviews: true, favorites: true } },
    },
  });

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Mon profil</h1>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-caba-blue/10 rounded-full flex items-center justify-center text-caba-blue text-xl font-bold">
              {user.prenom[0]}
              {user.nom[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">
                {user.prenom} {user.nom}
              </h2>
              <p className="text-sm text-gray-500">
                Membre depuis{" "}
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Prenom
                </label>
                <p className="text-sm text-black font-medium">{user.prenom}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Nom
                </label>
                <p className="text-sm text-black font-medium">{user.nom}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-sm text-black font-medium">{user.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Telephone
              </label>
              <p className="text-sm text-black font-medium">
                {user.telephone || "Non renseigne"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-black">
              {user._count.bookings}
            </p>
            <p className="text-xs text-gray-500 mt-1">Reservations</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-black">
              {user._count.reviews}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avis</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-black">
              {user._count.favorites}
            </p>
            <p className="text-xs text-gray-500 mt-1">Favoris</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-black mb-4">Modifier le profil</h3>
          <p className="text-sm text-gray-500 mb-4">
            La modification du profil sera disponible prochainement.
          </p>
          <button
            disabled
            className="px-6 py-2.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}
