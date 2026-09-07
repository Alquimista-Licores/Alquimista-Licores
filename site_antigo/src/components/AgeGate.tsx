import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoAgeGate from "@/assets/logo-agegate.png";

const KEY = "alquimista-age-ok";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  useEffect(() => {
    if (!denied) return;
    const t = setTimeout(() => {
      window.location.href = "https://www.youtube.com/watch?v=5P8GcCpmGYQ";
    }, 3000);
    return () => clearTimeout(t);
  }, [denied]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md px-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-md w-full text-center border border-[var(--gold)]/30 bg-[var(--surface)] p-10 rounded-md gold-glow"
          >
            <div className="flex justify-center mb-6">
              <img
                src={logoAgeGate}
                alt="Alquimista Licores"
                className="h-16 lg:h-20 w-auto select-none"
                draggable={false}
              />
            </div>
            {!denied ? (
              <>
                <p className="font-body text-xl mb-8 text-[var(--cream)]">
                  Você tem 18 anos ou mais?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      localStorage.setItem(KEY, "1");
                      setOpen(false);
                    }}
                    className="px-6 py-3 bg-[var(--gold)] text-[var(--background)] font-body tracking-wider hover:bg-[var(--gold-hover)] transition-colors rounded-sm"
                  >
                    Sim, tenho 18+
                  </button>
                  <button
                    onClick={() => setDenied(true)}
                    className="px-6 py-3 border border-[var(--gold)]/40 text-[var(--cream)] font-body tracking-wider hover:bg-[var(--surface-elevated)] transition-colors rounded-sm"
                  >
                    Não
                  </button>
                </div>
                <p className="mt-8 text-xs text-[var(--text-faded)] font-body">
                  Venda e consumo proibidos para menores de 18 anos.
                </p>
              </>
            ) : (
              <p className="font-body text-lg text-[var(--text-soft)] py-6">
                O acesso a este site é restrito a maiores de 18 anos.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}