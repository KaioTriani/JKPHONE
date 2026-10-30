import { site, whatsappConfig, confirmado, siteUrl } from "@/lib/config";
import { carregarProdutos } from "@/lib/produtos";
import { promocoesValidas } from "@/lib/promocoes";
import { destinoWhatsApp, linkWhatsApp, mensagemGeral } from "@/lib/whatsapp";
import { Topo, BarraFlutuante } from "@/components/secoes/Topo";
import { Hero } from "@/components/secoes/Hero";
import {
  Faixa,
  TituloSecao,
  SecaoVitrine,
  SecaoVisita,
  SecaoCondicoes,
  SecaoLoja,
  SecaoClientes,
  SecaoFaq,
  CtaFinal,
  Rodape,
  linkMaps,
} from "@/components/secoes/Conteudo";
import { Promocoes } from "@/components/cliente/Promocoes";
import { DialogoWhatsApp } from "@/components/cliente/DialogoWhatsApp";
import { Movimento } from "@/components/cliente/Movimento";

// Revalida a cada 5 min: promoções vencidas saem e a planilha (se houver) é relida.
export const revalidate = 300;

export default async function Pagina() {
  const { produtos, atualizadoEm } = await carregarProdutos();
  const config = whatsappConfig;
  const mensagem = mensagemGeral(config.loja);
  // Href sem JS: com número, já leva a mensagem; sem número, o link do perfil.
  const hrefInicial = linkWhatsApp(destinoWhatsApp(config.numero, config.linkPerfil), mensagem);
  const w = { config, hrefInicial };

  const promos = promocoesValidas(produtos, site.fusoUTC);
  const destaque = produtos.find((p) => p.destaque && p.categoria === "iphone" && p.status === "disponivel");
  const modelos = [...new Set(produtos.filter((p) => p.categoria === "iphone").map((p) => p.modelo))];

  return (
    <>
      <JsonLd />
      <Topo {...w} mensagem={mensagem} />
      <main>
        <Hero {...w} mensagem={mensagem} destaque={destaque} />
        <Faixa modelos={modelos} />
        <Promocoes produtos={promos} fusoUTC={site.fusoUTC} {...w}>
          <TituloSecao id="promocoes-titulo" rotulo="Dos nossos stories" titulo="Promoções da semana">
            <p>Cada oferta vale até a data no card. Acabou o estoque, sai da promoção.</p>
          </TituloSecao>
        </Promocoes>
        <SecaoVitrine produtos={produtos} atualizadoEm={atualizadoEm} {...w} />
        <SecaoVisita {...w} />
        <SecaoCondicoes />
        <SecaoLoja />
        <SecaoClientes />
        <SecaoFaq />
        <CtaFinal {...w} mensagem={mensagem} />
      </main>
      <Rodape {...w} mensagem={mensagem} />
      <BarraFlutuante {...w} mensagem={mensagem} />
      <DialogoWhatsApp />
      <Movimento />
    </>
  );
}

/** Store/LocalBusiness só com dados confirmados pelo dono. Sem avaliações. */
function JsonLd() {
  const l = site.loja;
  const nome = confirmado(site.marca.nome);
  if (!nome) return null;
  const endereco = confirmado(l.endereco);
  const dados: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: nome,
    url: siteUrl().toString(),
    image: new URL("/og.jpg", siteUrl()).toString(),
    sameAs: confirmado(site.marca.instagram) ? [`https://instagram.com/${site.marca.instagram.valor}`] : undefined,
    hasMap: confirmado(l.mapsUrl) ? linkMaps() : undefined,
    address: endereco
      ? {
          "@type": "PostalAddress",
          streetAddress: endereco,
          addressLocality: confirmado(l.cidade) ?? undefined,
          addressRegion: confirmado(l.uf) ?? undefined,
          postalCode: confirmado(l.cep) ?? undefined,
          addressCountry: "BR",
        }
      : undefined,
    telephone: confirmado(site.whatsapp.numero) ? `+${site.whatsapp.numero.valor}` : undefined,
    taxID: confirmado(site.marca.cnpj) ?? undefined,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }} />;
}
