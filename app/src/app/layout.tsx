import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${anton.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-primary">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
