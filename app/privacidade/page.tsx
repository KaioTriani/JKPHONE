import type { Metadata } from "next";
import { site } from "@/lib/config";
import { Dado } from "@/components/Dado";

export const metadata: Metadata = { title: `Privacidade | ${site.marca.nome.valor}`, robots: { index: false } };

// Texto-base. REVISAR COM ADVOGADO antes de publicar com GA4 ou Meta Pixel.
export default function Privacidade() {
  const m = site.marca;
  return (
    <main className="wrap max-w-3xl py-16">
      <a href="/" className="text-sm text-texto-2 underline underline-offset-4">
        ← Voltar
      </a>
      <h1 className="mt-6 text-5xl">Privacidade</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-widest text-amarelo">Texto-base · revisar com advogado</p>
      <div className="mt-8 grid gap-5 text-texto-2 [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:text-texto">
        <p>
          Este site é da <Dado campo={m.razaoSocial} /> (CNPJ <Dado campo={m.cnpj} />
          ), que opera a loja {m.nome.valor}.
        </p>
        <h2>O que coletamos</h2>
        <p>
          Nenhum formulário deste site coleta seus dados. Quando você toca em um botão do WhatsApp, a conversa acontece no WhatsApp, sob as
          regras dele, e só com o que você decidir enviar.
        </p>
        <h2>Medição de visitas</h2>
        <p>
          Usamos uma ferramenta de estatística sem cookies que conta visitas e cliques de forma agregada, sem identificar você. Se estiverem
          ativos, Google Analytics e Meta Pixel só são carregados depois que você permitir no aviso de cookies, e você pode recusar.
        </p>
        <h2>Seus direitos (LGPD)</h2>
        <p>Você pode pedir informações, correção ou exclusão de dados que tenhamos sobre você pelo nosso WhatsApp.</p>
        <p>
          Para retirar o consentimento de cookies, limpe os dados deste site no seu navegador; o aviso aparece de novo na próxima visita.
        </p>
      </div>
    </main>
  );
}
