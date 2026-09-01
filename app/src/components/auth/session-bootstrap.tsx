"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function SessionBootstrap() {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    // Juste après une vérification d'email, le cookie de session a été posé sur
    // le serveur. On demande au serveur de re-rendre (router.refresh) pour que
    // le header (server-rendered) affiche immédiatement l'utilisateur connecté,
    // sans attendre un fetch client long.
    if (done.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") !== "1") return;
    done.current = true;
    const next = params.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    router.replace(dest, { scroll: false });
    router.refresh();
  }, [router]);

  return null;
}
