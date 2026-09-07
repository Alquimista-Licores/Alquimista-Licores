import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type T = { id: string; nome: string; texto: string };

export function TestimonialsCarousel() {
  const { data } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("id,nome,texto").eq("ativo", true);
      return (data ?? []) as T[];
    },
  });

  if (!data || data.length === 0) return null;
  const loop = [...data, ...data];

  return (
    <section className="py-20 overflow-hidden border-y border-[var(--gold)]/10 bg-[var(--surface)]/30">
      <div className="text-center mb-10 px-6">
        <h2 className="text-3xl md:text-4xl font-medium text-[var(--cream)] uppercase tracking-[0.12em]">O que dizem nossos apreciadores</h2>
        <div className="w-16 h-px bg-[var(--gold)]/40 mx-auto mt-4" />
      </div>
      <div className="testi-track-wrap" style={{ ["--n" as any]: data.length }}>
        <div className="testi-track">
          {loop.map((t, i) => (
            <div key={`${t.id}-${i}`} className="testi-card">
              <div className="font-display text-3xl text-[var(--gold)] leading-none mb-2">"</div>
              <p className="font-sans italic text-base md:text-lg text-[var(--cream)]/90 leading-relaxed">{t.texto}</p>
              <div className="flex gap-1 mt-4 text-[var(--gold)]">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>
              <div className="font-display text-base md:text-lg tracking-widest uppercase text-[var(--gold)] mt-3">— {t.nome}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-12 px-6">
        <p className="font-sans italic text-lg text-[var(--text-soft)] mb-4">
          Compartilhe sua experiência e apareça aqui.
        </p>
        <a
          href="https://g.page/r/CWzwaZr9lnaDEAE/review"
          target="_blank"
          rel="noreferrer"
          className="inline-block px-12 py-5 bg-transparent border border-[var(--gold)] text-[var(--gold)] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[var(--gold)] hover:text-[var(--background)] transition-all rounded-sm text-xs"
        >
          Deixar minha avaliação
        </a>
      </div>
    </section>
  );
}