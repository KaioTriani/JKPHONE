import type { ProdutoVitrine } from "./tipos";

/** Fim do último dia de validade no fuso da loja (validade é inclusiva). */
export const fimValidade = (validade: string, fusoUTC: string) => new Date(`${validade}T23:59:59.999${fusoUTC}`).getTime();

/** Promoção só entra com validade futura e produto não esgotado. */
export function promocoesValidas<T extends Pick<ProdutoVitrine, "promocao" | "validade" | "status">>(
  produtos: T[],
  fusoUTC: string,
  agora = Date.now(),
): T[] {
  return produtos.filter(
    (p) => p.promocao && !!p.validade && p.status !== "esgotado" && fimValidade(p.validade, fusoUTC) >= agora,
  );
}
