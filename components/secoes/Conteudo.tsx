import { site, confirmado, seguidoresAtuais } from "@/lib/config";
import { foto } from "@/lib/imagens";
import { dataBR } from "@/lib/formato";
import { ehPendente } from "@/lib/pendencias";
import type { HorarioSemana } from "@/lib/agenda";
import type { ProdutoVitrine, WhatsAppConfig } from "@/lib/tipos";
import { Dado, ComPendencias } from "../Dado";
import { Foto } from "../Foto";
import { IconeInstagram, IconeMais, IconeMapa, IconeRelogio, IconeSeta, IconeWhatsApp } from "../Icones";
import { Logo } from "../Logo";
import { BotaoWhatsApp } from "../cliente/BotaoWhatsApp";
import { Vitrine } from "../cliente/Vitrine";
import { Agendador } from "../cliente/Agendador";
import { Simulador } from "../cliente/Simulador";

type Wpp = { config: WhatsAppConfig; hrefInicial: string };

/* ---------- Faixa lenta de modelos ---------- */
export function Faixa({ modelos }: { modelos: string[] }) {
  if (modelos.length < 2) return null;
  const itens = [...modelos, ...modelos];
  return (
    <div className="overflow-hidden border-y border-texto/10 bg-grafite py-4" aria-hidden="true">
      <div className="faixa-trilho flex w-max items-center gap-8 whitespace-nowrap">
        {[...itens, ...itens].map((m, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-2xl italic text-texto/80">
            {m}
            <span className="h-1.5 w-1.5 rotate-45 bg-ouro" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function TituloSecao({ id, rotulo, titulo, children }: { id: string; rotulo: string; titulo: string; children?: React.ReactNode }) {
  return (
    <div data-revelar className="max-w-2xl">
      <p className="rotulo">{rotulo}</p>
      <h2 id={id} className="mt-3 text-[36px] leading-[1.02] md:text-[52px]">
        {titulo}
      </h2>
      {children && <div className="mt-4 text-texto-2 [.claro_&]:text-preto/75">{children}</div>}
    </div>
  );
}

/* ---------- Vitrine ---------- */
export function SecaoVitrine({ produtos, atualizadoEm, ...w }: Wpp & { produtos: ProdutoVitrine[]; atualizadoEm: string }) {
  const temExemplo = produtos.some((p) => p.exemplo);
  return (
    <section id="vitrine" aria-labelledby="vitrine-titulo" className="py-16 md:py-24">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <TituloSecao id="vitrine-titulo" rotulo="Vitrine" titulo="iPhones disponíveis">
            <p>Toque no aparelho para chamar no WhatsApp com o modelo já escrito.</p>
          </TituloSecao>
          <p className="num text-[12px] uppercase tracking-[0.1em] text-texto-2 md:text-right">
            Atualizado em {dataBR(atualizadoEm)}
            <br />
            Preços e estoque sujeitos a alteração
          </p>
        </div>
        {temExemplo && (
          <p className="mt-6 rounded-xl border border-rosa/50 bg-rosa/10 p-4 text-sm text-texto">
            <strong className="font-semibold">Lista de exemplo.</strong> Modelos e preços marcados como EXEMPLO são fictícios, só para revisar o
            layout. Troque em <code className="font-mono text-[13px]">content/produtos.json</code>.
          </p>
        )}
        <div className="mt-8">
          <Vitrine produtos={produtos} {...w} />
        </div>
      </div>
    </section>
  );
}

/* ---------- Agende sua visita (seção clara, respirada) ---------- */
export function SecaoVisita(w: Wpp) {
  const h = site.loja.horario;
  const passos = [
    ["Escolha o aparelho", "Na vitrine acima ou direto com a gente no WhatsApp."],
    ["Confirme no WhatsApp", "A gente separa o aparelho e combina o horário."],
    ["Venha à loja ou receba", "Confira o aparelho na mão antes de fechar."],
  ];
  return (
    <section id="visita" aria-labelledby="visita-titulo" className="claro bg-marfim py-20 text-preto md:py-32">
      <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <TituloSecao id="visita-titulo" rotulo="Agendamento" titulo="Agende sua visita">
            <p>Três passos, sem cadastro.</p>
          </TituloSecao>
          <ol className="mt-10 grid gap-8">
            {passos.map(([t, d], i) => (
              <li key={t} data-revelar className="grid grid-cols-[56px_1fr] items-baseline gap-4">
                <span className="font-display text-[44px] leading-none">
                  0{i + 1}
                  {i === 0 && <span className="mt-1 block h-[3px] w-8 bg-laranja" aria-hidden="true" />}
                </span>
                <span>
                  <span className="block text-lg font-semibold">{t}</span>
                  <span className="text-preto/70">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div data-revelar className="rounded-3xl border border-preto/15 bg-[#fbf8f2] p-5 sm:p-8">
          <p className="font-display text-2xl">Quando você quer vir?</p>
          {!h.revisado && (
            <p className="mt-2 text-sm text-preto/70">
              <ComPendencias texto="[CONFIRMAR horário da loja]" /> Até lá, mostramos manhã e tarde em todos os dias.
            </p>
          )}
          <div className="mt-6">
            <Agendador horario={h.valor as HorarioSemana} fuso={site.fusoHorario} {...w} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Garantia e pagamento (denso, ficha técnica) ---------- */
export function SecaoCondicoes() {
  const c = site.condicoes;
  const coef = confirmado(c.coeficientes);
  const linhas: [string, React.ReactNode][] = [
    ["Garantia legal", <Dado key="l" campo={c.garantiaLegal} />],
    ["Garantia da loja", <Dado key="p" campo={c.garantiaLojaPrazo} sufixo=", adicional à legal" />],
    ["Cobertura", <Dado key="c" campo={c.garantiaLojaCobertura} />],
    ["Vale para", <Dado key="a" campo={c.garantiaLojaAparelhos} />],
    [
      "Parcelamento",
      <span key="pa">
        Até <Dado campo={c.parcelasMax} />
        x no cartão. Juros: <Dado campo={c.parcelamentoJuros} />. Parcela mínima: <Dado campo={c.parcelaMinima} />.
      </span>,
    ],
    ["Formas de pagamento", <Dado key="f" campo={c.formasPagamento} />],
    ["Origem dos aparelhos", <Dado key="o" campo={c.origemAparelhos} />],
    ["Troca de usado", <Dado key="t" campo={c.troca} />],
    ["Entrega", <Dado key="e" campo={c.entrega} />],
  ];
  return (
    <section id="pagamento" aria-labelledby="pagamento-titulo" className="border-t border-texto/10 bg-grafite py-16 md:py-24">
      <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TituloSecao id="pagamento-titulo" rotulo="Ficha técnica" titulo="Garantia e pagamento">
            <p>Tudo o que vale na compra, num lugar só. Antes de fechar, a gente confirma parcela, total e juros do seu aparelho no WhatsApp.</p>
          </TituloSecao>
        </div>
        <div>
          <dl data-revelar className="border-t border-ouro-claro/30">
            {linhas.map(([rotulo, valor]) => (
              <div key={rotulo} className="grid gap-1 border-b border-texto/10 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="rotulo pt-1">{rotulo}</dt>
                <dd className="text-[15px] leading-relaxed">{valor}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            {coef ? (
              <Simulador coeficientes={coef} />
            ) : (
              <p className="text-sm text-texto-2">
                Simulador de parcelas: aparece quando a tabela de coeficientes da maquininha estiver no config.{" "}
                <ComPendencias texto="[CONFIRMAR tabela de coeficientes]" />
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- A loja ---------- */
const DIAS: [keyof NonNullable<HorarioSemana>, string][] = [
  ["seg", "Segunda"],
  ["ter", "Terça"],
  ["qua", "Quarta"],
  ["qui", "Quinta"],
  ["sex", "Sexta"],
  ["sab", "Sábado"],
  ["dom", "Domingo"],
];

export function linkMaps() {
  const url = site.loja.mapsUrl.valor;
  if (!ehPendente(url) && /^https:\/\//.test(url)) return url;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.marca.nome.valor} ${site.loja.bairro.valor}`)}`;
}

export function SecaoLoja() {
  const l = site.loja;
  const horario = l.horario.valor as HorarioSemana;
  const fotos = l.fotos.map((f) => ({ ...f, info: foto(f.arquivo) }));
  return (
    <section id="loja" aria-labelledby="loja-titulo" className="py-16 md:py-24">
      <div className="wrap">
        <TituloSecao id="loja-titulo" rotulo="Showroom" titulo="A loja">
          <p>Aparelho na mão antes de fechar. É para isso que a loja existe.</p>
        </TituloSecao>

        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2 md:gap-3">
          {fotos.slice(0, 6).map((f, i) => (
            <figure
              key={f.arquivo}
              data-revelar
              className={`relative overflow-hidden rounded-2xl bg-grafite ${i === 0 ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto" : "aspect-square"}`}
            >
              {f.info ? (
                <Foto foto={f.info} alt={f.alt} sizes={i === 0 ? "(min-width:768px) 50vw, 100vw" : "(min-width:768px) 25vw, 50vw"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[140px] flex-col justify-end border border-dashed border-texto/15 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-texto-2">foto do showroom em breve</span>
                  <span className="sr-only">{f.alt}</span>
                </div>
              )}
              {i === 0 && <span className="absolute left-4 top-4 h-2 w-2 rounded-full bg-azul" aria-hidden="true" />}
            </figure>
          ))}
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.2fr_1fr_auto] md:items-start">
          <div data-revelar className="flex gap-4">
            <IconeMapa className="mt-1 h-5 w-5 shrink-0 text-ouro" />
            <address className="not-italic leading-relaxed">
              <Dado campo={l.endereco} />
              <br />
              <Dado campo={l.bairro} /> · <Dado campo={l.cidade} />/<Dado campo={l.uf} />
              <br />
              CEP <Dado campo={l.cep} />
            </address>
          </div>
          <div data-revelar className="flex gap-4">
            <IconeRelogio className="mt-1 h-5 w-5 shrink-0 text-ouro" />
            {horario ? (
              <dl className="num grid grid-cols-[auto_1fr] gap-x-4 text-sm">
                {DIAS.map(([k, nome]) => (
                  <div key={k} className="contents">
                    <dt className="text-texto-2">{nome}</dt>
                    <dd>{horario[k] ? `${horario[k]![0]} – ${horario[k]![1]}` : "Fechado"}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>
                <ComPendencias texto="[CONFIRMAR horário de funcionamento]" />
              </p>
            )}
          </div>
          <a href={linkMaps()} target="_blank" rel="noopener" className="btn-linha self-start">
            <IconeMapa className="h-4 w-4" /> Abrir no Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Clientes (só com material autorizado) ---------- */
export function SecaoClientes() {
  const fotos = site.clientes.map((c) => ({ ...c, info: foto(c.arquivo) })).filter((c) => c.info);
  if (!fotos.length) return null;
  return (
    <section id="clientes" aria-labelledby="clientes-titulo" className="border-t border-texto/10 py-16 md:py-24">
      <div className="wrap">
        <TituloSecao id="clientes-titulo" rotulo="Clientes" titulo="Quem já levou o seu" />
        <div className="sem-barra -mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4">
          {fotos.map((c) => (
            <figure key={c.arquivo} className="w-[min(70vw,280px)] shrink-0 snap-start overflow-hidden rounded-2xl">
              <Foto foto={c.info!} alt={c.alt} sizes="280px" className="h-auto w-full" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
export function SecaoFaq() {
  return (
    <section id="duvidas" aria-labelledby="faq-titulo" className="border-t border-texto/10 py-16 md:py-24">
      <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.4fr]">
        <TituloSecao id="faq-titulo" rotulo="Dúvidas" titulo="Perguntas frequentes" />
        <div className="border-t border-texto/10">
          {site.faq.map((f) => (
            <details key={f.pergunta} className="group border-b border-texto/10">
              <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg [&::-webkit-details-marker]:hidden">
                {f.pergunta}
                <IconeMais className="h-5 w-5 shrink-0 text-ouro transition-transform group-open:rotate-45" />
              </summary>
              <div className="pb-5 text-texto-2">
                <Dado campo={f.resposta} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA final ---------- */
export function CtaFinal({ mensagem, ...w }: Wpp & { mensagem: string }) {
  return (
    <section aria-labelledby="cta-titulo" className="relative overflow-hidden border-t border-texto/10 py-20 md:py-32">
      <div className="wrap" data-revelar>
        <h2 id="cta-titulo" className="max-w-[16ch] text-[44px] leading-[1] md:text-[76px]">
          {site.textos.ctaFinalTitulo}
        </h2>
        <p className="mt-5 max-w-[42ch] text-lg text-texto-2">{site.textos.ctaFinalTexto}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <BotaoWhatsApp {...w} mensagem={mensagem} local="cta-final" className="btn-ouro">
            <IconeWhatsApp /> Chamar no WhatsApp
          </BotaoWhatsApp>
          <a href="#vitrine" data-local="cta-final" className="btn-linha">
            Ver aparelhos <IconeSeta />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Rodapé ---------- */
export function Rodape({ mensagem, ...w }: Wpp & { mensagem: string }) {
  const m = site.marca;
  const seguidores = seguidoresAtuais();
  return (
    <footer className="border-t border-texto/10 bg-grafite py-12 text-sm text-texto-2">
      <div className="wrap grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo tamanho={56} />
          <p className="mt-4">
            <Dado campo={m.razaoSocial} />
            <br />
            CNPJ <Dado campo={m.cnpj} />
          </p>
          <p className="mt-2">
            <Dado campo={site.loja.endereco} /> · <Dado campo={site.loja.bairro} /> · <Dado campo={site.loja.cidade} />/
            <Dado campo={site.loja.uf} />
          </p>
        </div>
        <ul className="grid content-start gap-1">
          <li>
            <a href={`https://instagram.com/${m.instagram.valor}`} target="_blank" rel="noopener" className="flex min-h-[44px] items-center gap-3 hover:text-texto">
              <IconeInstagram /> @{m.instagram.valor}
              {seguidores && <span className="num text-xs">· {seguidores} seguidores</span>}
            </a>
          </li>
          <li>
            <BotaoWhatsApp {...w} mensagem={mensagem} local="rodape" className="flex min-h-[44px] items-center gap-3 hover:text-texto">
              <IconeWhatsApp /> WhatsApp
            </BotaoWhatsApp>
          </li>
          <li>
            <a href={linkMaps()} target="_blank" rel="noopener" className="flex min-h-[44px] items-center gap-3 hover:text-texto">
              <IconeMapa /> Como chegar
            </a>
          </li>
        </ul>
        <div className="grid content-start gap-3">
          <p>iPhone é marca da Apple Inc. A {m.nome.valor} é loja independente, sem vínculo com a Apple.</p>
          <a href="/privacidade" className="flex min-h-[44px] items-center underline underline-offset-4 hover:text-texto">
            Privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}
