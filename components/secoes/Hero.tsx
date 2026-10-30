import { site } from "@/lib/config";
import { foto } from "@/lib/imagens";
import { moeda } from "@/lib/formato";
import type { ProdutoVitrine, WhatsAppConfig } from "@/lib/tipos";
import { Foto } from "../Foto";
import { Dado } from "../Dado";
import { IconeSeta, IconeWhatsApp } from "../Icones";
import { BotaoWhatsApp } from "../cliente/BotaoWhatsApp";

export function Hero({
  config,
  mensagem,
  hrefInicial,
  destaque,
}: {
  config: WhatsAppConfig;
  mensagem: string;
  hrefInicial: string;
  destaque?: ProdutoVitrine;
}) {
  const fotoHero = foto(site.loja.fotoHero.arquivo);
  const c = site.condicoes;
  return (
    <section id="inicio" className="relative isolate overflow-hidden pt-16">
      {/* Fundo: foto real do showroom; sem ela, uma composição neutra (madeira + filete) até a foto chegar. */}
      <div className="absolute inset-0 -z-10" aria-hidden={!fotoHero}>
        {fotoHero ? (
          <>
            <Foto foto={fotoHero} alt={site.loja.fotoHero.alt} sizes="100vw" prioridade className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-preto via-preto/80 to-preto/40" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-preto to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-preto">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_30%,rgb(var(--madeira)/0.16),transparent_60%)]" />
            <div className="absolute inset-x-0 bottom-[22%] h-px bg-ouro-claro/25" />
            <div className="absolute inset-x-0 bottom-[22%] h-6 translate-y-full bg-gradient-to-b from-madeira/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-[46%] hidden h-px bg-ouro-claro/10 md:block" />
          </div>
        )}
      </div>

      <div className="wrap grid min-h-[calc(100svh-64px)] items-center gap-10 pb-0 pt-10 md:grid-cols-[1.25fr_1fr] md:pb-16 md:pt-16">
        <div>
          <p className="rotulo flex items-center gap-3">
            <span className="h-px w-8 bg-ouro" aria-hidden="true" />
            Loja física · <Dado campo={site.loja.bairro} />
          </p>
          <h1 className="mt-5 text-[44px] leading-[0.98] sm:text-[58px] lg:text-[80px]">{site.textos.headline}</h1>
          <p className="mt-6 max-w-[34ch] text-[17px] text-texto-2 md:text-lg">{site.textos.subtitulo}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#vitrine" data-local="hero" className="btn-ouro">
              Ver aparelhos <IconeSeta />
            </a>
            <BotaoWhatsApp config={config} mensagem={mensagem} local="hero" hrefInicial={hrefInicial} className="btn-linha">
              <IconeWhatsApp /> Chamar no WhatsApp
            </BotaoWhatsApp>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] uppercase tracking-[0.12em] text-texto-2">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ouro" aria-hidden="true" />
              Garantia da loja <Dado campo={c.garantiaLojaPrazo} />
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ouro" aria-hidden="true" />
              <a href="#pagamento" className="inline-flex min-h-[44px] items-center underline decoration-texto/30 underline-offset-4 hover:text-texto">
                Parcelamento no cartão
              </a>
            </li>
          </ul>
        </div>

        <div className="relative -mb-24 flex justify-center md:mb-0" aria-hidden="true">
          <div data-inclinar className="inclina w-[min(58vw,300px)] md:w-[min(30vw,340px)]">
            <AparelhoHero destaque={destaque} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Aparelho autoral (não é render da Apple) com o destaque da vitrine na tela. */
function AparelhoHero({ destaque }: { destaque?: ProdutoVitrine }) {
  return (
    <div className="relative aspect-[1/2] rounded-[16%/8%] border border-ouro-claro/40 bg-gradient-to-b from-grafite to-preto p-[4%] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
      <div className="flex h-full flex-col justify-between rounded-[13%/6.5%] border border-texto/10 bg-[linear-gradient(160deg,rgb(var(--grafite)),rgb(var(--preto))_70%)] p-[9%]">
        <div className="mx-auto h-[3%] w-[28%] rounded-full bg-preto ring-1 ring-texto/10" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ouro">em destaque</p>
          <p className="mt-2 font-display text-[clamp(20px,3.4vw,30px)] leading-tight text-texto">{destaque?.modelo ?? "Vitrine JK"}</p>
          {destaque?.preco ? <p className="num mt-2 text-sm text-texto-2">{moeda(destaque.preco)}</p> : null}
          <div className="filete mt-5" />
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-texto-2">{destaque?.exemplo ? "exemplo" : "disponível na loja"}</p>
        </div>
      </div>
    </div>
  );
}
