import { createSupabaseServerClient } from "@/lib/supabase";
import { requireUserSession } from "@/lib/api-auth";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export async function GET(request: Request) {
  try {
    const sessionResult = await requireUserSession();
    if ("error" in sessionResult) return sessionResult.error;

    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get("page"), DEFAULT_PAGE);
    const limit = parsePositiveInt(url.searchParams.get("limit"), DEFAULT_LIMIT);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = createSupabaseServerClient();
    const userId = sessionResult.session.user.id;

    const { data, count, error } = await supabase
      .from("conversions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Erro ao buscar conversoes: ${error.message}`);
    }

    return Response.json({
      data: data ?? [],
      total: count ?? 0,
      page,
    });
  } catch (error) {
    console.error("Erro no GET /api/conversions:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro interno." },
      { status: 500 },
    );
  }
}
