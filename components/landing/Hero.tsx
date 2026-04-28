"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { data: session } = useSession();
  const router = useRouter();

  function handleStart() {
    router.push(session?.user ? "/app" : "/login");
  }

  return (
    <section className="space-y-6 py-16 text-center">
      <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
        Converta ZPL para PDF com qualidade profissional
      </h1>
      <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
        Envie arquivos .zpl, .txt ou .zip e receba o PDF em segundos para visualizar e compartilhar.
      </p>
      <Button size="lg" onClick={handleStart}>
        Comecar Gratuitamente
      </Button>
    </section>
  );
}
