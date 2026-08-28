"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function SessionBootstrap() {
  const { update } = useSession();
  const done = useRef(false);

  useEffect(() => {
    // Après une vérification d'email, la session vient d'être posée sur le
    // cookie. On force le re-fetch de /api/auth/session pour rendre la
    // connexion effective immédiatement (avatar visible sans recharger).
    if (done.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") !== "1") return;
    done.current = true;
    void update();
  }, [update]);

  return null;
}
