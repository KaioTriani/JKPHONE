// Montagem das mensagens e links do WhatsApp. Seguro para o cliente (sem Zod).
import { armazenamentoTexto, moeda } from "./formato";

export type DestinoWhatsApp = { tipo: "numero"; numero: string } | { tipo: "perfil"; link: string };

export type ItemMensagem = {
  modelo: string;
  armazenamento?: number;
  cor?: string;
  preco: number | null;
  status: "disponivel" | "reservado" | "esgotado";
};

export function numeroValido(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  return /^55\d{10,11}$/.test(digitos) && !valor.includes("[") ? digitos : null;
}

export function destinoWhatsApp(numero: string, linkPerfil: string): DestinoWhatsApp {
  const n = numeroValido(numero);
  return n ? { tipo: "numero", numero: n } : { tipo: "perfil", link: linkPerfil };
}

const juntar = (...partes: (string | undefined)[]) => partes.filter(Boolean).join(" ");

export function mensagemProduto(item: ItemMensagem, loja: string) {
  const nome = juntar(item.modelo, armazenamentoTexto(item.armazenamento), item.cor);
  if (item.status === "esgotado") return `Olá! Vi que o ${nome} está esgotado no site da ${loja}. Pode me avisar quando chegar?`;
  if (item.preco === null) return `Olá! Vi o ${nome} no site da ${loja}. Qual o valor e ainda está disponível?`;
  return `Olá! Vi o ${nome} por ${moeda(item.preco)} no site da ${loja}. Ainda está disponível?`;
}

export const mensagemGeral = (loja: string) => `Olá! Vim pelo site da ${loja} e quero ver os aparelhos disponíveis.`;

export const mensagemAgendamento = (dia: string, turno: string) =>
  `Quero agendar uma visita na loja para ${dia}, ${turno}.`;

export function comOrigem(mensagem: string, utmSource?: string | null) {
  return utmSource?.toLowerCase() === "instagram" ? `${mensagem} (origem: Instagram)` : mensagem;
}

/** Link final. O link wa.me/message/... do perfil não aceita texto: volta sem mensagem. */
export function linkWhatsApp(destino: DestinoWhatsApp, mensagem: string) {
  if (destino.tipo === "numero") return `https://wa.me/${destino.numero}?text=${encodeURIComponent(mensagem)}`;
  return destino.link;
}
