"use client";

import { useEffect, useRef } from "react";

export function SessionBootstrap() {
  const done = useRef(false);

  useEffect(() => {
    // Juste après une vérification d'email, le cookie de session a été posé sur
    // le serveur. On effectue une navigation complète (>-assign) pour que le
    // serveur re-rende entièrement la page (layout + checkout) avec la session
    // fraîche : l'utilisateur est connecté et poursuit ce qu'il était en train
    // de faire (retour vers le paramètre `next` si présent).
    if (done.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") !== "1") return;
    done.current = true;
    const next = params.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    window.location.assign(dest);
  }, []);

  return null;
}
