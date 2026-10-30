import "server-only";
import siteJson from "@/content/site.json";
import { siteSchema, type Site } from "./schema";
import { ehPendente } from "./pendencias";

// Valida no build: um erro de digitação no site.json para o build com a mensagem do Zod.
export const site: Site = siteSchema.parse(siteJson);

type Campo<T> = { valor: T; revisado: boolean; origem: string };

/** Valor confirmado pelo dono (revisado e sem [CONFIRMAR]); senão null. Usado em SEO/JSON-LD. */
export function confirmado<T>(c: Campo<T>): T | null {
  return c.revisado && !ehPendente(c.valor) ? c.valor : null;
}

export const nomeLoja = site.marca.nome.valor;

export const whatsappConfig = {
  numero: site.whatsapp.numero.valor,
  linkPerfil: site.whatsapp.linkPerfil.valor,
  loja: nomeLoja,
};

/** Seguidores só aparecem revisados e com no máximo 30 dias. */
export function seguidoresAtuais(agora = Date.now()) {
  const s = site.marca.seguidores;
  if (!s.revisado || !s.data) return null;
  const dias = (agora - new Date(`${s.data}T12:00:00${site.fusoUTC}`).getTime()) / 86_400_000;
  return dias <= 30 ? s.valor : null;
}

export const siteUrl = () => {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  const conf = confirmado(site.siteUrl);
  return new URL(env || conf || "http://localhost:3000");
};
