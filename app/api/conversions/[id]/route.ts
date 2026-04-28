import { createSupabaseServerClient } from "@/lib/supabase";
import { requireUserSession } from "@/lib/api-auth";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const sessionResult = await requireUserSession();
    if ("error" in sessionResult) return sessionResult.error;

    const { id } = await context.params;
    const userId = sessionResult.session.user.id;
    const supabase = createSupabaseServerClient();

    const { data: conversion, error: findError } = await supabase
      .from("conversions")
      .select("id, pdf_url")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (findError) {
      throw new Error(`Erro ao consultar conversao: ${findError.message}`);
    }

    if (!conversion) {
      return Response.json({ error: "Conversao nao encontrada." }, { status: 404 });
    }

    if (conversion.pdf_url) {
      const splitFromBucket = conversion.pdf_url.split("/pdf-outputs/");
      if (splitFromBucket.length > 1) {
        const path = splitFromBucket[1].split("?")[0];
        if (path) {
          const { error: removeStorageError } = await supabase.storage
            .from("pdf-outputs")
            .remove([path]);

          if (removeStorageError) {
            console.warn("Falha ao remover arquivo do storage:", removeStorageError);
          }
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("conversions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error(`Erro ao deletar conversao: ${deleteError.message}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro no DELETE /api/conversions/[id]:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro interno." },
      { status: 500 },
    );
  }
}
