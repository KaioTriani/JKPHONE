// Tipos simples (sem Zod) que viajam do servidor para os componentes de cliente.

export type FotoInfo = {
  base: string; // ex.: "produtos/iphone-15/preto"
  largura: number;
  altura: number;
  larguras: number[];
  blur: string; // data URI
  alfa: boolean; // fundo transparente?
};

export type ProdutoVitrine = {
  id: string;
  exemplo: boolean;
  categoria: "iphone" | "acessorio";
  modelo: string;
  linha: string;
  armazenamento?: number;
  cores: string[];
  condicao: "novo" | "lacrado" | "seminovo";
  bateria?: number;
  origem: string;
  preco: number | null;
  parcelado?: string;
  promocao: boolean;
  validade?: string;
  status: "disponivel" | "reservado" | "esgotado";
  destaque: boolean;
  fotos: { cor: string; foto: FotoInfo; hex?: string }[]; // só cores com foto processada
  fotoIlustrativa: boolean;
};

export type WhatsAppConfig = {
  numero: string;
  linkPerfil: string;
  loja: string;
};
