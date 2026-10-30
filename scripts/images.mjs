/**
 * npm run images
 * Lê fotos originais (do celular) em originais/ e gera em public/ as versões do site:
 *   originais/loja/<nome>.jpg            -> public/loja/<nome>-{480,960,1600}.{avif,webp}
 *   originais/produtos/<id>/<cor>.jpg    -> public/produtos/<id>/<cor>-{480,960}.{avif,webp}  (1200x1500, 4:5)
 * Remove EXIF/GPS (sharp não copia metadados), cria placeholder borrado e qa/contact-sheet.png.
 * Fundo de produto: removido só se o `rembg` estiver instalado. Nunca por corte global de branco.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIG = path.join(raiz, "originais");
const PUB = path.join(raiz, "public");
const MANIFESTO = path.join(raiz, "content", "imagens.json");
const EXT = /\.(jpe?g|png|heic|webp|tiff?)$/i;

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const temRembg = (() => {
  try {
    execFileSync("rembg", ["--help"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

const arquivos = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : []);
const manifesto = {};
const folhaContato = [];

async function blur(img) {
  const b = await img.clone().resize(16).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${b.toString("base64")}`;
}

async function salvar(entrada, base, larguras) {
  fs.mkdirSync(path.dirname(path.join(PUB, base)), { recursive: true });
  const img = sharp(entrada).rotate(); // aplica a orientação e descarta EXIF/GPS
  const { info } = await img.clone().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const hasAlpha = info.channels === 4;
  const ws = larguras.filter((w) => w <= width);
  if (!ws.length) ws.push(width);
  for (const w of ws) {
    const r = img.clone().resize({ width: w, withoutEnlargement: true });
    await r.clone().avif({ quality: 55 }).toFile(path.join(PUB, `${base}-${w}.avif`));
    await r.clone().webp({ quality: 78 }).toFile(path.join(PUB, `${base}-${w}.webp`));
  }
  manifesto[base] = { largura: width, altura: height, larguras: ws, blur: await blur(img), alfa: hasAlpha };
  return { width, height };
}

// ---------- Loja ----------
for (const f of arquivos(path.join(ORIG, "loja")).filter((f) => f.isFile() && EXT.test(f.name))) {
  const nome = slug(path.parse(f.name).name);
  const entrada = path.join(ORIG, "loja", f.name);
  await salvar(entrada, `loja/${nome}`, [480, 960, 1600]);
  if (nome === "hero") {
    // Versão JPEG para a imagem de compartilhamento (Open Graph).
    await sharp(entrada).rotate().resize(1200, 630, { fit: "cover" }).jpeg({ quality: 80 }).toFile(path.join(PUB, "loja", "hero-og.jpg"));
  }
  console.log(`loja      ${nome}`);
}

// ---------- Produtos: 1200x1500, aparelho centralizado e base alinhada ----------
for (const dir of arquivos(path.join(ORIG, "produtos")).filter((d) => d.isDirectory())) {
  const id = slug(dir.name);
  for (const f of arquivos(path.join(ORIG, "produtos", dir.name)).filter((f) => f.isFile() && EXT.test(f.name))) {
    const cor = slug(path.parse(f.name).name);
    let entrada = path.join(ORIG, "produtos", dir.name, f.name);
    if (temRembg) {
      const sem = path.join(raiz, "qa", "tmp", `${id}-${cor}.png`);
      fs.mkdirSync(path.dirname(sem), { recursive: true });
      execFileSync("rembg", ["i", entrada, sem], { stdio: "ignore" });
      entrada = sem;
    }
    // trim() só corta a BORDA uniforme ao redor (não apaga branco dentro do aparelho).
    const recortado = await sharp(entrada).rotate().trim({ threshold: 12 }).toBuffer();
    const fundo = temRembg ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 };
    const caixa = await sharp(recortado).resize(1040, 1320, { fit: "inside" }).toBuffer();
    const meta = await sharp(caixa).metadata();
    const padrao = await sharp({ create: { width: 1200, height: 1500, channels: 4, background: fundo } })
      .composite([{ input: caixa, left: Math.round((1200 - meta.width) / 2), top: 1500 - 90 - meta.height }]) // base a 90 px do fim
      [temRembg ? "png" : "jpeg"]({ quality: 92 })
      .toBuffer();
    await salvar(padrao, `produtos/${id}/${cor}`, [480, 960]);
    folhaContato.push({ rotulo: `${id}/${cor}`, buf: await sharp(padrao).resize(240, 300).flatten({ background: "#F3EEE3" }).png().toBuffer() });
    console.log(`produto   ${id}/${cor}${temRembg ? " (fundo removido)" : ""}`);
  }
}

fs.writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 2) + "\n");

// ---------- Folha de contato para revisão ----------
if (folhaContato.length) {
  const col = 5;
  const lin = Math.ceil(folhaContato.length / col);
  const camadas = folhaContato.flatMap((f, i) => {
    const x = (i % col) * 260 + 10;
    const y = Math.floor(i / col) * 340 + 10;
    const texto = Buffer.from(`<svg width="240" height="24"><text x="0" y="16" font-family="monospace" font-size="13" fill="#F3EEE3">${f.rotulo}</text></svg>`);
    return [
      { input: f.buf, left: x, top: y },
      { input: texto, left: x, top: y + 306 },
    ];
  });
  fs.mkdirSync(path.join(raiz, "qa"), { recursive: true });
  await sharp({ create: { width: col * 260 + 10, height: lin * 340 + 10, channels: 3, background: "#141416" } })
    .composite(camadas)
    .png()
    .toFile(path.join(raiz, "qa", "contact-sheet.png"));
  console.log("qa/contact-sheet.png gerado");
}
console.log(`\n${Object.keys(manifesto).length} imagem(ns) no manifesto. rembg: ${temRembg ? "sim" : "não (fundo mantido; o site funde o branco no palco)"}`);
