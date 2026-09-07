import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Instagram, ChevronDown } from "lucide-react";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/PageHeader";

const WHATSAPP_NUMBER = "5548991737692";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Alquimista Licores" },
      { name: "description", content: "Fale com o Alquimista pelo WhatsApp ou Instagram. Endereço em Criciúma/SC e respostas para perguntas frequentes." },
      { property: "og:title", content: "Contato — Alquimista Licores" },
      { property: "og:description", content: "Toda poção começa com uma conversa. Fale com o Alquimista." },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

const FAQ = [
  {
    q: "Os licores são realmente artesanais?",
    a: "Sim. Todos são produzidos manualmente pelo Alquimista, em pequenos lotes, com ingredientes naturais.",
  },
  {
    q: "Como funciona o pedido?",
    a: "Você monta seu pedido aqui no site e finalizamos pelo WhatsApp com confirmação de disponibilidade e prazo.",
  },
  {
    q: "Posso personalizar o kit?",
    a: "Sim! Você escolhe o sabor, o acompanhamento e o tipo de embalagem.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "Confirmado via WhatsApp conforme disponibilidade. Licores cremosos exigem 2 dias de preparo e kits ao menos 1 dia.",
  },
  {
    q: "Vocês entregam onde?",
    a: "Atendemos Criciúma e região. Informe seu endereço para calcularmos o frete.",
  },
  {
    q: "Posso retirar pessoalmente?",
    a: "Sim! A retirada é gratuita no endereço: Rod. Antonio Darós, 1105 - São João, Criciúma - SC.",
  },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="border-b border-[var(--gold)]/10">
      <button
        onClick={onToggle}
        className="w-full py-5 flex justify-between items-center text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-body tracking-wide text-[var(--cream)] text-base md:text-lg pr-4 group-hover:text-[var(--gold)] transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[var(--gold)] shrink-0 transition-transform duration-300 ease-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 font-sans italic text-[var(--text-soft)] text-base md:text-lg leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContatoPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16 md:pb-24">
      <PageHeader title="Fale com o Alquimista" subtitle="Toda poção começa com uma conversa." />

      {/* Canais */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* WhatsApp */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="p-6 border border-[var(--gold)]/20 rounded-sm hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5 transition-all duration-300 text-center group"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-7 h-7 text-[var(--gold)] mx-auto mb-3 group-hover:scale-110 transition-transform">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          <div className="font-display text-base md:text-lg tracking-[0.2em] uppercase text-[var(--gold)]">
            WhatsApp
          </div>
          <div className="text-sm md:text-base text-[var(--text-soft)] mt-2">
            (48) 99173-7692
          </div>
        </a>

        {/* Instagram */}
        <a
          href={SITE.instagram}
          target="_blank"
          rel="noreferrer"
          className="p-6 border border-[var(--gold)]/20 rounded-sm hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5 transition-all duration-300 text-center group"
        >
          <Instagram className="w-7 h-7 text-[var(--gold)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-display text-base md:text-lg tracking-[0.2em] uppercase text-[var(--gold)]">
            Instagram
          </div>
          <div className="text-sm md:text-base text-[var(--text-soft)] mt-2">
            @alquimistalicores
          </div>
        </a>

        {/* Endereço */}
        <a
          href={SITE.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="p-6 border border-[var(--gold)]/20 rounded-sm hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5 transition-all duration-300 text-center group"
        >
          <MapPin className="w-7 h-7 text-[var(--gold)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-display text-base md:text-lg tracking-[0.2em] uppercase text-[var(--gold)]">
            Retirada
          </div>
          <div className="text-sm md:text-base text-[var(--text-soft)] mt-2 leading-snug">
            Rod. Antonio Darós, 1105<br />São João, Criciúma — SC
          </div>
        </a>
      </div>

      {/* FAQ */}
      <div className="mt-20 md:mt-24">
        <div className="text-center mb-10">
          <div className="text-[var(--gold)]/40 text-lg mb-3">✦</div>
          <h2 className="text-2xl md:text-3xl text-[#D9C9B0] tracking-wide">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="border-t border-[var(--gold)]/10">
          {FAQ.map((f, i) => (
            <AccordionItem
              key={i}
              question={f.q}
              answer={f.a}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
