import { createFileRoute } from "@tanstack/react-router";
import { CauldronIcon } from "@/components/CauldronIcon";

export const Route = createFileRoute("/manutencao")({
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <div className="mb-8 text-primary animate-pulse">
        <CauldronIcon className="w-24 h-24" />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">
        Alquimia em Pausa
      </h1>
      <p className="text-xl text-foreground/80 max-w-lg mb-10 leading-relaxed">
        Estamos refinando nossas fórmulas e organizando nosso laboratório. 
        Em breve, novos licores e experiências estarão prontos para você.
      </p>
      
      <p className="text-xl md:text-2xl text-primary font-serif italic mb-12">
        "A paciência é o segredo do alquimista."
      </p>
      
      <div className="text-sm text-foreground/40">
        Voltaremos em breve.
      </div>
    </div>
  );
}
