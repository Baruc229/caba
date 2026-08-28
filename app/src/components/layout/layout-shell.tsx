"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SessionBootstrap } from "@/components/auth/session-bootstrap";

const HIDE_CHROME = ["/admin"];

interface InitialUser {
  prenom: string;
  nom: string;
  email: string;
  role: string;
}

export function LayoutShell({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: InitialUser | null;
}) {
  const pathname = usePathname();
  const showChrome = !HIDE_CHROME.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  return (
    <>
      <SessionBootstrap />
      {showChrome && <Header initialUser={initialUser} />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {showChrome && <Footer />}
    </>
  );
}
