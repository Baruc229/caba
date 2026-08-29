import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { uploadPropertyImage } from "@/lib/supabase";

const STAFF_ROLES = ["administrateur", "gestionnaire"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

async function toBuffer(formData: FormData, key: string): Promise<Buffer | null> {
  const value = formData.get(key);
  if (!(value instanceof Blob)) return null;
  const arrayBuffer = await value.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !STAFF_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.name) {
      return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé (JPEG, PNG, WEBP, GIF, AVIF)." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop lourde (max 5 Mo)." }, { status: 400 });
    }

    const buffer = await toBuffer(formData, "file");
    if (!buffer) {
      return NextResponse.json({ error: "Impossible de lire le fichier." }, { status: 400 });
    }

    const result = await uploadPropertyImage(buffer, file.name, file.type);
    if (!result.url) {
      return NextResponse.json({ error: result.error ?? "Upload échoué." }, { status: 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Erreur upload:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
