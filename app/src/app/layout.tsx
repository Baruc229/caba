import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/auth/providers";
import { LayoutShell } from "@/components/layout/layout-shell";
import { auth } from "@/lib/auth/config";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#f7f5f1",
};

export const metadata: Metadata = {
  title: "Caba Residence - Location de logements de qualite",
  description:
    "Caba Residence est un complexe residentiel proposant des logements de qualite a louer, des chambres aux villas, pour sejours confortables et elegants.",
  keywords: [
    "location",
    "logement",
    "residence",
    "chambre",
    "studio",
    "appartement",
    "villa",
    "suite",
    "reservation",
  ],
  openGraph: {
    title: "Caba Residence",
    description: "Location de logements de qualite",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  const initialUser = session?.user
    ? {
        prenom: session.user.prenom ?? "",
        nom: session.user.nom ?? "",
        email: session.user.email ?? "",
        role: session.user.role ?? "",
      }
    : null;

  return (
    <html lang="fr" className={`${anton.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-primary">
        <Providers>
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <LayoutShell initialUser={initialUser}>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
