// Funções puras, seguras para servidor e cliente.

/** 429900 -> "R$ 4.299" ; 429950 -> "R$ 4.299,50" (espaço comum, bom para mensagens). */
export function moeda(centavos: number): string {
  const reais = Math.floor(centavos / 100);
  const resto = centavos % 100;
  const milhar = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${milhar}${resto ? "," + String(resto).padStart(2, "0") : ""}`;
}

/** "2026-11-05" -> "05/11" */
export const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
/** "2026-11-05" -> "05/11/2026" */
export const dataBR = (iso: string) => `${diaMes(iso)}/${iso.slice(0, 4)}`;

export const armazenamentoTexto = (gb?: number) =>
  gb === undefined ? "" : gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`;

export const condicaoTexto = { novo: "Novo", lacrado: "Lacrado", seminovo: "Seminovo" } as const;
export const statusTexto = { disponivel: "Disponível", reservado: "Reservado", esgotado: "Esgotado" } as const;

export function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Data de hoje (AAAA-MM-DD) num fuso, ex.: America/Fortaleza. */
export function hojeISO(fuso: string, agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: fuso, year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}

/** "#C8A24B" -> "200 162 75" (para rgb(var(--x) / alpha)). */
export function hexParaRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
