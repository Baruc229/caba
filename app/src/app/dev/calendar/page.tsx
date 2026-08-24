import { AvailabilityCalendar } from "@/components/logements/availability-calendar";

export const metadata = { title: "Démo calendrier — Caba" };

export default async function DevCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const { propertyId } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-xl font-bold">Calendrier de disponibilité</h1>
      {propertyId ? (
        <AvailabilityCalendar propertyId={propertyId} />
      ) : (
        <p className="text-sm text-gray-500">
          Ajoutez ?propertyId=&lt;uuid&gt; à l&apos;URL.
        </p>
      )}
    </main>
  );
}
