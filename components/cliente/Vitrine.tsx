"use client";
import { useMemo, useState } from "react";
import type { ProdutoVitrine, WhatsAppConfig } from "@/lib/tipos";
import { faixasDePreco } from "@/lib/linhas";
import { CardProduto } from "./CardProduto";

type Aba = "iphone" | "acessorio";
type Ordem = "destaque" | "menor" | "maior";

const PESO_STATUS = { disponivel: 0, reservado: 1, esgotado: 2 };

export function Vitrine({ produtos, config, hrefInicial }: { produtos: ProdutoVitrine[]; config: WhatsAppConfig; hrefInicial: string }) {
  const temAcessorios = produtos.some((p) => p.categoria === "acessorio");
  const [aba, setAba] = useState<Aba>("iphone");
  const [linha, setLinha] = useState<string | null>(null);
  const [faixaId, setFaixaId] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("destaque");

  const daAba = useMemo(() => produtos.filter((p) => p.categoria === aba), [produtos, aba]);
  const linhas = useMemo(
    () => [...new Set(daAba.map((p) => p.linha))].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })),
    [daAba],
  );
  const faixas = useMemo(() => faixasDePreco(daAba.flatMap((p) => (p.preco ? [p.preco] : []))), [daAba]);
  const faixa = faixas.find((f) => f.id === faixaId);

  const visiveis = useMemo(() => {
    const lista = daAba.filter(
      (p) => (!linha || p.linha === linha) && (!faixa || (p.preco !== null && p.preco > faixa.min && p.preco <= faixa.max)),
    );
    const preco = (p: ProdutoVitrine) => p.preco ?? Number.MAX_SAFE_INTEGER;
    return lista.sort(
      (a, b) =>
        PESO_STATUS[a.status] - PESO_STATUS[b.status] ||
        (ordem === "menor" ? preco(a) - preco(b) : ordem === "maior" ? preco(b) - preco(a) : Number(b.destaque) - Number(a.destaque)),
    );
  }, [daAba, linha, faixa, ordem]);

  const trocarAba = (a: Aba) => {
    setAba(a);
    setLinha(null);
    setFaixaId("");
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {temAcessorios && (
          <div role="tablist" aria-label="Categoria" className="flex gap-1 rounded-full border border-texto/15 p-1 md:order-2">
            {(
              [
                ["iphone", "iPhones"],
                ["acessorio", "Acessórios"],
              ] as const
            ).map(([id, rotulo]) => (
              <button
                key={id}
                role="tab"
                aria-selected={aba === id}
                aria-controls="vitrine-grade"
                className="chip flex-1 justify-center border-transparent md:flex-none"
                onClick={() => trocarAba(id)}
              >
                {rotulo}
              </button>
            ))}
          </div>
        )}
        {linhas.length > 1 && (
          <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" aria-label="Filtrar por linha" role="group">
            <button className="chip shrink-0" aria-pressed={linha === null} onClick={() => setLinha(null)}>
              Todos
            </button>
            {linhas.map((l) => (
              <button key={l} className="chip shrink-0" aria-pressed={linha === l} onClick={() => setLinha(linha === l ? null : l)}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {faixas.length > 0 && (
          <label className="relative">
            <span className="sr-only">Faixa de preço</span>
            <select value={faixaId} onChange={(e) => setFaixaId(e.target.value)} className="chip w-full appearance-none bg-transparent pr-8 text-texto">
              <option value="" className="bg-grafite">
                Qualquer preço
              </option>
              {faixas.map((f) => (
                <option key={f.id} value={f.id} className="bg-grafite">
                  {f.rotulo}
                </option>
              ))}
            </select>
            <Seta />
          </label>
        )}
        <label className="relative">
          <span className="sr-only">Ordenar</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} className="chip w-full appearance-none bg-transparent pr-8 text-texto">
            <option value="destaque" className="bg-grafite">
              Destaques
            </option>
            <option value="menor" className="bg-grafite">
              Menor preço
            </option>
            <option value="maior" className="bg-grafite">
              Maior preço
            </option>
          </select>
          <Seta />
        </label>
        <p className="col-span-2 text-sm text-texto-2 sm:ml-auto" aria-live="polite">
          {visiveis.length} {visiveis.length === 1 ? "item" : "itens"}
        </p>
      </div>

      <div id="vitrine-grade" role="tabpanel" className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3 md:gap-4">
        {visiveis.map((p) => (
          <CardProduto key={p.id} p={p} config={config} hrefInicial={hrefInicial} local="vitrine" />
        ))}
      </div>
      {visiveis.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-texto/20 p-6 text-texto-2">
          Nada nessa combinação agora. Chame no WhatsApp: se não estiver na vitrine, a gente procura.
        </p>
      )}
    </div>
  );
}

const Seta = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-2" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
