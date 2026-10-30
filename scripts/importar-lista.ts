/**
 * npm run importar-lista -- lista.txt            (só mostra o resumo)
 * npm run importar-lista -- lista.txt --gravar   (grava content/produtos.json)
 *
 * Cole a lista de preços do WhatsApp num arquivo .txt, uma linha por aparelho, ex.:
 *   iPhone 13 128GB Meia-noite seminovo 89% R$ 2.399
 *   iPhone 15 Pro Max 256GB lacrado R$ 5.899,00
 * Fotos, promoções e destaques já existentes são mantidos.
 */
import fs from "node:fs";
import path from "node:path";
import { importarLista } from "../lib/importar";
import { moeda } from "../lib/formato";

const raiz = path.resolve(__dirname, "..");
const [arquivo] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const gravar = process.argv.includes("--gravar");
if (!arquivo) {
  console.error("Uso: npm run importar-lista -- caminho/da/lista.txt [--gravar]");
  process.exit(1);
}

const cores = Object.keys(JSON.parse(fs.readFileSync(path.join(raiz, "content/cores-aparelhos.json"), "utf8"))).filter((k) => !k.startsWith("_"));
const destino = path.join(raiz, "content/produtos.json");
const atual = JSON.parse(fs.readFileSync(destino, "utf8"));
const porId = new Map<string, Record<string, unknown>>(atual.produtos.filter((p: { exemplo?: boolean }) => !p.exemplo).map((p: { id: string }) => [p.id, p]));

const resultado = importarLista(fs.readFileSync(arquivo, "utf8"), cores);
const novos: string[] = [];
const alterados: string[] = [];
const erros = resultado.filter((r) => !r.ok);
const vistos = new Set<string>();

for (const r of resultado) {
  if (!r.ok) continue;
  const p = r.produto;
  vistos.add(p.id);
  const antigo = porId.get(p.id);
  if (!antigo) {
    novos.push(`${p.id}  ${p.preco ? moeda(p.preco) : "sem preço"}`);
    porId.set(p.id, p);
  } else {
    const mudou = antigo.preco !== p.preco || antigo.status !== "disponivel";
    if (mudou) alterados.push(`${p.id}  ${antigo.preco ? moeda(antigo.preco as number) : "-"} → ${p.preco ? moeda(p.preco) : "-"}`);
    porId.set(p.id, { ...antigo, preco: p.preco, status: "disponivel", bateria: p.bateria ?? antigo.bateria });
  }
}
const ausentes = [...porId.keys()].filter((id) => !vistos.has(id));

console.log(`\nNOVOS (${novos.length})`);
novos.forEach((n) => console.log(`  + ${n}`));
console.log(`\nALTERADOS (${alterados.length})`);
alterados.forEach((a) => console.log(`  ~ ${a}`));
console.log(`\nFORA DA LISTA (${ausentes.length}) — continuam no site; marque status "esgotado" se acabaram`);
ausentes.forEach((a) => console.log(`  ? ${a}`));
console.log(`\nERROS (${erros.length}) — corrija a linha e rode de novo`);
erros.forEach((e) => !e.ok && console.log(`  ! linha ${e.linha}: ${e.erro}\n      "${e.texto}"`));

if (gravar) {
  const hoje = new Date().toISOString().slice(0, 10);
  const { _leia, ...resto } = atual;
  fs.writeFileSync(
    destino,
    JSON.stringify({ _leia: "Gerado por npm run importar-lista. Revise origem, parcelado e fotos.", ...resto, atualizadoEm: hoje, produtos: [...porId.values()] }, null, 2) + "\n",
  );
  console.log(`\nGravado em content/produtos.json (${porId.size} produtos). Itens de EXEMPLO foram removidos.`);
} else console.log("\nNada gravado. Rode com --gravar para atualizar content/produtos.json.");
