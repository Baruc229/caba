import Link from "next/link";

const recentListings = [
  { name: "Appartement Vue Mer", rating: 4.8, reviews: 12 },
  { name: "Chambre Premium", rating: 4.9, reviews: 8 },
  { name: "Villa avec Piscine", rating: 4.7, reviews: 15 },
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      {/* Section 1: Content */}
      <div className="container-caba py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-black tracking-tight">
                Caba<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Caba Residence est un complexe residentiel proposant des logements
              de qualite a louer, des chambres aux villas, pour des sejours
              confortables et elegants.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+22997000000"
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +229 97 00 00 00
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@caba-residence.com"
                  className="flex items-center gap-3 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  info@caba-residence.com
                </a>
              </li>
            </ul>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
              Listings recents
            </h3>
            <ul className="space-y-4">
              {recentListings.map((listing) => (
                <li key={listing.name}>
                  <Link
                    href="/logements"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                        {listing.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {listing.rating} ({listing.reviews} avis)
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/logements"
              className="inline-flex items-center mt-4 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Voir tous les logements
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2: Legal */}
      <div className="border-t border-gray-200">
        <div className="container-caba py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; 2026 Caba Residence. Tous droits reserves.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/mentions-legales" className="hover:text-primary transition-colors">
              Mentions legales
            </Link>
            <Link href="/politique-de-confidentialite" className="hover:text-primary transition-colors">
              Politique de confidentialite
            </Link>
            <Link href="/conditions-generales" className="hover:text-primary transition-colors">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
