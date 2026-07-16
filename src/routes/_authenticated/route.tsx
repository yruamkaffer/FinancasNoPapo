import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, MessageSquareText, ListChecks, Target, PieChart, LogOut } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard }[] = [
  { to: "/inicio", label: "Início", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageSquareText },
  { to: "/transacoes", label: "Transações", icon: ListChecks },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
];

function Shell() {
  const router = useRouter();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar (mobile + desktop) */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/inicio" className="font-display text-lg font-semibold text-primary">
            Finanças no Papo
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            aria-label="Sair da conta"
          >
            <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 lg:py-8">
        {/* Sidebar desktop */}
        <aside className="hidden w-56 shrink-0 lg:block" aria-label="Navegação principal">
          <NavList onNavigate={() => {}} />
        </aside>

        <main id="conteudo" className="min-w-0 flex-1 pb-24 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background lg:hidden"
      >
        <ul className="mx-auto grid max-w-6xl grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-primary" }}
              >
                <Icon className="size-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate: () => void }): ReactNode {
  return (
    <ul className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <Link
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
