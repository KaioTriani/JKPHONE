import { comOrigem, destinoWhatsApp, linkWhatsApp } from "@/lib/whatsapp";
import { track, utms } from "@/lib/track";
import type { WhatsAppConfig } from "@/lib/tipos";

export type PedidoWhatsApp = { mensagem: string; link: string };

/**
 * Chamado no clique. Com número: devolve o link wa.me com a mensagem (o <a> segue normalmente).
 * Sem número: abre o diálogo "Copiar mensagem" e devolve null (o clique deve ser cancelado).
 */
export function abrirWhatsApp(config: WhatsAppConfig, mensagemBase: string, evento: Record<string, string | number>) {
  const mensagem = comOrigem(mensagemBase, utms().utm_source);
  const destino = destinoWhatsApp(config.numero, config.linkPerfil);
  track("whatsapp_clique", { ...evento, destino: destino.tipo });
  const link = linkWhatsApp(destino, mensagem);
  if (destino.tipo === "numero") return link;
  window.dispatchEvent(new CustomEvent<PedidoWhatsApp>("jk:whatsapp", { detail: { mensagem, link } }));
  return null;
}
