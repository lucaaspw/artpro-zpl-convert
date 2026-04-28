"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/app/StatusBadge";
import type { Conversion, ConversionsListResponse } from "@/types";

type Props = {
  /** Incremente apos uma conversao terminar no pai para recarregar a lista sem F5. */
  refreshNonce?: number;
};

export function ConversionHistory({ refreshNonce = 0 }: Props) {
  const [data, setData] = useState<Conversion[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const hasProcessing = useMemo(
    () => data.some((item) => item.status === "processing"),
    [data],
  );

  const load = useCallback(async (targetPage = page) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversions?page=${targetPage}&limit=10`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Falha ao carregar historico.");
      const json: ConversionsListResponse = await response.json();
      setData(json.data);
      setTotal(json.total);
      setPage(json.page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load(1);
  }, [refreshNonce]);

  useEffect(() => {
    if (!hasProcessing) return;
    const timer = setInterval(() => void load(page), 3000);
    return () => clearInterval(timer);
  }, [hasProcessing, page, load]);

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/conversions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao deletar conversao.");
      toast.success("Conversao removida.");
      await load(page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao deletar.");
    }
  }

  async function handleDownload(row: Conversion) {
    try {
      if (!row.pdf_url) return;
      const response = await fetch(row.pdf_url);
      if (!response.ok) throw new Error("Falha ao baixar PDF.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${row.original_filename.replace(/\.[^.]+$/, "")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao baixar.");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <Card className="border border-border/80 bg-card/70 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Historico de Conversoes</CardTitle>
        <p className="rounded-md border border-border bg-background/40 px-2 py-1 text-xs text-muted-foreground">
          Total: {total}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead>Etq</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma conversao encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{row.original_filename}</TableCell>
                  <TableCell>{row.label_count}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={!row.pdf_url}
                        onClick={() => row.pdf_url && window.open(row.pdf_url, "_blank")}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={!row.pdf_url}
                        onClick={() => handleDownload(row)}
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => void load(page - 1)}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => void load(page + 1)}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
