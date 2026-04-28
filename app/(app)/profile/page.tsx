import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const supabase = createSupabaseServerClient();
  const { data: conversions } = await supabase
    .from("conversions")
    .select("label_count")
    .eq("user_id", session.user.id);

  const totalConversions = conversions?.length ?? 0;
  const totalLabels = (conversions ?? []).reduce((sum, row) => sum + (row.label_count ?? 0), 0);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-6">
        <Card className="border border-border bg-card/70">
          <CardContent className="flex items-center gap-4 pt-6">
            <UserAvatar
              name={session.user.name}
              email={session.user.email}
              image={session.user.image}
            />
            <div>
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">Conversoes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalConversions}</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-base">Etiquetas processadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalLabels}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-base">Zona de risco</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Deletar minha conta</Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
