import type { Metadata } from "next";
import { site } from "@/lib/config";
import { foto } from "@/lib/imagens";
import { Logo } from "@/components/Logo";

// Molde da imagem de compartilhamento. `npm run og` fotografa esta página em 1200x630 e salva public/og.jpg.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Og() {
  const hero = foto(site.loja.fotoHero.arquivo);
  return (
    <div className="relative h-[630px] w-[1200px] overflow-hidden bg-preto">
      {hero && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/${hero.base}-${hero.larguras[hero.larguras.length - 1]}.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-preto via-preto/85 to-preto/30" />
      {!hero && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgb(var(--madeira)/0.2),transparent_60%)]" />}
      <div className="absolute inset-x-0 bottom-[44px] h-px bg-ouro-claro/25" />
      <div className="relative flex h-full flex-col justify-between p-[72px]">
        <div className="flex items-center gap-6">
          <Logo tamanho={112} />
          <span className="font-mono text-[22px] uppercase tracking-[0.2em] text-texto-2">@{site.marca.instagram.valor}</span>
        </div>
        <div>
          <div className="mb-7 h-[2px] w-20 bg-ouro" />
          <p className="max-w-[820px] font-display text-[84px] leading-[1] text-texto">{site.textos.headline}</p>
          <p className="mt-7 font-mono text-[24px] uppercase tracking-[0.14em] text-ouro">
            {site.marca.nome.valor} · {site.loja.bairro.valor}
          </p>
        </div>
      </div>
    </div>
  );
}
