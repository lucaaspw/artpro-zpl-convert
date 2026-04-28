export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} ArtPro ZPL. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-3">
          <span>Privacidade</span>
          <span>Termos</span>
          <span>Suporte</span>
        </div>
      </div>
    </footer>
  );
}
