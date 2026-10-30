import fs from "node:fs";
import path from "node:path";
import { site } from "@/lib/config";

// Usa o arquivo original do logo (public/marca/). Enquanto ele não chega, mostra só o nome em texto:
// não redesenhamos o logo.
const arquivo = site.marca.logo.valor;
const existe = fs.existsSync(path.join(process.cwd(), "public", arquivo));

export function Logo({ tamanho = 40 }: { tamanho?: number }) {
  const nome = site.marca.nome.valor;
  if (existe)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={arquivo} alt={nome} width={tamanho} height={tamanho} className="rounded-full" style={{ width: tamanho, height: tamanho }} />
    );
  return (
    <span className="flex items-baseline gap-2" title="Logo original pendente: enviar para public/marca/">
      <span className="font-display text-[22px] leading-none text-ouro-claro">JK</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-texto-2">iPhone BR</span>
    </span>
  );
}
