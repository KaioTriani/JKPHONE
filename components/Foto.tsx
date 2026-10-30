import type { FotoInfo } from "@/lib/tipos";

// <picture> com AVIF/WebP gerados por `npm run images`. Sem dependência de JS.
export function Foto({
  foto,
  alt,
  sizes,
  className = "",
  prioridade = false,
}: {
  foto: FotoInfo;
  alt: string;
  sizes: string;
  className?: string;
  prioridade?: boolean;
}) {
  const srcset = (fmt: string) => foto.larguras.map((w) => `/${foto.base}-${w}.${fmt} ${w}w`).join(", ");
  const maior = foto.larguras[foto.larguras.length - 1];
  return (
    <picture>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={`/${foto.base}-${maior}.webp`}
        alt={alt}
        width={foto.largura}
        height={foto.altura}
        loading={prioridade ? "eager" : "lazy"}
        decoding="async"
        // @ts-expect-error atributo válido em navegadores atuais; React 18 ainda não tipa
        fetchpriority={prioridade ? "high" : undefined}
        className={className}
        style={foto.alfa ? undefined : { backgroundImage: `url(${foto.blur})`, backgroundSize: "cover" }}
      />
    </picture>
  );
}
