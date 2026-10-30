import "server-only";
import produtosJson from "@/content/produtos.json";
import coresJson from "@/content/cores-aparelhos.json";
import { listaProdutosSchema, produtoSchema, type ListaProdutos, type Produto } from "./schema";
import { lerCSV } from "./csv";
import { linhaDoModelo } from "./linhas";
import { foto } from "./imagens";
import type { ProdutoVitrine } from "./tipos";

const cores = coresJson as Record<string, string>;

/** Converte uma linha da planilha (cabeçalhos iguais aos campos do JSON) em produto. */
export function produtoDaPlanilha(l: Record<string, string>) {
  const lista = (s?: string) => (s ? s.split(/[;|]/).map((x) => x.trim()).filter(Boolean) : []);
  const num = (s?: string) => (s ? Number(s.replace(/\D/g, "")) || undefined : undefined);
  const sim = (s?: string) => /^(sim|s|true|1|x)$/i.test(s ?? "");
  const fotos = Object.fromEntries(
    lista(l.fotos).map((par) => par.split("=").map((x) => x.trim()) as [string, string]).filter((p) => p.length === 2),
  );
  return produtoSchema.parse({
    id: l.id,
    categoria: l.categoria || "iphone",
    modelo: l.modelo,
    armazenamento: num(l.armazenamento),
    cores: lista(l.cores),
    condicao: (l.condicao || "").toLowerCase(),
    bateria: num(l.bateria),
    origem: l.origem || "[CONFIRMAR]",
    preco: num(l.preco) ?? null,
    parcelado: l.parcelado || undefined,
    promocao: sim(l.promocao),
    validade: l.validade || undefined,
    status: (l.status || "disponivel").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""),
    destaque: sim(l.destaque),
    fotos,
    fotoIlustrativa: sim(l.fotoIlustrativa),
  });
}

async function daPlanilha(url: string): Promise<ListaProdutos | null> {
  try {
    const r = await fetch(url, { next: { revalidate: 300 } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const linhas = lerCSV(await r.text()).filter((l) => l.id);
    const produtos: Produto[] = linhas.map(produtoDaPlanilha);
    return { atualizadoEm: new Date().toISOString().slice(0, 10), produtos };
  } catch (e) {
    console.warn(`[produtos] planilha indisponível, usando content/produtos.json: ${(e as Error).message}`);
    return null;
  }
}

export async function carregarProdutos(): Promise<{ atualizadoEm: string; produtos: ProdutoVitrine[] }> {
  const url = process.env.PLANILHA_CSV_URL;
  const lista = (url && (await daPlanilha(url))) || listaProdutosSchema.parse(produtosJson);
  return {
    atualizadoEm: lista.atualizadoEm,
    produtos: lista.produtos.map((p) => ({
      id: p.id,
      exemplo: !!p.exemplo,
      categoria: p.categoria,
      modelo: p.modelo,
      linha: linhaDoModelo(p.modelo, p.categoria),
      armazenamento: p.armazenamento,
      cores: p.cores,
      condicao: p.condicao,
      bateria: p.bateria,
      origem: p.origem,
      preco: p.preco,
      parcelado: p.parcelado,
      promocao: p.promocao,
      validade: p.validade,
      status: p.status,
      destaque: p.destaque,
      // Só cores que têm foto processada viram bolinha; nunca foto de outra cor.
      fotos: Object.entries(p.fotos).flatMap(([cor, base]) => {
        const f = foto(base);
        return f && p.cores.includes(cor) ? [{ cor, foto: f, hex: cores[cor] }] : [];
      }),
      fotoIlustrativa: p.fotoIlustrativa,
    })),
  };
}
