import { NextRequest, NextResponse } from "next/server";
import { searchAvailableProperties } from "@/lib/services/availability";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const arrivee = searchParams.get("arrivee");
    const depart = searchParams.get("depart");
    const heureArrivee = searchParams.get("heureArrivee") || undefined;
    const heureDepart = searchParams.get("heureDepart") || undefined;
    const typeReservation = searchParams.get("typeReservation") || "nuee";
    const adults = parseInt(searchParams.get("adultes") ?? "", 10);
    const children = parseInt(searchParams.get("enfants") ?? "0", 10) || 0;
    const babies = parseInt(searchParams.get("bebes") ?? "0", 10) || 0;
    const type = searchParams.get("type") || undefined;
    const chambresMin = parseInt(searchParams.get("chambres") ?? "", 10) || undefined;
    const litsMin = parseInt(searchParams.get("lits") ?? "", 10) || undefined;
    const equipements = searchParams.get("equipements")?.split(",").map((s) => s.trim()).filter(Boolean);
    const prixMin = parseFloat(searchParams.get("prixMin") ?? "") || undefined;
    const prixMax = parseFloat(searchParams.get("prixMax") ?? "") || undefined;
    const triParam = searchParams.get("tri");
    const tri =
      triParam === "prix_croissant" || triParam === "prix_decroissant" || triParam === "note"
        ? triParam
        : "pertinence";
    const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") ?? "20", 10) || 20;

    if (!arrivee || !depart) {
      return NextResponse.json(
        { error: "Les dates d'arrivee et de depart sont obligatoires" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(arrivee) || !/^\d{4}-\d{2}-\d{2}$/.test(depart)) {
      return NextResponse.json(
        { error: "Format de date invalide (attendu: YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (isNaN(adults) || adults < 1) {
      return NextResponse.json({ error: "Le nombre d'adultes doit etre au moins 1" }, { status: 400 });
    }

    if (
      ["heure", "plusieurs_heures", "demi_journee", "journee", "vingt_quatre_heures"].includes(typeReservation)
    ) {
      if (!heureArrivee || !heureDepart) {
        return NextResponse.json(
          { error: "Les heures d'arrivee et de depart sont obligatoires pour ce type de reservation" },
          { status: 400 }
        );
      }
      if (!/^\d{2}:\d{2}$/.test(heureArrivee) || !/^\d{2}:\d{2}$/.test(heureDepart)) {
        return NextResponse.json({ error: "Format d'heure invalide (attendu: HH:mm)" }, { status: 400 });
      }
    }

    const result = await searchAvailableProperties({
      arrivee,
      depart,
      heureArrivee,
      heureDepart,
      typeReservation,
      adults,
      children,
      babies,
      type,
      chambresMin,
      litsMin,
      equipements,
      prixMin,
      prixMax,
      tri,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la recherche" },
      { status: 500 }
    );
  }
}
