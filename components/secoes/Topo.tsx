import { Logo } from "../Logo";
import { IconeWhatsApp } from "../Icones";
import { BotaoWhatsApp } from "../cliente/BotaoWhatsApp";
import type { WhatsAppConfig } from "@/lib/tipos";

type P = { config: WhatsAppConfig; mensagem: string; hrefInicial: string };

export function Topo({ config, mensagem, hrefInicial }: P) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-texto/10 bg-preto/85 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <a href="#inicio" className="flex min-h-[44px] items-center" aria-label={`${config.loja}, início`}>
          <Logo />
        </a>
        <nav aria-label="Seções" className="flex items-center gap-1">
          <a href="#vitrine" data-local="topo" className="hidden min-h-[44px] items-center px-3 text-sm text-texto-2 hover:text-texto sm:flex">
            Aparelhos
          </a>
          <a href="#visita" className="hidden min-h-[44px] items-center px-3 text-sm text-texto-2 hover:text-texto lg:flex">
            Agendar visita
          </a>
          <a href="#loja" className="hidden min-h-[44px] items-center px-3 text-sm text-texto-2 hover:text-texto lg:flex">
            A loja
          </a>
          <a href="#vitrine" data-local="topo" className="flex min-h-[44px] items-center px-2 text-sm text-texto-2 sm:hidden">
            Aparelhos
          </a>
          <BotaoWhatsApp config={config} mensagem={mensagem} local="topo" hrefInicial={hrefInicial} className="btn-ouro ml-2 hidden min-h-[44px] px-5 text-sm md:inline-flex">
            <IconeWhatsApp className="h-4 w-4" /> Chamar no WhatsApp
          </BotaoWhatsApp>
        </nav>
      </div>
    </header>
  );
}

/** Botão flutuante do celular. O body tem padding-bottom do mesmo tamanho: nunca cobre conteúdo. */
export function BarraFlutuante({ config, mensagem, hrefInicial }: P) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-texto/10 bg-preto/90 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
      <BotaoWhatsApp config={config} mensagem={mensagem} local="flutuante" hrefInicial={hrefInicial} className="btn-ouro w-full">
        <IconeWhatsApp /> Chamar no WhatsApp
      </BotaoWhatsApp>
    </div>
  );
}
