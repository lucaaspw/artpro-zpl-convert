import { Upload, Zap, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Upload Simples",
    description: "Envie .zpl, .txt ou .zip com poucos cliques.",
    icon: Upload,
  },
  {
    title: "Conversao Instantanea",
    description: "Processamento rapido para gerar PDFs em segundos.",
    icon: Zap,
  },
  {
    title: "Historico Completo",
    description: "Acesse e gerencie todas as conversoes anteriores.",
    icon: History,
  },
];

export function Features() {
  return (
    <section className="grid grid-cols-1 gap-4 py-8 md:grid-cols-3">
      {features.map((feature) => (
        <Card key={feature.title} className="border border-border bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <feature.icon className="size-4 text-primary" />
              {feature.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {feature.description}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
