import localFont from "next/font/local";

// Fontes servidas pelo próprio site (subset latin, que cobre os acentos do português).
// Bodoni Moda: serifa de alto contraste, conversa com o "JK" ornamentado do logo sem imitá-lo.
// Instrument Sans: leitura limpa em tela pequena; JetBrains Mono: preços e specs alinhados.
// (next/font exige caminhos literais.)

export const display = localFont({
  src: [
    { path: "../node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--fonte-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const texto = localFont({
  src: [
    { path: "../node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--fonte-texto",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const mono = localFont({
  src: [{ path: "../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2", weight: "500", style: "normal" }],
  variable: "--fonte-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});
