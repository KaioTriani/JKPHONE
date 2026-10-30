"use client";
import { useState } from "react";
import type { ProdutoVitrine, WhatsAppConfig } from "@/lib/tipos";
import { armazenamentoTexto, condicaoTexto, diaMes, moeda, statusTexto } from "@/lib/formato";
import { mensagemProduto } from "@/lib/whatsapp";
import { ComPendencias } from "../Dado";
import { Foto } from "../Foto";
import { SemFoto } from "../Silhueta";
import { IconeWhatsApp } from "../Icones";
import { abrirWhatsApp } from "./whatsapp-abrir";

export function CardProduto({
  p,
  config,
  hrefInicial,
  local,
  mostrarValidade = false,
}: {
  p: ProdutoVitrine;
  config: WhatsAppConfig;
  hrefInicial: string;
  local: string;
  mostrarValidade?: boolean;
}) {
  const [corFoto, setCorFoto] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const atual = p.fotos[corFoto];
  const esgotado = p.status === "esgotado";
  const semFoto = p.cores.filter((c) => !p.fotos.some((f) => f.cor === c));
  // A cor só entra na mensagem quando o cliente escolheu uma que tem foto (ou quando só existe uma cor).
  const cor = atual?.cor ?? (p.cores.length === 1 ? p.cores[0] : undefined);
  const mensagem = mensagemProduto({ modelo: p.modelo, armazenamento: p.armazenamento, cor, preco: p.preco, status: p.status }, config.loja);
  const evento = { local, modelo: `${p.modelo} ${armazenamentoTexto(p.armazenamento)}`.trim(), id: p.id };

  const abrir = () => {
    const link = abrirWhatsApp(config, mensagem, evento);
    if (link) location.href = link;
  };

  return (
    <article
      className="card group relative grid aspect-[4/5] cursor-pointer grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-texto/10 bg-grafite"
      data-ativo={ativo}
      data-esgotado={esgotado}
      data-card
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        // Toque: 1º toque mostra "Quero este", 2º abre o WhatsApp. Mouse: abre direto.
        if (matchMedia("(hover: none)").matches && !ativo) setAtivo(true);
        else abrir();
      }}
    >
      <div className={`card-palco relative min-h-0 bg-marfim ${esgotado ? "opacity-50 grayscale" : ""}`}>
        <div className="absolute inset-0 p-[8%] pb-[12%]">
          {atual ? (
            <Foto
              foto={atual.foto}
              alt={`${p.modelo} ${armazenamentoTexto(p.armazenamento)} ${atual.cor}`}
              sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
              className={`h-full w-full object-contain object-bottom ${atual.foto.alfa ? "" : "funde"}`}
            />
          ) : (
            <SemFoto categoria={p.categoria} />
          )}
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-preto px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-marfim">
          {condicaoTexto[p.condicao]}
        </span>
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          {p.exemplo && (
            <span className="rounded-full bg-rosa px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-preto">
              Exemplo
            </span>
          )}
          {p.status !== "disponivel" && (
            <span className="rounded-full border border-preto/40 bg-marfim px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-preto">
              {statusTexto[p.status]}
            </span>
          )}
          {mostrarValidade && p.validade && (
            <span className="rounded-full bg-preto px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-amarelo">
              válido até {diaMes(p.validade)}
            </span>
          )}
        </div>
        {p.fotos.length > 1 && (
          <div className="absolute bottom-1 left-1 flex" role="radiogroup" aria-label="Cor da foto">
            {p.fotos.map((f, i) => (
              <button
                key={f.cor}
                role="radio"
                aria-checked={i === corFoto}
                aria-label={f.cor}
                title={f.cor}
                className="grid h-11 w-11 place-items-center"
                onClick={() => setCorFoto(i)}
              >
                <span
                  className={`h-5 w-5 rounded-full border ${i === corFoto ? "border-preto ring-2 ring-preto ring-offset-2 ring-offset-marfim" : "border-preto/30"}`}
                  style={{ background: f.hex ?? "#ccc" }}
                />
              </button>
            ))}
          </div>
        )}
        {(atual?.foto && p.fotoIlustrativa) && (
          <span className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.14em] text-preto/70">foto ilustrativa</span>
        )}
      </div>

      <div className={`grid gap-1 p-4 ${esgotado ? "text-texto/60" : ""}`}>
        <h3 className="text-[21px] leading-tight">{p.modelo}</h3>
        <p className="num text-[12px] uppercase tracking-[0.08em] text-texto-2">
          {[armazenamentoTexto(p.armazenamento), p.bateria ? `bateria ${p.bateria}%` : ""].filter(Boolean).join(" · ")}
          {p.armazenamento || p.bateria ? " · " : ""}
          {p.origem.includes("[CONFIRMAR") ? <ComPendencias texto="[CONFIRMAR origem]" /> : p.origem}
        </p>
        {semFoto.length > 0 && (
          <p className="line-clamp-1 text-[13px] text-texto-2">
            {p.fotos.length ? "Também em " : "Cores: "}
            {semFoto.join(", ")}
          </p>
        )}
        <div className={`mt-2 flex items-end justify-between gap-x-3 gap-y-2 ${esgotado ? "flex-wrap" : ""}`}>
          <div className="min-w-0 flex-1">
            <p className="num text-[22px] leading-none text-texto">{p.preco === null ? "Consulte" : moeda(p.preco)}</p>
            {p.parcelado && (
              <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-texto-2">
                <ComPendencias texto={p.parcelado} />
              </p>
            )}
          </div>
          <a
            href={hrefInicial}
            target="_blank"
            rel="noopener"
            className="card-cta btn-ouro min-h-[44px] shrink-0 px-4 text-[14px]"
            onClick={(e) => {
              const link = abrirWhatsApp(config, mensagem, evento);
              if (link) e.currentTarget.href = link;
              else e.preventDefault();
            }}
          >
            <IconeWhatsApp className="h-4 w-4" />
            {esgotado ? "Avise-me no WhatsApp" : "Quero este"}
          </a>
        </div>
      </div>
    </article>
  );
}
