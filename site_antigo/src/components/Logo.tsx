import tipografia from "@/assets/tipografia.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={tipografia}
      alt="Alquimista Licores"
      className={`h-8 lg:h-10 w-auto select-none ${className}`}
      draggable={false}
    />
  );
}