import { z } from "zod";

// Só usado no servidor e nos scripts: não importar em componentes "use client".

export const origem = z.enum(["perfil", "dono", "pendente", "lei"]);

export const campo = <T extends z.ZodTypeAny>(valor: T) =>
  z.object({
    valor,
    origem,
    revisado: z.boolean(),
    nota: z.string().optional(),
    data: z.string().optional(),
  });

const texto = campo(z.string());
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const dataISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use AAAA-MM-DD");
const hora = z.string().regex(/^\d{2}:\d{2}$/);

export const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
export const horarioSchema = z
  .object(Object.fromEntries(diasSemana.map((d) => [d, z.tuple([hora, hora]).nullable()])) as Record<
    (typeof diasSemana)[number],
    z.ZodNullable<z.ZodTuple<[typeof hora, typeof hora]>>
  >)
  .nullable();

const foto = z.object({ arquivo: z.string(), alt: z.string().min(8) });

export const siteSchema = z.object({
  siteUrl: texto,
  fusoHorario: z.string(),
  fusoUTC: z.string().regex(/^[+-]\d{2}:\d{2}$/),
  marca: z.object({
    nome: texto,
    instagram: texto,
    seguidores: texto,
    logo: texto,
    razaoSocial: texto,
    cnpj: texto,
  }),
  cores: z.object({
    preto: hex,
    grafite: hex,
    ouro: hex,
    "ouro-claro": hex,
    marfim: hex,
    madeira: hex,
    texto: hex,
    "texto-2": hex,
    rosa: hex,
    laranja: hex,
    amarelo: hex,
    azul: hex,
  }),
  whatsapp: z.object({ numero: texto, linkPerfil: texto }),
  loja: z.object({
    bairro: texto,
    endereco: texto,
    cidade: texto,
    uf: texto,
    cep: texto,
    mapsUrl: texto,
    horario: campo(horarioSchema),
    fotos: z.array(foto),
    fotoHero: foto,
  }),
  condicoes: z.object({
    garantiaLojaPrazo: texto,
    garantiaLojaCobertura: texto,
    garantiaLojaAparelhos: texto,
    garantiaLegal: texto,
    parcelasMax: campo(z.number().int().min(1).max(24)),
    parcelamentoJuros: texto,
    parcelaMinima: texto,
    coeficientes: campo(z.record(z.string().regex(/^\d+$/), z.number().positive()).nullable()),
    formasPagamento: texto,
    origemAparelhos: texto,
    troca: texto,
    entrega: texto,
  }),
  textos: z.object({
    headline: z.string(),
    headlinesAlternativas: z.array(z.string()),
    subtitulo: z.string(),
    ctaFinalTitulo: z.string(),
    ctaFinalTexto: z.string(),
  }),
  faq: z.array(z.object({ pergunta: z.string(), resposta: texto })),
  clientes: z.array(
    foto.extend({ autorizacaoPorEscrito: z.literal(true, { errorMap: () => ({ message: "cliente só entra com autorização por escrito" }) }) }),
  ),
});

export const produtoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id: só letras minúsculas, números e hífen"),
  exemplo: z.boolean().optional(),
  categoria: z.enum(["iphone", "acessorio"]),
  modelo: z.string().min(2),
  armazenamento: z.number().int().positive().optional(),
  cores: z.array(z.string()).default([]),
  condicao: z.enum(["novo", "lacrado", "seminovo"]),
  bateria: z.number().int().min(1).max(100).optional(),
  origem: z.string().default("[CONFIRMAR]"),
  preco: z.number().int().positive().nullable(),
  parcelado: z.string().optional(),
  promocao: z.boolean().default(false),
  validade: dataISO.optional(),
  status: z.enum(["disponivel", "reservado", "esgotado"]),
  destaque: z.boolean().default(false),
  // cor -> caminho base da foto processada, ex.: { "Preto": "produtos/iphone-15/preto" }
  fotos: z.record(z.string(), z.string()).default({}),
  fotoIlustrativa: z.boolean().default(false),
});

export const listaProdutosSchema = z.object({
  atualizadoEm: dataISO,
  produtos: z.array(produtoSchema).superRefine((lista, ctx) => {
    const ids = new Set<string>();
    lista.forEach((p, i) => {
      if (ids.has(p.id)) ctx.addIssue({ code: "custom", path: [i, "id"], message: `id repetido: ${p.id}` });
      ids.add(p.id);
    });
  }),
});

export type Site = z.infer<typeof siteSchema>;
export type Produto = z.infer<typeof produtoSchema>;
export type ListaProdutos = z.infer<typeof listaProdutosSchema>;
export type Horario = z.infer<typeof horarioSchema>;
