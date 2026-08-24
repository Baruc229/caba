import { NextResponse } from "next/server";
import { getSearchFilterOptions } from "@/lib/services/availability";

export async function GET() {
  try {
    const options = await getSearchFilterOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("Erreur lors du chargement des filtres:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
