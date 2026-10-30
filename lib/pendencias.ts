// Varre um JSON e lista tudo o que ainda precisa da revisão do dono.
export type Pendencia = { caminho: string; motivo: string };

const MARCADOR = "[CONFIRMAR";

export function acharPendencias(dado: unknown, caminho = ""): Pendencia[] {
  const saida: Pendencia[] = [];
  const visitar = (no: unknown, onde: string) => {
    if (typeof no === "string") {
      if (no.includes(MARCADOR)) saida.push({ caminho: onde, motivo: no });
      return;
    }
    if (Array.isArray(no)) {
      no.forEach((item, i) => visitar(item, `${onde}[${i}]`));
      return;
    }
    if (no && typeof no === "object") {
      const obj = no as Record<string, unknown>;
      if (obj.revisado === false) saida.push({ caminho: onde, motivo: `revisado: false (origem: ${String(obj.origem)})` });
      if (obj.exemplo === true) saida.push({ caminho: onde, motivo: "item de EXEMPLO (preço e modelo fictícios)" });
      for (const [chave, valor] of Object.entries(obj)) {
        if (chave.startsWith("_")) continue; // comentários para o dono
        visitar(valor, onde ? `${onde}.${chave}` : chave);
      }
    }
  };
  visitar(dado, caminho);
  return saida;
}

export const ehPendente = (valor: unknown) => typeof valor === "string" && valor.includes(MARCADOR);
