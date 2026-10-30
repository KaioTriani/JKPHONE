"use client";
import type { WhatsAppConfig } from "@/lib/tipos";
import { abrirWhatsApp } from "./whatsapp-abrir";

export function BotaoWhatsApp({
  config,
  mensagem,
  local,
  className,
  children,
  hrefInicial,
}: {
  config: WhatsAppConfig;
  mensagem: string;
  local: string;
  className?: string;
  children: React.ReactNode;
  hrefInicial: string;
}) {
  return (
    <a
      href={hrefInicial}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={(e) => {
        const link = abrirWhatsApp(config, mensagem, { local });
        if (link) e.currentTarget.href = link;
        else e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
