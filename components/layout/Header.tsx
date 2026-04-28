"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/UserAvatar";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-heading text-lg font-semibold">
          ArtPro ZPL
        </Link>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/app">
                <Button variant="ghost">App</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost">Perfil</Button>
              </Link>
              <div className="hidden sm:block">
                <UserAvatar
                  name={session.user.name}
                  email={session.user.email}
                  image={session.user.image}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="size-4" />
                Sair
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
