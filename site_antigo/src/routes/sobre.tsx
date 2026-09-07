import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import origemAsset from "@/assets/sobre-origem.png.asset.json";
import processoAsset from "@/assets/sobre-processo.png.asset.json";
import cicloAsset from "@/assets/sobre-ciclo.png.asset.json";
import filosofiaAsset from "@/assets/sobre-filosofia.png.asset.json";
import g00 from "@/assets/glyphs/glyph_00.png.asset.json";
import g01 from "@/assets/glyphs/glyph_01.png.asset.json";
import g02 from "@/assets/glyphs/glyph_02.png.asset.json";
import g03 from "@/assets/glyphs/glyph_03.png.asset.json";
import g04 from "@/assets/glyphs/glyph_04.png.asset.json";
import g05 from "@/assets/glyphs/glyph_05.png.asset.json";
import g06 from "@/assets/glyphs/glyph_06.png.asset.json";
import g07 from "@/assets/glyphs/glyph_07.png.asset.json";
import g08 from "@/assets/glyphs/glyph_08.png.asset.json";
import g09 from "@/assets/glyphs/glyph_09.png.asset.json";
import g10 from "@/assets/glyphs/glyph_10.png.asset.json";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Alquimista — Alquimista Licores" },
      { name: "description", content: "A história do Alquimista — artesão que transforma frutas, ervas e tempo em licores autorais, em Criciúma/SC." },
      { property: "og:title", content: "Sobre o Alquimista — Alquimista Licores" },
      { property: "og:description", content: "Ingredientes simples atravessando o ritual da transformação. Feito com (c)alma, em Criciúma/SC." },
      { property: "og:url", content: "/sobre" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

function PhotoVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-auto rounded-sm"
      loading="lazy"
    />
  );
}

/**
 * Parallax backdrop: fixed layer with alchemical glyphs and glowing orbs
 * moving at different speeds/blurs to give a subtle 3D depth on scroll.
 * Purely decorative — pointer-events disabled, respects reduced motion.
 */
