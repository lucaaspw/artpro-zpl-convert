import { Upload, Zap, History, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Upload Simples",
    description: "Envie .zpl, .txt ou .zip com poucos cliques.",
    icon: Upload,
  },
  {
    title: "Conversão instantânea",
    description: "Processamento rápido para gerar PDFs em segundos.",
    icon: Zap,
  },
  {
    title: "Histórico completo",
    description: "Acesse e gerencie todas as conversões anteriores.",
    icon: History,
  },
];

export function Features() {
  return (
    <section className="py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold sm:text-3xl">Feito para acelerar sua operação</h2>
        <span className="hidden text-xs text-muted-foreground sm:inline">Do upload ao PDF sem fricção</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="group border border-border/90 bg-card/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_40px_rgba(108,99,255,0.16)]"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <feature.icon className="size-4 text-primary transition-transform duration-200 group-hover:scale-110" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{feature.description}</p>
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <CheckCircle2 className="size-3.5 text-secondary" />
                Simples de usar desde o primeiro acesso
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
