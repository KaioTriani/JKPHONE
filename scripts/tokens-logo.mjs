/**
 * npm run tokens:logo
 * Extrai as cores do logo original (public/marca/logo.svg|png) e sugere os tokens de cor.
 * Não altera nada sozinho: use --aplicar para gravar --ouro / --ouro-claro / --preto em content/site.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitePath = path.join(raiz, "content", "site.json");
const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const logo = path.join(raiz, "public", site.marca.logo.valor);

if (!fs.existsSync(logo)) {
  console.error(`Logo não encontrado em public${site.marca.logo.valor}. Coloque o arquivo original (SVG ou PNG transparente) e rode de novo.`);
  process.exit(1);
}

const { data, info } = await sharp(logo, { density: 300 }).resize(400, 400, { fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const hsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
  return [h, s, l];
};
const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

// Agrupa pixels opacos em "baldes" e separa dourados (matiz 35–55°) e escuros.
const dourados = [];
const escuros = [];
for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 200) continue;
  const [h, s, l] = hsl(r, g, b);
  if (h >= 30 && h <= 58 && s > 0.35 && l > 0.3 && l < 0.85) dourados.push([r, g, b, l]);
  else if (l < 0.12) escuros.push([r, g, b]);
}
const media = (lista) => lista.reduce((acc, p) => acc.map((v, i) => v + p[i] / lista.length), [0, 0, 0]);

if (!dourados.length) {
  console.log("Nenhum tom dourado encontrado no logo. Mantenha os tokens atuais e confira manualmente.");
  process.exit(0);
}
dourados.sort((a, b) => a[3] - b[3]);
const meio = dourados.slice(Math.floor(dourados.length * 0.3), Math.floor(dourados.length * 0.7));
const claros = dourados.slice(Math.floor(dourados.length * 0.8));
const sugestao = {
  ouro: hex(media(meio)),
  "ouro-claro": hex(media(claros)),
  ...(escuros.length ? { preto: hex(media(escuros)) } : {}),
};

console.log("Sugestão extraída do logo:");
for (const [k, v] of Object.entries(sugestao)) console.log(`  --${k}: ${v}   (atual ${site.cores[k]})`);

if (process.argv.includes("--aplicar")) {
  Object.assign(site.cores, sugestao);
  fs.writeFileSync(sitePath, JSON.stringify(site, null, 2) + "\n");
  console.log("Gravado em content/site.json. Confira o contraste (texto escuro sobre o ouro).");
} else console.log("\nPara gravar: npm run tokens:logo -- --aplicar");
