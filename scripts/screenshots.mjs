/**
 * npm run screenshots           -> qa/screens/{360,390,768,1440}.png + checagens de aceite
 * npm run screenshots -- --og   -> também gera public/og.jpg (1200x630) a partir de /og
 * Precisa do site rodando (npm run build:preview && npm start). URL: BASE_URL (padrão http://localhost:3000).
 * Usa o Edge ou o Chrome instalados no computador (playwright-core, sem baixar navegador).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE_URL || "http://localhost:3000";
const saida = path.join(raiz, "qa", "screens");
fs.mkdirSync(saida, { recursive: true });

let navegador;
for (const channel of ["msedge", "chrome"]) {
  try {
    navegador = await chromium.launch({ channel });
    break;
  } catch {}
}
if (!navegador) throw new Error("Instale o Microsoft Edge ou o Google Chrome.");

const falhas = [];

if (process.argv.includes("--og")) {
  const ctx = await navegador.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/og`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(raiz, "public", "og.jpg"), type: "jpeg", quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log("public/og.jpg gerado");
  await ctx.close();
}

for (const largura of [360, 390, 768, 1440]) {
  const movel = largura < 768;
  const ctx = await navegador.newContext({
    viewport: { width: largura, height: movel ? 780 : 900 },
    deviceScaleFactor: movel ? 2 : 1,
    hasTouch: movel, // isMobile fica desligado: no Edge ele duplica trechos na foto de página inteira
    reducedMotion: "reduce", // mostra tudo já revelado na foto de página inteira
  });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/?utm_source=instagram`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);

  const r = await p.evaluate(() => {
    const doc = document.documentElement;
    const problemas = [];
    if (doc.scrollWidth > window.innerWidth) problemas.push(`rolagem horizontal: ${doc.scrollWidth}px > ${window.innerWidth}px`);
    const cards = [...document.querySelectorAll("[data-card]")];
    cards.forEach((c, i) => {
      const caixa = c.getBoundingClientRect();
      const nome = c.querySelector("h3");
      const preco = c.querySelector(".num.text-\\[22px\\]");
      for (const [rotulo, el] of [["nome", nome], ["preço", preco]]) {
        if (!el) {
          problemas.push(`card ${i}: sem ${rotulo}`);
          continue;
        }
        const b = el.getBoundingClientRect();
        if (b.bottom > caixa.bottom + 0.5 || b.right > caixa.right + 0.5 || b.height === 0) problemas.push(`card ${i} (${nome?.textContent}): ${rotulo} cortado`);
      }
    });
    const pequenos = [...document.querySelectorAll("a[href], button, select, summary")]
      .filter((el) => el.offsetParent !== null && !el.closest("[aria-hidden=true]"))
      .map((el) => ({ el, b: el.getBoundingClientRect() }))
      .filter(({ b }) => b.width > 0 && (b.height < 43.5 || b.width < 43.5))
      .map(({ el }) => (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30));
    if (pequenos.length) problemas.push(`alvos < 44px: ${[...new Set(pequenos)].join(" | ")}`);
    return { problemas, cards: cards.length };
  });
  await p.screenshot({ path: path.join(saida, `${largura}.png`), fullPage: true });
  console.log(`${largura}px  ${r.cards} cards  ${r.problemas.length ? "PROBLEMAS" : "ok"}`);
  r.problemas.forEach((x) => console.log(`   - ${x}`));
  if (r.problemas.length) falhas.push(largura);
  await ctx.close();
}

await navegador.close();
console.log(`\nScreenshots em qa/screens/. ${falhas.length ? `Com problemas em: ${falhas.join(", ")}px` : "Todas as checagens passaram."}`);
process.exit(falhas.length ? 1 : 0);
