import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: "processing" | "ready" | "error" }) {
  if (status === "ready") {
    return <Badge variant="secondary">Pronto</Badge>;
  }

  if (status === "error") {
    return <Badge variant="destructive">Erro</Badge>;
  }

  return <Badge variant="outline">Processando</Badge>;
}
