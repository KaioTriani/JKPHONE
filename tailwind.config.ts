import type { Config } from "tailwindcss";

// As cores vêm de content/site.json (injetadas como variáveis CSS em app/layout.tsx).
const token = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "480px", md: "768px", lg: "1024px", xl: "1280px" },
    extend: {
      colors: {
        preto: token("preto"),
        grafite: token("grafite"),
        ouro: token("ouro"),
        "ouro-claro": token("ouro-claro"),
        marfim: token("marfim"),
        madeira: token("madeira"),
        texto: token("texto"),
        "texto-2": token("texto-2"),
        rosa: token("rosa"),
        laranja: token("laranja"),
        amarelo: token("amarelo"),
        azul: token("azul"),
      },
      fontFamily: {
        display: ["var(--fonte-display)", "Georgia", "serif"],
        sans: ["var(--fonte-texto)", "system-ui", "sans-serif"],
        mono: ["var(--fonte-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { pagina: "1200px" },
    },
  },
  plugins: [],
};

export default config;
