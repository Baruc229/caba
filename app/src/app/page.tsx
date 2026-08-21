import { FaArrowRight } from "react-icons/fa6";

export default function HomePage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-12 text-center md:py-20 lg:py-24">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-secondary">
          Caba Résidence
        </p>
        <h1 className="heading-display mx-auto mt-6 max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
          Votre séjour commence ici
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-base text-text-secondary sm:text-lg">
          Chambres, studios, suites et villas. Recherche, disponibilités en
          temps réel et réservation en ligne.
        </p>
        <div className="mt-8">
          <a href="#logements" className="btn-pill btn-primary px-8 py-4">
            Découvrir les logements
            <FaArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
