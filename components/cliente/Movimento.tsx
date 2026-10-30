"use client";
import { useEffect } from "react";
import { guardarUtms, track } from "@/lib/track";

/** Entradas suaves, inclinação do aparelho do hero, UTMs e eventos de rolagem. Sem dependências. */
export function Movimento() {
  useEffect(() => {
    guardarUtms();
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Entradas por IntersectionObserver
    const alvos = document.querySelectorAll<HTMLElement>("[data-revelar]");
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visivel");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    alvos.forEach((a) => (reduzir ? a.classList.add("visivel") : io.observe(a)));

    // Rolagem 50% / 90%
    const marcados = new Set<number>();
    const inclinado = document.querySelector<HTMLElement>("[data-inclinar]");
    const ponteiroFino = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let quadro = 0;
    const aoRolar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - innerHeight;
        const pct = total > 0 ? scrollY / total : 1;
        [50, 90].forEach((m) => {
          if (pct * 100 >= m && !marcados.has(m)) {
            marcados.add(m);
            track(`rolagem_${m}`);
          }
        });
        if (inclinado && !reduzir && !ponteiroFino) {
          const t = Math.min(scrollY / innerHeight, 1);
          inclinado.style.setProperty("--rx", `${(t * 8).toFixed(2)}deg`);
          inclinado.style.setProperty("--ry", `${(-6 + t * 12).toFixed(2)}deg`);
        }
      });
    };
    addEventListener("scroll", aoRolar, { passive: true });

    const aoMover = (e: PointerEvent) => {
      if (!inclinado) return;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      inclinado.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
      inclinado.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    };
    if (inclinado && !reduzir && ponteiroFino) addEventListener("pointermove", aoMover, { passive: true });

    // "Ver aparelhos" (qualquer link para #vitrine)
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href="#vitrine"]');
      if (a) track("ver_aparelhos", { local: a.getAttribute("data-local") || "pagina" });
    };
    document.addEventListener("click", aoClicar);

    return () => {
      io.disconnect();
      removeEventListener("scroll", aoRolar);
      removeEventListener("pointermove", aoMover);
      document.removeEventListener("click", aoClicar);
    };
  }, []);
  return null;
}
