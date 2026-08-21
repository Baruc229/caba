import { FaArrowRight } from "react-icons/fa6";

export default function HomePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
        Caba Residence
      </p>
      <h1 className="heading-display max-w-4xl text-5xl sm:text-7xl lg:text-8xl">
        Votre sejour commence ici
      </h1>
      <p className="mt-8 max-w-xl text-base text-text-secondary sm:text-lg">
        Chambres, studios, suites et villas. Recherche, disponibilites en temps
        reel et reservation en ligne.
      </p>
      <a href="#logements" className="btn-pill mt-10 bg-accent px-8 py-4 text-sm font-semibold text-bg-primary hover:bg-accent-hover">
        Decouvrir les logements
        <FaArrowRight aria-hidden="true" />
      </a>
    </div>
  );
}
