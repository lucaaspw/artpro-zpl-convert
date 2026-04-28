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

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2">
        <section className="space-y-4">
          <DropZone onFilesAdded={addFiles} />
          <FileQueue files={files} onRemove={removeFile} />
          <Button className="w-full" size="lg" disabled={!files.length || converting} onClick={() => void handleConvert()}>
            Converter para PDF
          </Button>
          {progress > 0 ? <ProgressBar progress={progress} /> : null}
          <SupportBanner compact />
        </section>

        <section>
          <ConversionHistory refreshNonce={historyRefreshNonce} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
