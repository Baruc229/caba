import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminICalPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!["administrateur", "gestionnaire"].includes(session.user.role)) redirect("/espace-client");

  const syncs = await prisma.synchronisationICal.findMany({
    include: { property: { select: { id: true, nom: true, ville: true } } },
    orderBy: { createdAt: "desc" },
  });

  const properties = await prisma.property.findMany({
    where: { statut: { not: "desactive" } },
    select: { id: true, nom: true, ville: true },
    orderBy: { nom: "asc" },
  });

  const importSyncs = syncs.filter((s) => s.typeSync === "import");
  const exportSyncs = syncs.filter((s) => s.typeSync === "export");

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Synchronisation iCal</h1>
            <p className="text-gray-500">Gerez les synchronisations avec les plateformes externes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Sources configurees</p>
            <p className="text-2xl font-bold text-gray-900">{syncs.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Actives</p>
            <p className="text-2xl font-bold text-green-600">
              {syncs.filter((s) => s.statut === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">En erreur</p>
            <p className="text-2xl font-bold text-red-600">
              {syncs.filter((s) => s.statut === "erreur").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Derniere sync globale</p>
            <p className="text-sm font-medium text-gray-900">
              {syncs.filter((s) => s.derniereSync).length > 0
                ? new Date(
                    Math.max(
                      ...syncs.filter((s) => s.derniereSync).map((s) => s.derniereSync!.getTime())
                    )
                  ).toLocaleString("fr-FR")
                : "Jamais"}
            </p>
          </div>
        </div>

        {/* Imports */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Imports (externe → Caba)</h2>
            <p className="text-sm text-gray-500 mt-1">
              Recuperer les disponibilites depuis Airbnb, Booking.com, etc.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {importSyncs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucune source iCal configuree
              </div>
            ) : (
              importSyncs.map((sync) => (
                <div key={sync.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {sync.property.nom}
                      </span>
                      <span className="text-sm text-gray-400">({sync.property.ville})</span>
                      {sync.statut === "active" && (
                        <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      )}
                      {sync.statut === "erreur" && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{sync.urlSource}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>Freq: {sync.frequence}</span>
                      {sync.derniereSync && (
                        <span>Derniere sync: {sync.derniereSync.toLocaleString("fr-FR")}</span>
                      )}
                      {sync.messageErreur && (
                        <span className="text-red-500">{sync.messageErreur}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <form action={`/api/ical/${sync.propertyId}`} method="POST" className="inline">
                      <input type="hidden" name="action" value="sync" />
                      <input type="hidden" name="syncId" value={sync.id} />
                      <button
                        type="submit"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Synchroniser"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </form>
                    <a
                      href={`/api/ical/${sync.propertyId}`}
                      target="_blank"
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Voir l'export"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Exports */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Exports (Caba → externe)</h2>
            <p className="text-sm text-gray-500 mt-1">
              Copiez ces URLs dans vos calendriers externes
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {properties.map((prop) => {
              const exportUrl = `${baseUrl}/api/ical/${prop.id}`;
              const existingExport = exportSyncs.find((s) => s.propertyId === prop.id);

              return (
                <div key={prop.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{prop.nom}</span>
                      <span className="text-sm text-gray-400 ml-2">({prop.ville})</span>
                    </div>
                    {existingExport && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        Configure
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-50 p-2 rounded border border-gray-200 truncate">
                      {exportUrl}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(exportUrl)}
                      className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Comment configurer</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Import (Airbnb, Booking, etc.) :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Ouvrez votre calendrier sur la plateforme externe</li>
              <li>Copiez l&apos;URL iCal (generallement dans Parametres &gt; Integrations)</li>
              <li>Cliquez &quot;Ajouter une source&quot; et collez l&apos;URL</li>
              <li>La premiere sync s&apos;effectue automatiquement</li>
            </ol>
            <p className="mt-3"><strong>Export (vers Airbnb, Booking, etc.) :</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Copiez l&apos;URL d&apos;export ci-dessus pour le logement souhaite</li>
              <li>Collez-la dans les parametres de calendrier de la plateforme externe</li>
              <li>La plateforme synchronisera automatiquement les disponibilites</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
