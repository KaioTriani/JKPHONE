/**
 * npm run check:placeholders
 * Falha (exit 1) enquanto houver [CONFIRMAR], dado com revisado: false, produto de EXEMPLO
 * ou arquivo obrigatório faltando. Roda antes de todo `npm run build` (prebuild).
 */
import fs from "node:fs";
import path from "node:path";
import { acharPendencias } from "../lib/pendencias";
import { listaProdutosSchema, siteSchema } from "../lib/schema";

const raiz = path.resolve(__dirname, "..");
const ler = (f: string) => JSON.parse(fs.readFileSync(path.join(raiz, f), "utf8"));

const site = ler("content/site.json");
const produtos = ler("content/produtos.json");
const imagens = ler("content/imagens.json") as Record<string, unknown>;

const erros: string[] = [];
const avisos: string[] = [];

// 1. Formato
for (const [nome, schema, dado] of [
  ["content/site.json", siteSchema, site],
  ["content/produtos.json", listaProdutosSchema, produtos],
] as const) {
  const r = schema.safeParse(dado);
  if (!r.success) r.error.issues.forEach((i) => erros.push(`${nome} → ${i.path.join(".")}: ${i.message}`));
}

// 2. Pendências de conteúdo
acharPendencias(site).forEach((p) => erros.push(`site.json → ${p.caminho}: ${p.motivo}`));
acharPendencias(produtos).forEach((p) => erros.push(`produtos.json → ${p.caminho}: ${p.motivo}`));

// 3. Arquivos
if (!fs.existsSync(path.join(raiz, "public", site.marca.logo.valor))) erros.push(`logo: falta o arquivo public${site.marca.logo.valor}`);
if (!imagens[site.loja.fotoHero.arquivo]) erros.push(`foto do hero: falta originais/${site.loja.fotoHero.arquivo}.jpg (rode npm run images)`);
const lojaFaltando = site.loja.fotos.filter((f: { arquivo: string }) => !imagens[f.arquivo]);
if (lojaFaltando.length) avisos.push(`fotos da loja sem arquivo: ${lojaFaltando.map((f: { arquivo: string }) => f.arquivo).join(", ")}`);
const semFoto = produtos.produtos.filter((p: { fotos: object }) => !Object.keys(p.fotos ?? {}).length).length;
if (semFoto) avisos.push(`${semFoto} produto(s) sem foto (aparecem com silhueta "foto em breve")`);
if (!process.env.NEXT_PUBLIC_SITE_URL && site.siteUrl.revisado !== true) erros.push("defina NEXT_PUBLIC_SITE_URL ou confirme siteUrl no site.json");

// Relatório
const amarelo = (s: string) => `\x1b[33m${s}\x1b[0m`;
const vermelho = (s: string) => `\x1b[31m${s}\x1b[0m`;
avisos.forEach((a) => console.log(amarelo(`aviso  ${a}`)));
erros.forEach((e) => console.log(vermelho(`falta  ${e}`)));

const liberado = process.env.PERMITIR_PENDENCIAS === "1" || process.env.VERCEL_ENV === "preview";
if (erros.length) {
  console.log(`\n${erros.length} pendência(s) antes de publicar.`);
  if (liberado) {
    console.log(amarelo("PERMITIR_PENDENCIAS/preview ativo: build liberado só para pré-visualização."));
    process.exit(0);
  }
  console.log(vermelho("Build de produção bloqueado. Confirme os dados acima com o dono da loja."));
  process.exit(1);
}
console.log("Nenhuma pendência. Pode publicar.");
