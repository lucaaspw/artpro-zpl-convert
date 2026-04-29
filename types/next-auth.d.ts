import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** Google `sub` / providerAccountId — persiste no JWT para resolver o usuário em refresh. */
    googleProviderAccountId?: string;
  }
}
