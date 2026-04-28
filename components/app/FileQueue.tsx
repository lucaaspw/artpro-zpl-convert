"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UploadFile } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileQueue({
  files,
  onRemove,
}: {
  files: UploadFile[];
  onRemove: (index: number) => void;
}) {
  if (!files.length) return null;

  return (
    <Card className="border border-border bg-card/70">
      <CardHeader>
        <CardTitle className="text-sm">Fila de arquivos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {files.map((item, index) => (
          <div
            key={`${item.file.name}-${index}`}
            className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-foreground">{item.file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
            </div>
            <Button size="icon-sm" variant="ghost" onClick={() => onRemove(index)}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