function ParallaxBackdrop() {
  const [y, setY] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 11 golden glyphs distributed across the full document height.
  // depth: 0 = deepest (heaviest blur, slowest parallax) → 1 = shallowest (sharper, faster).
  // parallax factor: positive value = trails scroll (looks far); negative = leads (looks near).
  const glyphSrcs = [g00, g01, g02, g03, g04, g05, g06, g07, g08, g09, g10];
  // depth: 0 = deep background (huge blur, near-zero parallax movement)
  //        1 = foreground (crisp, fastest parallax lead)
  type Glyph = { src: string; top: string; left: string; size: number; depth: number };
  const glyphs: Glyph[] = [
    // Big deep glyphs — very blurred, almost static
    { src: glyphSrcs[0].url,  top: "3%",  left: "-6%", size: 320, depth: 0.02 },
    { src: glyphSrcs[4].url,  top: "34%", left: "82%", size: 300, depth: 0.05 },
    { src: glyphSrcs[9].url,  top: "86%", left: "20%", size: 340, depth: 0.00 },
    // Mid-depth glyphs
    { src: glyphSrcs[3].url,  top: "24%", left: "8%",  size: 200, depth: 0.35 },
    { src: glyphSrcs[6].url,  top: "56%", left: "72%", size: 180, depth: 0.45 },
    { src: glyphSrcs[7].url,  top: "68%", left: "4%",  size: 220, depth: 0.30 },
    { src: glyphSrcs[10].url, top: "94%", left: "64%", size: 190, depth: 0.40 },
    // Small shallow glyphs — crisp, fast
    { src: glyphSrcs[1].url,  top: "9%",  left: "78%", size: 80,  depth: 0.90 },
    { src: glyphSrcs[2].url,  top: "18%", left: "42%", size: 70,  depth: 0.95 },
    { src: glyphSrcs[5].url,  top: "48%", left: "22%", size: 75,  depth: 0.88 },
    { src: glyphSrcs[8].url,  top: "78%", left: "86%", size: 85,  depth: 0.92 },
    { src: glyphSrcs[2].url,  top: "40%", left: "50%", size: 60,  depth: 1.00 },
    { src: glyphSrcs[5].url,  top: "72%", left: "48%", size: 65,  depth: 0.97 },
  ];

  // Golden orbs — soft radial glows, deep background, very slow.
  type Orb = { top: string; left: string; size: number; depth: number; hue: string };
  const orbs: Orb[] = [
    { top: "5%",  left: "60%", size: 520, depth: 0.05, hue: "var(--gold)" },
    { top: "38%", left: "-8%", size: 460, depth: 0.02, hue: "var(--amber-warm)" },
    { top: "70%", left: "70%", size: 560, depth: 0.08, hue: "var(--gold)" },
  ];

  // Sparks: sharp, no blur, appear closest → strongest parallax lead.
  const sparks = [
    { top: "6%",  left: "48%", size: 6 },
    { top: "22%", left: "70%", size: 5 },
    { top: "31%", left: "12%", size: 4 },
    { top: "44%", left: "56%", size: 6 },
    { top: "55%", left: "30%", size: 5 },
    { top: "63%", left: "88%", size: 4 },
    { top: "72%", left: "40%", size: 6 },
    { top: "83%", left: "66%", size: 5 },
    { top: "91%", left: "14%", size: 4 },
  ];

  // Parallax translate: absolutely-positioned layers already scroll with
  // content. We add a translate to reshape that: positive value = trail
  // (looks slower/deeper), negative = lead (looks faster/closer).
  // Deep glyphs get strong positive (near-static), shallow get strong negative.
  const glyphFactor = (depth: number) => 0.85 * (1 - depth) - 0.45 * depth;
  const orbFactor = (depth: number) => 0.95 * (1 - depth);
  const sparkFactor = -0.15;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {orbs.map((o, i) => {
        const blur = 80 + (1 - o.depth) * 40;
        return (
          <div
            key={`o-${i}`}
            style={{
              position: "absolute",
              top: o.top,
              left: o.left,
              width: o.size,
              height: o.size,
              borderRadius: "9999px",
              background: `radial-gradient(circle, ${o.hue} 0%, transparent 65%)`,
              opacity: 0.28,
              filter: `blur(${blur.toFixed(0)}px)`,
              transform: `translate3d(0, ${(y * orbFactor(o.depth)).toFixed(1)}px, 0)`,
              willChange: "transform",
            }}
          />
        );
      })}
      {glyphs.map((g, i) => {
        // depth 0 → 22px blur, depth 1 → 0px blur (bigger spread)
        const blur = Math.pow(1 - g.depth, 1.4) * 22;
        // deeper → dimmer; shallow crisp glyphs are brighter
        const opacity = 0.16 + g.depth * 0.42;
        return (
          <img
            key={`g-${i}`}
            src={g.src}
            alt=""
            style={{
              position: "absolute",
              top: g.top,
              left: g.left,
              width: g.size,
              height: "auto",
              opacity,
              filter: blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : undefined,
              transform: `translate3d(0, ${(y * glyphFactor(g.depth)).toFixed(1)}px, 0)`,
              willChange: "transform",
              userSelect: "none",
            }}
            draggable={false}
            loading="lazy"
          />
        );
      })}
      {sparks.map((s, i) => (
        <div
          key={`s-${i}`}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: "9999px",
            background: "var(--gold)",
            boxShadow: "0 0 12px 2px var(--gold)",
            opacity: 0.9,
            transform: `translate3d(0, ${(y * sparkFactor).toFixed(1)}px, 0)`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

interface StorySectionProps {
  title: string;
  text: string;
  visual: React.ReactNode;
  reverse?: boolean;
}

function StorySection({ title, text, visual, reverse }: StorySectionProps) {
  return (
    <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-8 md:gap-14 items-center`}>
      <div className="w-full md:w-1/2">
        {visual}
      </div>
      <div className="w-full md:w-1/2 space-y-4">
        <h2 className="text-2xl md:text-3xl text-[var(--gold)] tracking-wide">{title}</h2>
        <p className="font-body text-base md:text-lg leading-relaxed text-[var(--cream)]/90">{text}</p>
      </div>
    </div>
  );
}

function SobrePage() {
  return (
    <div className="relative">
      <ParallaxBackdrop />
      <div className="max-w-6xl mx-auto px-6 pb-16 md:pb-24 relative">
      <PageHeader title="O Alquimista" subtitle="Ingredientes simples atravessando o ritual da transformação." />

      {/* Story sections — alternating layout */}
      <div className="space-y-20 md:space-y-32">
        <StorySection
          title="A Origem"
          text="O Alquimista nasceu da ideia de transformar ingredientes naturais em algo memorável. Inspirados pela alquimia medieval, criamos receitas que unem sabor, simbolismo e processo artesanal."
          visual={<PhotoVisual src={origemAsset.url} alt="Rótulo do Alquimista Licores" />}
        />

        <StorySection
          title="O Processo"
          text="Cada lote é produzido manualmente, em pequena escala e sem atalhos. Utilizamos ingredientes naturais, sem corantes artificiais ou químicos desnecessários."
          visual={<PhotoVisual src={processoAsset.url} alt="Infusão de banana e canela em garrafa de vidro" />}
          reverse
        />

        <StorySection
          title="O Ciclo"
          text="Reutilizamos e reciclamos nossas garrafas como parte natural do processo. Para nós, transformar também significa reaproveitar."
          visual={<PhotoVisual src={cicloAsset.url} alt="Garrafas de vidro reutilizadas no ateliê" />}
        />

        <StorySection
          title="A Filosofia"
          text="Produzir artesanalmente é nossa forma de respeitar o tempo, os ingredientes e quem aprecia o resultado."
          visual={<PhotoVisual src={filosofiaAsset.url} alt="Caderno de receitas à luz de vela" />}
          reverse
        />
      </div>

      {/* Centered highlight — Feito com (c)alma */}
      <div className="mt-24 md:mt-32 text-center">
        <div className="inline-block px-10 py-6 border border-[var(--gold)]/20 bg-[var(--surface)]/60 rounded-sm">
          <p className="font-display text-2xl md:text-4xl text-[#D9C9B0] tracking-wider">Feito com (c)alma.</p>
        </div>
      </div>

      {/* Manifesto final */}
      <div className="mt-16 md:mt-24 mb-16 md:mb-24 text-center max-w-3xl mx-auto">
        <div className="text-[var(--gold)]/40 text-xl mb-6">✦</div>
        <p className="font-sans italic text-lg md:text-xl text-[var(--cream)]/90 leading-relaxed">
          <span className="text-[var(--gold)]">“</span>No fim, talvez a alquimia não esteja na busca pelo ouro, mas na capacidade de transformar ingredientes simples em experiências memoráveis.<span className="text-[var(--gold)]">”</span>
        </p>
      </div>

      </div>
    </div>
  );
}
