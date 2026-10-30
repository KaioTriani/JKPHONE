import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { display, mono, texto } from "./fontes";
import { nomeLoja, site, siteUrl } from "@/lib/config";
import { hexParaRgb } from "@/lib/formato";
import { Consentimento } from "@/components/cliente/Consentimento";

const descricao = `Loja física no ${site.loja.bairro.valor}. Veja os iPhones disponíveis, escolha o seu e chame no WhatsApp com o modelo certo ou agende sua visita.`;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: `${nomeLoja} | iPhones com loja física no ${site.loja.bairro.valor}`,
  description: descricao,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: nomeLoja,
    title: `${nomeLoja} | Vitrine de iPhones`,
    description: descricao,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${nomeLoja}: loja física de iPhone` }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: site.cores.preto,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Trocar uma cor em content/site.json muda a página inteira.
const variaveis = Object.entries(site.cores)
  .filter(([k]) => !k.startsWith("_"))
  .map(([k, v]) => `--${k}:${hexParaRgb(v as string)};`)
  .join("");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga4 = process.env.NEXT_PUBLIC_GA4_ID;
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  return (
    <html lang="pt-BR" className={`${display.variable} ${texto.variable} ${mono.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root{${variaveis}}` }} />
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js")` }} />
      </head>
      <body>
        {children}
        {plausible && (
          <Script defer data-domain={plausible} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
        )}
        {(ga4 || pixel) && <Consentimento ga4={ga4} pixel={pixel} />}
      </body>
    </html>
  );
}
