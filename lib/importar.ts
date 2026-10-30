// Converte uma lista de preços colada do WhatsApp em produtos. Usado por scripts/importar-lista.ts.
import { slug } from "./formato";

export type ProdutoImportado = {
  id: string;
  categoria: "iphone" | "acessorio";
  modelo: string;
  armazenamento?: number;
  cores: string[];
  condicao: "novo" | "lacrado" | "seminovo";
  bateria?: number;
  origem: string;
  preco: number | null;
  promocao: boolean;
  status: "disponivel";
  destaque: boolean;
  fotos: Record<string, string>;
};

export type ResultadoLinha = { linha: number; texto: string } & ({ ok: true; produto: ProdutoImportado } | { ok: false; erro: string });

const limpar = (s: string) =>
  s
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " ") // emojis
    .replace(/[*_~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** "R$ 4.299,00" | "4.299" | "4299" -> centavos */
export function lerPreco(texto: string): number | null {
  const comCifrao = texto.match(/R\$\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{2}))?/i);
  const solto = texto.match(/(?:^|\s)(\d{1,2}\.\d{3}|\d{3,5})(?:,(\d{2}))?\s*$/);
  const m = comCifrao ?? solto;
  if (!m) return null;
  return Number(m[1].replace(/\./g, "")) * 100 + Number(m[2] ?? 0);
}

export function lerLinha(bruta: string, coresConhecidas: string[]): ProdutoImportado | { erro: string } | null {
  const t = limpar(bruta);
  if (!t) return null;
  const preco = lerPreco(t);
  const iphone = t.match(/iphone\s*(\d{1,2}|se|xr|xs|x)(?:\s+(pro\s*max|pro|plus|mini|max|e))?\b/i);
  if (!iphone && preco === null) return null; // título, saudação etc.

  const lower = t.toLowerCase();
  const condicao = /lacrad/.test(lower) ? "lacrado" : /semi\s*-?novo|usad|vitrine/.test(lower) ? "seminovo" : /\bnovo\b/.test(lower) ? "novo" : null;
  if (!condicao) return { erro: "condição não informada (novo, lacrado ou seminovo)" };
  if (preco === null) return { erro: "preço não encontrado" };

  const gb = t.match(/(\d+)\s*(gb|tb)\b/i);
  const armazenamento = gb ? Number(gb[1]) * (gb[2].toLowerCase() === "tb" ? 1024 : 1) : undefined;
  const bat = t.match(/(\d{2,3})\s*%/);
  const cores = coresConhecidas
    .filter((c) => new RegExp(`(^|\\s)${c.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(\\s|$|[,;.-])`, "i").test(t))
    .sort((a, b) => b.length - a.length)
    .filter((c, _, todas) => !todas.some((o) => o !== c && o.toLowerCase().includes(c.toLowerCase())));

  let modelo: string;
  let categoria: "iphone" | "acessorio" = "iphone";
  if (iphone) {
    const sufixo = iphone[2] ? " " + iphone[2].replace(/\s+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "";
    modelo = `iPhone ${iphone[1].toUpperCase()}${sufixo}`;
  } else {
    categoria = "acessorio";
    modelo = t
      .replace(/R\$.*$/i, "")
      .replace(/\s[-–]\s.*$/, "")
      .replace(/\b(novo|lacrado)\b/gi, "")
      .trim();
  }
  const id = slug([modelo, armazenamento ? `${armazenamento}` : "", condicao, cores.length === 1 ? cores[0] : ""].filter(Boolean).join(" "));
  return {
    id,
    categoria,
    modelo,
    armazenamento,
    cores,
    condicao,
    bateria: bat && condicao === "seminovo" ? Number(bat[1]) : undefined,
    origem: "[CONFIRMAR]",
    preco,
    promocao: false,
    status: "disponivel",
    destaque: false,
    fotos: {},
  };
}

export function importarLista(texto: string, coresConhecidas: string[]): ResultadoLinha[] {
  return texto.split(/\r?\n/).flatMap((l, i): ResultadoLinha[] => {
    const r = lerLinha(l, coresConhecidas);
    if (!r) return [];
    return "erro" in r ? [{ linha: i + 1, texto: l.trim(), ok: false, erro: r.erro }] : [{ linha: i + 1, texto: l.trim(), ok: true, produto: r }];
  });
}
