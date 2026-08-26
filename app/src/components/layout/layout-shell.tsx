"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const HIDE_CHROME = ["/admin"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChrome = !HIDE_CHROME.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  return (
    <>
      {showChrome && <Header />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {showChrome && <Footer />}
    </>
  );
}
