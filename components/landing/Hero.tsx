"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { data: session } = useSession();
  const router = useRouter();

  function handleStart() {
    router.push(session?.user ? "/converter" : "/login");
  }

  return (
    <section className="relative overflow-hidden py-14 sm:py-18">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-6 bottom-0 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          <Sparkles className="size-3.5 text-secondary" />
          Ferramenta rápida para visualizar etiquetas sem dor de cabeça
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Converta ZPL para PDF com acabamento profissional em segundos
        </h1>

        <p className="mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Envie arquivos <span className="text-foreground">.zpl, .txt ou .zip</span>, receba o PDF pronto para
          conferir, validar e compartilhar com seu time.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={handleStart}>
            Começar gratuitamente
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={handleStart}>
            Testar agora
          </Button>
        </div>

        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
            <Timer className="mb-2 size-4 text-primary" />
            Processamento rápido e previsível
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mb-2 size-4 text-primary" />
            Fluxo simples para operação diária
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
            <Sparkles className="mb-2 size-4 text-primary" />
            Interface limpa, moderna e objetiva
          </div>
        </div>
      </div>
    </section>
  );
}
