"use client";
import { useEffect, useState } from "react";
import type { ProdutoVitrine, WhatsAppConfig } from "@/lib/tipos";
import { promocoesValidas } from "@/lib/promocoes";
import { CardProduto } from "./CardProduto";

/**
 * O servidor já filtra (e revalida a cada 5 min); aqui filtramos de novo com o relógio de quem abre a página,
 * para a promoção vencida sumir sozinha mesmo com a página em cache.
 */
export function Promocoes({
  produtos,
  fusoUTC,
  config,
  hrefInicial,
  children,
}: {
  produtos: ProdutoVitrine[];
  fusoUTC: string;
  config: WhatsAppConfig;
  hrefInicial: string;
  children: React.ReactNode;
}) {
  const [lista, setLista] = useState(produtos);
  useEffect(() => setLista(promocoesValidas(produtos, fusoUTC)), [produtos, fusoUTC]);
  if (!lista.length) return null;
  return (
    <section id="promocoes" aria-labelledby="promocoes-titulo" className="border-t border-texto/10 py-16 md:py-24">
      <div className="wrap">
        {children}
        <div className="sem-barra -mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:overflow-visible md:px-0">
          {lista.map((p) => (
            <div key={p.id} className="w-[min(82vw,340px)] shrink-0 snap-start md:w-auto">
              <CardProduto p={p} config={config} hrefInicial={hrefInicial} local="promocoes" mostrarValidade />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
