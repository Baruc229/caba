import { Hero } from "@/components/home/hero";
import { PageHeader } from "@/components/layout/page-header";

export default function HomePage() {
  return (
    <>
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 pt-4">
        <PageHeader
          crumbs={[{ labelKey: "logementDetail.breadcrumbAccueil" }]}
        />
      </div>
      <Hero />
    </>
  );
}