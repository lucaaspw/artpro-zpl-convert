import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import {
  buildLabelaryPdfUrl,
  buildLabelaryPngUrl,
  labelSizeToPdfPoints,
  labelaryRequestGapMs,
  resolveLabelaryPdfPipeline,
} from "@/lib/labelary-config";
import { enhanceLabelPngForPdf } from "@/lib/enhance-label-png";

interface ParsedZplResult {
  zplContents: string[];
}

export interface ConvertPdfResult {
  pdf: Buffer;
  /** Total de páginas / etiquetas no PDF final. */
  pageCount: number;
}

const MAX_LABELS_PER_ZPL = 50;

function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > -1 ? filename.slice(dot).toLowerCase() : "";
}

async function parseZip(buffer: Buffer): Promise<string[]> {
  const zip = await JSZip.loadAsync(buffer);
  const zplEntries: string[] = [];

  const entries = Object.values(zip.files).filter((entry) => {
    if (entry.dir) return false;
    const ext = fileExtension(entry.name);
    return ext === ".zpl" || ext === ".txt";
  });

  for (const entry of entries) {
    const content = await entry.async("string");
    if (content.trim()) {
      zplEntries.push(content);
    }
  }

  return zplEntries;
}

export async function parseInputFile(
  originalFilename: string,
  buffer: Buffer,
): Promise<ParsedZplResult> {
  const ext = fileExtension(originalFilename);

  if (ext === ".zpl" || ext === ".txt") {
    return { zplContents: [buffer.toString("utf-8")] };
  }

  if (ext === ".zip") {
    const zplContents = await parseZip(buffer);
    return { zplContents };
  }

  throw new Error("Formato inválido. Envie .zpl, .txt ou .zip.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callLabelaryPdfWithRetry(zpl: string, attempt = 0): Promise<Buffer> {
  const form = new FormData();
  form.append("file", new Blob([zpl], { type: "text/plain" }), "label.zpl");

  const response = await fetch(buildLabelaryPdfUrl(), {
    method: "POST",
    headers: { Accept: "application/pdf" },
    body: form,
  });

  if (response.status === 429 && attempt < 3) {
    await sleep(1000 * (attempt + 1));
    return callLabelaryPdfWithRetry(zpl, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`Labelary error: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function callLabelaryPngAtIndexWithRetry(
  zpl: string,
  labelIndex: number,
  attempt = 0,
): Promise<{ ok: true; buffer: Buffer } | { ok: false; notFound: boolean }> {
  const form = new FormData();
  form.append("file", new Blob([zpl], { type: "text/plain" }), "label.zpl");

  const response = await fetch(buildLabelaryPngUrl(labelIndex), {
    method: "POST",
    headers: { Accept: "image/png" },
    body: form,
  });

  if (response.status === 404) {
    return { ok: false, notFound: true };
  }

  if (response.status === 429 && attempt < 3) {
    await sleep(1000 * (attempt + 1));
    return callLabelaryPngAtIndexWithRetry(zpl, labelIndex, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`Labelary error: ${response.status}`);
  }

  return { ok: true, buffer: Buffer.from(await response.arrayBuffer()) };
}

/** Busca PNG da etiqueta 0, 1, ... até 404 (fim do lote ZPL). */
async function fetchPngPagesForZpl(zpl: string): Promise<Buffer[]> {
  const gap = labelaryRequestGapMs();
  const pngs: Buffer[] = [];

  for (let i = 0; i < MAX_LABELS_PER_ZPL; i++) {
    if (i > 0 && gap > 0) await sleep(gap);

    const result = await callLabelaryPngAtIndexWithRetry(zpl, i);
    if (!result.ok) {
      if (result.notFound) {
        if (i === 0) {
          throw new Error(
            "Labelary não gerou etiquetas (ZPL vazio ou inválido, ou índice 0 inexistente).",
          );
        }
        break;
      }
    } else {
      pngs.push(result.buffer);
    }
  }

  if (!pngs.length) {
    throw new Error("Nenhuma etiqueta PNG retornada pelo Labelary.");
  }

  return pngs;
}

/** Cada PNG é desenhado ocupando 100% da página em pontos (preenche a folha). */
async function buildPdfFromPngPages(pngBuffers: Buffer[]): Promise<Buffer> {
  const { widthPt, heightPt } = labelSizeToPdfPoints();
  const pdf = await PDFDocument.create();

  for (const pngBytes of pngBuffers) {
    const enhanced = await enhanceLabelPngForPdf(pngBytes);
    const page = pdf.addPage([widthPt, heightPt]);
    const png = await pdf.embedPng(enhanced);
    page.drawImage(png, {
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt,
    });
  }

  return Buffer.from(await pdf.save());
}

async function convertZplToPdfBufferRaster(zplContents: string[]): Promise<ConvertPdfResult> {
  const gap = labelaryRequestGapMs();
  const allPngs: Buffer[] = [];

  for (let c = 0; c < zplContents.length; c++) {
    if (c > 0 && gap > 0) await sleep(gap);
    const chunkPngs = await fetchPngPagesForZpl(zplContents[c]);
    allPngs.push(...chunkPngs);
  }

  const pdf = await buildPdfFromPngPages(allPngs);
  return { pdf, pageCount: allPngs.length };
}

async function convertZplToPdfBufferVector(zplContents: string[]): Promise<ConvertPdfResult> {
  if (zplContents.length === 1) {
    const pdf = await callLabelaryPdfWithRetry(zplContents[0]);
    const doc = await PDFDocument.load(pdf);
    return { pdf, pageCount: doc.getPageCount() };
  }

  const merged = await PDFDocument.create();

  for (const zpl of zplContents) {
    const pdfBytes = await callLabelaryPdfWithRetry(zpl);
    const part = await PDFDocument.load(pdfBytes);
    const copied = await merged.copyPages(part, part.getPageIndices());
    for (const page of copied) {
      merged.addPage(page);
    }
  }

  const pageCount = merged.getPageCount();
  const bytes = await merged.save();
  return { pdf: Buffer.from(bytes), pageCount };
}

/**
 * Converte ZPL em PDF: várias etiquetas por arquivo, vários arquivos no zip.
 * Padrão: pipeline raster (PNG esticado na folha = preenchimento total).
 */
export async function convertZplToPdfBuffer(zplContents: string[]): Promise<ConvertPdfResult> {
  if (!zplContents.length) {
    throw new Error("Nenhum conteúdo ZPL foi encontrado para conversão.");
  }

  if (resolveLabelaryPdfPipeline() === "vector") {
    return convertZplToPdfBufferVector(zplContents);
  }

  return convertZplToPdfBufferRaster(zplContents);
}
