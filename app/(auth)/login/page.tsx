"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LoginErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  const messages: Record<string, string> = {
    AccessDenied:
      "Acesso negado. Se isso aparecia após o Google, tente de novo: o login não deve mais bloquear por erro no banco.",
    OAuthSignin:
      "Falha ao iniciar login com Google. Verifique Client ID/Secret e URL de callback no Google Cloud.",
    OAuthCallback:
      "Falha no retorno do Google. Confira se a URI de redirecionamento esta correta no console Google.",
    OAuthAccountNotLinked:
      "Esta conta já está vinculada a outro método de login.",
    Configuration:
      "Erro de configuração do servidor (ex.: NEXTAUTH_SECRET ou variáveis OAuth).",
  };

  const text = messages[error] ?? `Erro de autenticação: ${error}`;

  return (
    <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
      {text}
    </p>
  );
}

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/converter");
    }
  }, [router, status]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1c1c34_0%,#0a0a0f_50%)] px-4">
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">ArtPro ZPL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={null}>
            <LoginErrorMessage />
          </Suspense>
          <Button
            className="w-full"
            size="lg"
            onClick={() => signIn("google", { callbackUrl: "/converter" })}
          >
            Continuar com Google
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Gratuito. Sem cartão de crédito.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
