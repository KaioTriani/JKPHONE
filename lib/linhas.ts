// Agrupamentos da vitrine, gerados a partir dos dados.

/** "iPhone 15 Pro Max" -> "iPhone 15"; acessórios -> "Acessórios". */
export function linhaDoModelo(modelo: string, categoria: "iphone" | "acessorio") {
  if (categoria === "acessorio") return "Acessórios";
  const m = modelo.match(/iphone\s*(\d{1,2}|se|xr|xs|x)\b/i);
  return m ? `iPhone ${m[1].toUpperCase()}` : modelo;
}

export type Faixa = { id: string; rotulo: string; min: number; max: number };

const passoRedondo = (v: number) => {
  const reais = v / 100;
  const passos = [250, 500, 1000, 1500, 2000, 2500, 5000];
  return (passos.find((p) => p >= reais) ?? 5000) * 100;
};

/** Até 4 faixas de preço a partir dos preços existentes (em centavos). */
export function faixasDePreco(precos: number[]): Faixa[] {
  const validos = precos.filter((p) => p > 0).sort((a, b) => a - b);
  if (validos.length < 3) return [];
  const passo = passoRedondo((validos[validos.length - 1] - validos[0]) / 3);
  const inicio = Math.ceil(validos[0] / passo) * passo;
  const cortes = [inicio, inicio + passo, inicio + 2 * passo].filter((c) => c < validos[validos.length - 1]);
  const reais = (c: number) => `R$ ${(c / 100).toLocaleString("pt-BR")}`;
  const faixas: Faixa[] = [];
  let anterior = 0;
  cortes.forEach((c) => {
    faixas.push({ id: `${anterior}-${c}`, rotulo: anterior ? `${reais(anterior)} a ${reais(c)}` : `Até ${reais(c)}`, min: anterior, max: c });
    anterior = c;
  });
  faixas.push({ id: `${anterior}-`, rotulo: `Acima de ${reais(anterior)}`, min: anterior, max: Number.MAX_SAFE_INTEGER });
  return faixas.filter((f) => validos.some((p) => p > f.min && p <= f.max));
}
