import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: { nom: true, descriptionCourte: true, ville: true, pays: true },
  });

  if (!property) return { title: "Logement introuvable" };

  return {
    title: `${property.nom} — Caba Residence`,
    description:
      property.descriptionCourte ||
      `Reservez ${property.nom} a ${property.ville}, ${property.pays} sur Caba Residence.`,
  };
}
