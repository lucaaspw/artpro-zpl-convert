"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { UploadFile } from "@/types";

const ACCEPTED = [".zpl", ".txt", ".zip"];
const MAX_BYTES = 10 * 1024 * 1024;

function extension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > -1 ? name.slice(dot).toLowerCase() : "";
}

export function DropZone({
  onFilesAdded,
}: {
  onFilesAdded: (files: UploadFile[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndMap(filesList: FileList | null): UploadFile[] {
    if (!filesList) return [];
    const mapped: UploadFile[] = [];

    for (const file of Array.from(filesList)) {
      const ext = extension(file.name);
      if (!ACCEPTED.includes(ext)) {
        toast.error(`Formato invalido: ${file.name}`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`Arquivo excede 10MB: ${file.name}`);
        continue;
      }
      mapped.push({ file, progress: 0, status: "pending" });
    }

    return mapped;
  }

  function handleFiles(filesList: FileList | null) {
    const files = validateAndMap(filesList);
    if (files.length) onFilesAdded(files);
  }

  return (
    <div
      className={`rounded-2xl border border-dashed p-6 text-center transition-all ${
        isDragging
          ? "border-primary bg-primary/10 shadow-[0_0_36px_rgba(108,99,255,0.25)]"
          : "border-border/90 bg-card/70 hover:border-primary/40 hover:bg-card"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".zpl,.txt,.zip"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
        <UploadCloud className="size-6 text-primary" />
      </div>
      <p className="text-sm font-medium text-foreground">Arraste seus arquivos aqui</p>
      <p className="mb-4 text-xs text-muted-foreground">Formatos aceitos: .zpl, .txt e .zip (max. 10MB)</p>
      <Button variant="outline" onClick={() => inputRef.current?.click()}>
        Selecionar Arquivos
      </Button>
    </div>
  );
}
