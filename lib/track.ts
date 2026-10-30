// Eventos de medição. Plausible (sem cookies) por padrão; GA4/Pixel só após consentimento.
type Props = Record<string, string | number>;

declare global {
  interface Window {
    plausible?: (evento: string, opts?: { props?: Props }) => void;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(evento: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  const utm = utms();
  const tudo = { ...props, ...(utm.utm_source ? { utm_source: utm.utm_source } : {}) };
  window.plausible?.(evento, { props: tudo });
  window.gtag?.("event", evento, tudo);
  if (evento === "whatsapp_clique") window.fbq?.("track", "Contact", tudo);
  if (evento === "agendamento_enviado") window.fbq?.("track", "Schedule", tudo);
}

const CHAVE = "jk_utm";

/** Guarda utm_* da primeira página da sessão. */
export function guardarUtms() {
  try {
    const p = new URLSearchParams(location.search);
    const novos = Object.fromEntries([...p].filter(([k]) => k.startsWith("utm_")));
    if (Object.keys(novos).length) sessionStorage.setItem(CHAVE, JSON.stringify(novos));
  } catch {
    /* navegador sem sessionStorage: segue sem UTM */
  }
}

export function utms(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) || "{}");
  } catch {
    return {};
  }
}
