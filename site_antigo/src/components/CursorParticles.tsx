import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number };

export function CursorParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let particles: P[] = [];
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastSpawn = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 18) return;
      lastSpawn = now;
      if (particles.length >= 30) return;
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.25,
        life: 0,
        max: 1400 + Math.random() * 600,
        size: 0.7 + Math.random() * 0.9,
      });
    };
    window.addEventListener("mousemove", onMove);

    let prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => {
        p.life += dt;
        if (p.life > p.max) return false;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.0045 * dt; // gravity (stronger so they fall)
        const t = p.life / p.max;
        const alpha = (1 - t) * 0.8;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, `rgba(240, 204, 90, ${alpha})`);
        grad.addColorStop(0.5, `rgba(212, 175, 55, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(200, 121, 65, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[60] hidden md:block"
      aria-hidden
    />
  );
}