import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireUserSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: Response.json({ error: "Nao autenticado." }, { status: 401 }) };
  }

  return { session };
}
