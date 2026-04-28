"use client";

import { useState } from "react";
import Image from "next/image";
import { HandHeart, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Codigo PIX copia e cola (EMV) — mesmo payload do QR em /qrcode.svg */
const PIX_COPIA_COLA =
  "00020126580014BR.GOV.BCB.PIX01365c49711a-6500-47a9-a807-1744881f7b4a5204000053039865802BR5924Lucas da Cunha Goncalves6009SAO PAULO62140510rv43M8gOpW630434A7";

export function SupportBanner({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  async function handleCopyPix() {
    try {
      await navigator.clipboard.writeText(PIX_COPIA_COLA);
      toast.success("Codigo PIX copiado!");
    } catch {
      toast.error("Nao foi possivel copiar o codigo PIX.");
    }
  }

  return (
    <>
      <Card className="border border-border bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <HandHeart className="size-4 text-secondary" />
            Apoie o projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            O ArtPro ZPL é gratuito. Se quiser, voce pode apoiar o projeto via
            PIX.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button
                  className="w-full"
                  variant={compact ? "outline" : "default"}
                />
              }
            >
              Contribuir com PIX
            </DialogTrigger>
            <DialogContent className="border border-border bg-card sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apoie via PIX</DialogTitle>
                <DialogDescription>
                  Escaneie o QR Code no app do seu banco ou copie o codigo
                  abaixo em Pix copia e cola.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="mx-auto flex max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
                  <Image
                    src="/qrcode.svg"
                    alt="QR Code PIX para contribuir"
                    width={235}
                    height={235}
                    className="h-auto w-full"
                    unoptimized
                  />
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-background/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Pix copia e cola
                  </p>
                  <p className="max-h-24 overflow-y-auto break-all font-mono text-[10px] leading-relaxed text-foreground">
                    {PIX_COPIA_COLA}
                  </p>
                  <Button
                    className="w-full"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPix}
                  >
                    <Copy className="size-3.5" />
                    Copiar codigo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
