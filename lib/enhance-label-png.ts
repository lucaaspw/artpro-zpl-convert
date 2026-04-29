import sharp from "sharp";
import {
  resolveRasterEnhanceEnabled,
  resolveRasterSharpenSigma,
  resolveRasterSuperSampleScale,
} from "@/lib/labelary-config";

/** Evita PNG gigante na memória após super-sample. */
const MAX_EDGE_PX = 4000;

/**
 * Melhora legibilidade de texto/barras no PDF sem mudar o dpmm do Labelary:
 * upscale (supersampling) + sharpen leve; o PDF continua no mesmo tamanho em pontos.
 */
export async function enhanceLabelPngForPdf(pngBuffer: Buffer): Promise<Buffer> {
  if (!resolveRasterEnhanceEnabled()) {
    return pngBuffer;
  }

  try {
    const scale = resolveRasterSuperSampleScale();
    const sharpenSigma = resolveRasterSharpenSigma();

    const meta = await sharp(pngBuffer).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (!w || !h) return pngBuffer;

    let pipeline = sharp(pngBuffer);

    if (scale > 1) {
      let nw = Math.round(w * scale);
      let nh = Math.round(h * scale);
      if (nw > MAX_EDGE_PX || nh > MAX_EDGE_PX) {
        const f = Math.min(MAX_EDGE_PX / nw, MAX_EDGE_PX / nh, 1);
        nw = Math.max(1, Math.floor(nw * f));
        nh = Math.max(1, Math.floor(nh * f));
      }
      pipeline = pipeline.resize(nw, nh, {
        kernel: sharp.kernel.lanczos3,
        fit: "fill",
      });
    }

    if (sharpenSigma > 0) {
      pipeline = pipeline.sharpen({
        sigma: sharpenSigma,
        m1: 1,
        m2: 2,
      });
    }

    return await pipeline.png({ compressionLevel: 6 }).toBuffer();
  } catch (error) {
    console.warn("[enhanceLabelPngForPdf] falhou, usando PNG original:", error);
    return pngBuffer;
  }
}
