const ALLOWED_DPMM = new Set(["6dpmm", "8dpmm", "12dpmm", "24dpmm"]);

/**
 * Densidade do Labelary na URL da API. Valores maiores mudam o "tamanho lógico" do render e podem
 * desalinhar da folha 4x6. Padrão **8dpmm** (comum em ZPL de transportadoras); nitidez extra vem do
 * pós-processamento PNG (`LABELARY_RASTER_SUPER_SAMPLE` etc.).
 *
 * Env: LABELARY_RENDER_DPMM=8dpmm | 12dpmm | 24dpmm | 6dpmm
 */
export function resolveLabelaryDpmm(): string {
  const raw = process.env.LABELARY_RENDER_DPMM?.trim().toLowerCase() ?? "";
  if (raw && ALLOWED_DPMM.has(raw)) return raw;
  return "8dpmm";
}

/**
 * Tamanho da etiqueta em polegadas (largura x altura), igual ao trecho da URL do Labelary.
 * Ajuste se o ZPL for pensado para outro tamanho (ex.: 3x2).
 *
 * Env: LABELARY_LABEL_SIZE=4x6  ou  LABELARY_LABEL_WIDTH + LABELARY_LABEL_HEIGHT
 */
export function resolveLabelSizeInches(): { width: string; height: string } {
  const combined = process.env.LABELARY_LABEL_SIZE?.trim();
  if (combined?.toLowerCase().includes("x")) {
    const [a, b] = combined.split(/x/i).map((s) => s.trim());
    if (a && b && /^\d+(\.\d+)?$/.test(a) && /^\d+(\.\d+)?$/.test(b)) {
      return { width: a, height: b };
    }
  }

  const w = process.env.LABELARY_LABEL_WIDTH?.trim();
  const h = process.env.LABELARY_LABEL_HEIGHT?.trim();
  if (w && h && /^\d+(\.\d+)?$/.test(w) && /^\d+(\.\d+)?$/.test(h)) {
    return { width: w, height: h };
  }

  return { width: "4", height: "6" };
}

/** Base da API (plano pago usa outro host). */
export function resolveLabelaryApiBase(): string {
  const raw = process.env.LABELARY_API_BASE_URL?.trim() ?? "https://api.labelary.com";
  return raw.replace(/\/$/, "");
}

export function buildLabelaryPdfUrl(): string {
  const base = resolveLabelaryApiBase();
  const dpmm = resolveLabelaryDpmm();
  const { width, height } = resolveLabelSizeInches();
  return `${base}/v1/printers/${dpmm}/labels/${width}x${height}/`;
}

/** URL com índice da etiqueta (0..n-1) — necessário para PNG; PDF multi-etiqueta omite o índice. */
export function buildLabelaryPngUrl(labelIndex: number): string {
  const base = resolveLabelaryApiBase();
  const dpmm = resolveLabelaryDpmm();
  const { width, height } = resolveLabelSizeInches();
  return `${base}/v1/printers/${dpmm}/labels/${width}x${height}/${labelIndex}/`;
}

/** Tamanho da página do PDF em pontos (1 pol = 72 pt), alinhado ao tamanho configurado no Labelary. */
export function labelSizeToPdfPoints(): { widthPt: number; heightPt: number } {
  const { width, height } = resolveLabelSizeInches();
  const w = Number.parseFloat(width);
  const h = Number.parseFloat(height);
  return { widthPt: w * 72, heightPt: h * 72 };
}

/**
 * raster (padrão): PNG por etiqueta esticado na folha inteira — melhor preenchimento visual.
 * vector: PDF direto do Labelary — mais rápido, mas o desenho pode não ocupar toda a área.
 */
export function resolveLabelaryPdfPipeline(): "raster" | "vector" {
  const raw = process.env.LABELARY_PDF_PIPELINE?.trim().toLowerCase() ?? "";
  if (raw === "vector") return "vector";
  return "raster";
}

/** Pausa entre chamadas ao Labelary (plano free ~3 req/s). */
export function labelaryRequestGapMs(): number {
  const raw = Number(process.env.LABELARY_REQUEST_GAP_MS);
  if (Number.isFinite(raw) && raw >= 0 && raw <= 10_000) return Math.floor(raw);
  return 360;
}

/** Liga upscale + sharpen no pipeline raster. `0` desliga (só PNG cru do Labelary). */
export function resolveRasterEnhanceEnabled(): boolean {
  return process.env.LABELARY_RASTER_ENHANCE?.trim() !== "0";
}

/**
 * Multiplica largura/altura do PNG (8dpmm) antes de embutir no PDF — o viewer imprime o mesmo
 * tamanho físico com mais pixels (supersampling). Padrão 2. Use 1 para desligar upscale.
 */
export function resolveRasterSuperSampleScale(): number {
  const raw = Number(process.env.LABELARY_RASTER_SUPER_SAMPLE);
  if (!Number.isFinite(raw) || raw < 1) return 2;
  return Math.min(4, Math.floor(raw));
}

/** Sigma do sharpen LAB (sharp). 0 = sem sharpen. Padrão 1 se a env não existir. */
export function resolveRasterSharpenSigma(): number {
  const raw = process.env.LABELARY_RASTER_SHARPEN_SIGMA?.trim();
  if (raw === undefined || raw === "") return 1;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  if (n <= 0) return 0;
  return Math.min(3, n);
}
