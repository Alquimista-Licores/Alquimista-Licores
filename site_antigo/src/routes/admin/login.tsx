import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin · Alquimista Licores" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Credenciais inválidas" : error.message);
      return;
    }
    toast.success("Bem-vindo de volta, Alquimista.");
    nav({ to: "/admin" });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm border border-[var(--gold)]/25 bg-[var(--surface)] p-8 rounded-md gold-glow">
        <div className="text-center mb-6">
          <div className="text-2xl text-[var(--gold)] mb-2">⚗</div>
          <h1 className="font-display text-xl text-[var(--gold)] tracking-widest">ENTRADA DO ALQUIMISTA</h1>
        </div>
        <label className="block text-xs uppercase tracking-widest text-[var(--cream)]/60 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 bg-[var(--background)] border border-[var(--gold)]/20 rounded-sm px-3 py-2 text-[var(--cream)] focus:border-[var(--gold)] outline-none"
        />
        <label className="block text-xs uppercase tracking-widest text-[var(--cream)]/60 mb-1">Senha</label>
        <input
          type="password"
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full mb-6 bg-[var(--background)] border border-[var(--gold)]/20 rounded-sm px-3 py-2 text-[var(--cream)] focus:border-[var(--gold)] outline-none"
        />
        <button
          disabled={loading}
          className="w-full py-3 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase hover:bg-[var(--gold-hover)] transition-colors rounded-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}Entrar
        </button>
      </form>
    </div>
  );
}