"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/app/DropZone";
import { FileQueue } from "@/components/app/FileQueue";
import { ProgressBar } from "@/components/app/ProgressBar";
import { ConversionHistory } from "@/components/app/ConversionHistory";
import { SupportBanner } from "@/components/shared/SupportBanner";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import type { UploadFile } from "@/types";

export default function AppPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [historyRefreshNonce, setHistoryRefreshNonce] = useState(0);

  function addFiles(newFiles: UploadFile[]) {
    setFiles((current) => [...current, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  async function handleConvert() {
    if (!files.length || converting) return;

    setConverting(true);
    setProgress(10);

    try {
      const first = files[0];
      const formData = new FormData();
      formData.append("file", first.file);
      setProgress(35);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      setProgress(80);

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Falha ao converter arquivo.");
      }

      setProgress(100);
      toast.success("Conversao concluida com sucesso!");
      setFiles([]);
      setHistoryRefreshNonce((n) => n + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro na conversao.");
    } finally {
      setTimeout(() => setProgress(0), 600);
      setConverting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <section className="mb-6 rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-secondary" />
                Painel de conversao
              </p>
              <h1 className="text-2xl font-semibold sm:text-3xl">Transforme ZPL em PDF com 1 clique</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Envie seus arquivos, acompanhe o progresso e mantenha seu historico sempre acessivel.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/50 px-4 py-3 text-sm">
              <p className="text-muted-foreground">Arquivos na fila</p>
              <p className="text-2xl font-semibold">{files.length}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <DropZone onFilesAdded={addFiles} />
            <FileQueue files={files} onRemove={removeFile} />
            <div className="rounded-xl border border-border/80 bg-card/60 p-3">
              <Button
                className="w-full"
                size="lg"
                disabled={!files.length || converting}
                onClick={() => void handleConvert()}
              >
                <Wand2 className="size-4" />
                {converting ? "Convertendo..." : "Converter para PDF"}
              </Button>
              {progress > 0 ? (
                <div className="mt-3">
                  <ProgressBar progress={progress} />
                </div>
              ) : null}
            </div>
            <SupportBanner compact />
          </div>

          <div>
            <ConversionHistory refreshNonce={historyRefreshNonce} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
