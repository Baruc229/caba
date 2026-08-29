import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

function serverClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase Storage non configuré : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquants."
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Upload d'un fichier image vers Supabase Storage dans le bucket `properties`.
 * Retourne l'URL publique du fichier.
 */
export async function uploadPropertyImage(
  file: File | Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  if (!isConfigured()) {
    return { url: null, error: "Stockage non configuré." };
  }

  const BUCKET = "properties";
  const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `logements/${safeName}`;

  const supabase = serverClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error || !data) {
    console.error("Upload Supabase:", error?.message ?? "unknown");
    return { url: null, error: error?.message ?? "Upload échoué." };
  }

  const { data: pubUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return { url: pubUrl.publicUrl, error: null };
}

export const supabaseConfigured = isConfigured;
