import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createSupabaseServerClient } from "@/lib/supabase";
import { requireEnv } from "@/lib/safeguards";

/** `public.users.id` e UUID; o Google envia `sub` numerico no OAuth. */
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    /**
     * Nunca retorne false aqui por falha no Supabase: isso vira "Acesso negado" no NextAuth
     * mesmo depois do Google ter autenticado. Persistimos o usuario no callback jwt.
     */
    async signIn({ user, account }) {
      if (!user.email) {
        console.error("Login Google sem email no perfil.");
        return false;
      }
      if (account?.provider !== "google") {
        return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      try {
        const rawEmail =
          (typeof user?.email === "string" ? user.email : undefined) ??
          (typeof token.email === "string" ? token.email : undefined);
        if (!rawEmail?.trim()) return token;

        const normalizedEmail = rawEmail.trim().toLowerCase();
        const supabase = createSupabaseServerClient();

        // Primeiro login nesta sessao: persiste usuario e ja fixa token.sub com o UUID do banco.
        if (
          user &&
          account?.provider === "google" &&
          typeof account.providerAccountId === "string"
        ) {
          token.googleProviderAccountId = account.providerAccountId;

          const { data: upserted, error: upsertError } = await supabase
            .from("users")
            .upsert(
              {
                google_id: account.providerAccountId,
                email: normalizedEmail,
                name: user.name,
                avatar_url: user.image,
              },
              { onConflict: "google_id" },
            )
            .select("id")
            .single();

          if (upsertError) {
            console.error(
              "Erro ao salvar usuario no Supabase (verifique tabela users, UNIQUE em google_id e env):",
              upsertError,
            );
          } else if (upserted?.id) {
            token.sub = upserted.id;
            return token;
          }
        }

        const googleId =
          typeof token.googleProviderAccountId === "string"
            ? token.googleProviderAccountId
            : typeof token.sub === "string" && token.sub.length > 0 && !isUuid(token.sub)
              ? token.sub
              : undefined;

        const { data: byEmail, error: emailError } = await supabase
          .from("users")
          .select("id")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (emailError) {
          console.error("Erro ao resolver id do usuario no JWT (email):", emailError);
          return token;
        }

        let dbUserId = byEmail?.id;

        if (!dbUserId && googleId) {
          const { data: byGoogle, error: googleError } = await supabase
            .from("users")
            .select("id")
            .eq("google_id", googleId)
            .maybeSingle();

          if (googleError) {
            console.error("Erro ao resolver id do usuario no JWT (google_id):", googleError);
            return token;
          }
          dbUserId = byGoogle?.id;
        }

        if (dbUserId) {
          token.sub = dbUserId;
          if (googleId) token.googleProviderAccountId = googleId;
        }

        return token;
      } catch (error) {
        console.error("Erro inesperado no JWT callback:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }

        return session;
      } catch (error) {
        console.error("Erro ao montar sessao:", error);
        return session;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: requireEnv("NEXTAUTH_SECRET"),
};
