import { SupportBanner } from "@/components/shared/SupportBanner";
import { HeartHandshake } from "lucide-react";

export function Pricing() {
  return (
    <section className="py-10">
      <div className="mb-5 text-center">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <HeartHandshake className="size-3.5 text-secondary" />
          Projeto independente
        </p>
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Gratuito para sempre, com apoio opcional da comunidade
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Se o ZPL Convert te ajuda no dia a dia, uma contribuição por PIX ajuda a manter a ferramenta evoluindo.
        </p>
      </div>
      <div className="mx-auto max-w-xl">
        <SupportBanner />
      </div>
    </section>
  );
}
