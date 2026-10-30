"use client";
import { useEffect, useState } from "react";

const CHAVE = "jk_consentimento";

function carregar(ga4?: string, pixel?: string) {
  if (ga4 && !window.gtag) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`;
    document.head.appendChild(s);
    const w = window as unknown as { dataLayer: unknown[] };
    w.dataLayer = w.dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga4);
  }
  if (pixel && !window.fbq) {
    const fila: unknown[] = [];
    const fbq = (...a: unknown[]) => fila.push(a);
    Object.assign(fbq, { queue: fila, loaded: true, version: "2.0", push: fbq });
    window.fbq = fbq;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    window.fbq("init", pixel);
    window.fbq("track", "PageView");
  }
}

/** Só existe quando GA4 ou Meta Pixel estão configurados. Plausible não usa cookies e não depende disto. */
export function Consentimento({ ga4, pixel }: { ga4?: string; pixel?: string }) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    let escolha: string | null = null;
    try {
      escolha = localStorage.getItem(CHAVE);
    } catch {}
    if (escolha === "sim") carregar(ga4, pixel);
    else if (escolha !== "nao") setAberto(true);
  }, [ga4, pixel]);

  const decidir = (sim: boolean) => {
    try {
      localStorage.setItem(CHAVE, sim ? "sim" : "nao");
    } catch {}
    if (sim) carregar(ga4, pixel);
    setAberto(false);
  };

  if (!aberto) return null;
  return (
    <div
      role="dialog"
      aria-label="Cookies de medição"
      className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-texto/15 bg-grafite p-4 text-sm shadow-2xl md:bottom-6 md:left-auto md:right-6 md:max-w-sm"
    >
      <p className="text-texto-2">
        Usamos cookies de medição (Google e Meta) só se você permitir. Detalhes em{" "}
        <a href="/privacidade" className="text-ouro-claro underline">
          privacidade
        </a>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button className="btn-linha min-h-[44px] flex-1 px-4" onClick={() => decidir(false)}>
          Recusar
        </button>
        <button className="btn-ouro min-h-[44px] flex-1 px-4" onClick={() => decidir(true)}>
          Permitir
        </button>
      </div>
    </div>
  );
}
