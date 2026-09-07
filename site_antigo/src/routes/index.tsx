import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { FeaturedSection } from "@/components/FeaturedSection";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { Reveal } from "@/components/Reveal";
import { useEffect, useRef, useState } from "react"; // core hooks
import heroBg from "@/assets/hero.jpg";
import kitsBg from "@/assets/kits-banner.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alquimista Licores — Licores artesanais de Criciúma" },
      { name: "description", content: "Licores artesanais feitos à mão em Criciúma/SC. Pequenos lotes, ingredientes naturais, alma e propósito." },
      { property: "og:title", content: "Alquimista — Licores Artesanais" },
      { property: "og:description", content: "Licores artesanais em pequenos lotes, com alma e propósito." },
    ],
  }),
  component: Index,
});

function Index() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${heroBg})`,
            transform: `translate3d(0, ${scrollY * 0.35}px, 0) scale(1.1)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/85 via-[var(--background)]/70 to-[var(--background)]" />
        <div
          className="relative z-10 reveal max-w-4xl"
          style={{ transform: `translate3d(0, ${scrollY * 0.15}px, 0)`, opacity: Math.max(0, 1 - scrollY / 600) }}
        >
          <div className="mb-8 flex justify-center">
            <svg className="w-12 h-12 text-[var(--gold)] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" strokeLinejoin="round" />
              <circle cx="12" cy="11" r="3" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-wider text-[var(--gold)] leading-tight">
            Licores artesanais<br />feitos como antigamente.
          </h1>
          <p className="font-sans italic text-2xl md:text-3xl text-[var(--text-soft)] mt-8 max-w-2xl mx-auto leading-relaxed">
            Feitos à mão, em pequenos lotes, com alma e propósito.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <Link to="/pocoes" className="btn-cta-mobile px-9 py-4 border border-[var(--gold)]/40 text-[var(--gold)] font-sans tracking-widest text-sm md:text-base uppercase bg-[var(--gold)]/10 hover:bg-[var(--gold)]/15 transition-all rounded-sm font-semibold">Ver as Poções</Link>
            <Link to="/monte-seu-kit" search={{ kit: 'degustacao' }} className="btn-cta-mobile px-9 py-4 border border-[var(--gold)]/40 text-[var(--gold)] font-sans font-semibold tracking-widest text-sm md:text-base uppercase hover:bg-[var(--gold)]/10 transition-all rounded-sm">Montar meu Kit</Link>
          </div>
        </div>
      </section>

      {/* FEATURES BAR */}
      <Reveal as="section" className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          {
            t: "Produção artesanal",
            s: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 mx-auto"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            ),
          },
          {
            t: "Sem corantes artificiais",
            s: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 mx-auto"
                aria-hidden="true"
              >
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
              </svg>
            ),
          },
          {
            t: "Garrafas reutilizadas",
            s: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 mx-auto"
                aria-hidden="true"
              >
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
              </svg>
            ),
          },
          {
            t: "Pequenos lotes",
            s: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 mx-auto"
                aria-hidden="true"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            ),
          },
        ].map((f) => (
            <div key={f.t} className="flex flex-col items-center text-center">
              <div className="text-3xl mb-3 text-[var(--gold)] opacity-80">{f.s}</div>
              <h3 className="font-display tracking-[0.2em] uppercase font-sans font-light text-sm">{f.t}</h3>
            </div>
          ))}
        </div>
      </Reveal>

      {/* STORY */}
      <Reveal as="section" className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="font-sans italic text-xl md:text-2xl text-[var(--text-soft)] leading-relaxed mb-8">
            Na alquimia, transformar o simples em extraordinário é arte. Cada garrafa que sai daqui carrega intenção, ingredientes naturais e cuidado especial.
          </p>
          <h2 className="text-4xl md:text-5xl font-medium text-[var(--cream)] mb-12">Feito com (c)alma.</h2>
          <Link to="/sobre" className="inline-block px-10 py-4 border border-[var(--gold)]/25 text-[var(--gold)] text-sm tracking-widest uppercase font-sans font-semibold hover:border-[var(--gold)] transition-colors rounded-sm">
            Conheça a história do Alquimista
          </Link>
        </div>
      </Reveal>

      <Reveal><FeaturedSection /></Reveal>

      {/* KITS BANNER */}
      <Reveal as="section" className="px-6 py-20">
        <div
          className="max-w-6xl mx-auto relative overflow-hidden rounded-sm border border-[var(--gold)]/25 bg-cover bg-center p-12 md:p-20 text-center gold-glow"
          style={{ backgroundImage: `url(${kitsBg})` }}
        >
          <div className="absolute inset-0 bg-[var(--background)]/70 pointer-events-none" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,_var(--gold)_0%,_transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <p className="font-sans italic text-xl md:text-3xl text-[var(--cream)] leading-relaxed max-w-2xl mx-auto mb-8">
              Para quem merece algo raro.<br />Kits artesanais para ocasiões especiais.
            </p>
            <Link to="/kits" className="inline-block px-8 py-4 bg-[var(--gold)] text-[var(--background)] font-sans tracking-widest text-sm uppercase font-semibold hover:bg-[var(--gold-hover)] transition-colors rounded-sm">
              Explorar Kits
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal><TestimonialsCarousel /></Reveal>
    </div>
  );
}
