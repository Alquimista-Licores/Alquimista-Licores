export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center pt-28 md:pt-36 mb-12 md:mb-16">
      <div
        aria-hidden
        className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent"
        style={{ boxShadow: "0 0 8px rgba(161, 127, 18, 0.5)" }}
      />
      <h1 className="text-4xl md:text-5xl tracking-wide text-[#D9C9B0]">{title}</h1>
      {subtitle && (
        <p className="font-sans italic text-base md:text-lg text-[#99815F] mt-4">{subtitle}</p>
      )}
    </div>
  );
}