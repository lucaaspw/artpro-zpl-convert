import { SupportBanner } from "@/components/shared/SupportBanner";

export function Pricing() {
  return (
    <section className="py-8">
      <h2 className="mb-4 text-center text-2xl font-semibold">
        Gratuito, mas vc pode apoiar o projeto
      </h2>
      <div className="mx-auto max-w-xl">
        <SupportBanner />
      </div>
    </section>
  );
}
