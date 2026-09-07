import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CauldronIcon } from "./CauldronIcon";
import { useCart } from "@/store/cart";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/pocoes", label: "As Poções" },
  { to: "/kits", label: "Kits & Presentes" },
  { to: "/monte-seu-kit", label: "Monte seu Kit" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCart((s) => s.count());
  const setOpen = useCart((s) => s.setOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "bg-[var(--background)]/85 backdrop-blur-xl border-b border-[var(--gold)]/15" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between gap-6">
        <Link to="/" className="shrink-0"><Logo className="text-sm lg:text-base" /></Link>
        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="font-display tracking-[0.2em] uppercase font-extralight font-sans text-base" activeProps={{ className: "text-[var(--gold)] font-semibold" }}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen(true)} title="Meu Caldeirão" className="relative p-2 text-[var(--cream)] hover:text-[var(--gold)] transition-colors" aria-label="Meu Caldeirão">
            <CauldronIcon className="w-5 h-5" />
            {count > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--gold)] text-[var(--background)] text-[10px] font-bold flex items-center justify-center">{count}</span>}
          </button>
          <button className="lg:hidden p-2 text-[var(--cream)]" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--gold)]/15">
          <nav className="flex flex-col px-6 py-4">
            {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)} className="py-3 font-display tracking-[0.2em] uppercase font-extralight font-sans text-base" activeProps={{ className: "text-[var(--gold)] font-semibold" }}>{n.label}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}