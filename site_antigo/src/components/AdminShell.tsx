import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Loader2 } from "lucide-react";

const NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/jornada", label: "Jornada" },
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/kits", label: "Kits" },
  { to: "/admin/depoimentos", label: "Depoimentos" },
  { to: "/admin/destaques", label: "Destaques" },
  { to: "/admin/backup", label: "Backup" },
];

export function AdminShell({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session) {
        nav({ to: "/admin/login" });
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!mounted) return;

      if (!roleData) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
        setReady(true);
      }
    }

    checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) nav({ to: "/admin/login" });
      else checkAuth();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [nav]);

  if (isAdmin === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-[var(--gold)] font-display text-xl mb-2">ACESSO NEGADO</h2>
        <p className="text-[var(--cream)]/70 text-sm mb-6 max-w-sm">
          Seu usuário não possui permissão de administrador. Se você acabou de se cadastrar, solicite a liberação.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            nav({ to: "/admin/login" });
          }}
          className="text-xs uppercase tracking-widest text-[var(--gold)] hover:underline"
        >
          Voltar para o Login
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <div className="font-display text-xs tracking-[0.2em] text-[var(--gold)] mb-4">⚗ ADMIN</div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {NAV.map((n) => {
              const active = n.to === "/admin" ? path === "/admin" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 text-sm rounded-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[var(--gold)]/10 text-[var(--gold)] border-l-2 border-[var(--gold)]"
                      : "text-[var(--cream)]/70 hover:text-[var(--gold)]"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                nav({ to: "/admin/login" });
              }}
              className="mt-2 lg:mt-6 flex items-center gap-2 px-3 py-2 text-sm text-[var(--cream)]/60 hover:text-[var(--gold)] transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl lg:text-3xl text-[var(--gold)] tracking-wide">{title}</h1>
            {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}