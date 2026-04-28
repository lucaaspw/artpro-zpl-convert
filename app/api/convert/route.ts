import { createSupabaseServerClient } from "@/lib/supabase";
import { requireUserSession } from "@/lib/api-auth";
import { convertZplToPdfBuffer, parseInputFile } from "@/lib/zpl-converter";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".zpl", ".txt", ".zip"];

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > -1 ? filename.slice(dot).toLowerCase() : "";
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const sessionResult = await requireUserSession();
    if ("error" in sessionResult) return sessionResult.error;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Arquivo nao enviado." }, { status: 400 });
    }

    const extension = extensionOf(file.name);
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return Response.json(
        { error: "Formato invalido. Envie .zpl, .txt ou .zip." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json({ error: "Arquivo maior que 10MB." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const userId = sessionResult.session.user.id;

    const { data: created, error: createError } = await supabase
      .from("conversions")
      .insert({
        user_id: userId,
        original_filename: file.name,
        status: "processing",
      })
      .select("id")
      .single();

    if (createError || !created) {
      throw new Error(`Erro ao criar conversao: ${createError?.message ?? "desconhecido"}`);
    }

    const startedAt = Date.now();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { zplContents } = await parseInputFile(file.name, fileBuffer);

    if (!zplContents.length) {
      throw new Error("Nao foi encontrado conteudo ZPL no arquivo enviado.");
    }

    const { pdf: pdfBuffer, pageCount } = await convertZplToPdfBuffer(zplContents);
    const storagePath = `${userId}/${created.id}-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("pdf-outputs")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar PDF no storage: ${uploadError.message}`);
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("pdf-outputs")
      .createSignedUrl(storagePath, 60 * 60);

    if (signedUrlError || !signedUrlData) {
      throw new Error(
        `Erro ao criar URL assinada: ${signedUrlError?.message ?? "desconhecido"}`,
      );
    }

    const processingTimeMs = Date.now() - startedAt;
    const { error: updateError } = await supabase
      .from("conversions")
      .update({
        pdf_url: signedUrlData.signedUrl,
        label_count: pageCount,
        status: "ready",
        processing_time_ms: processingTimeMs,
      })
      .eq("id", created.id)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Erro ao atualizar conversao: ${updateError.message}`);
    }

    return Response.json({
      id: created.id,
      pdf_url: signedUrlData.signedUrl,
      label_count: pageCount,
      processing_time_ms: processingTimeMs,
    });
  } catch (error) {
    console.error("Erro no /api/convert:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro interno." },
      { status: 500 },
    );
  }
}
