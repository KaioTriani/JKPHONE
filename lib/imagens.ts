import manifesto from "@/content/imagens.json";
import type { FotoInfo } from "./tipos";

// content/imagens.json é gerado por `npm run images`.
const fotos = manifesto as Record<string, Omit<FotoInfo, "base">>;

export function foto(base: string): FotoInfo | null {
  const f = fotos[base];
  return f ? { base, ...f } : null;
}
