import { Hero } from "@/components/home/hero";
import { PageHeader } from "@/components/layout/page-header";

export default function HomePage() {
  return (
    <>
      <div className="mx-auto max-w-[1300px] px-4 pt-8 sm:px-6 sm:pt-10">
        <PageHeader
          crumbs={[{ labelKey: "logementDetail.breadcrumbAccueil" }]}
        />
      </div>
      <Hero />
    </>
  );
}