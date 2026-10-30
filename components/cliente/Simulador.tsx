"use client";
import { useState } from "react";
import { moeda } from "@/lib/formato";

/** Só aparece quando a tabela de coeficientes da maquininha está no config. Mostra parcela, total e juros. */
export function Simulador({ coeficientes }: { coeficientes: Record<string, number> }) {
  const parcelas = Object.keys(coeficientes).map(Number).sort((a, b) => a - b);
  const [valor, setValor] = useState("");
  const [n, setN] = useState(parcelas[parcelas.length - 1]);
  const centavos = Math.round(Number(valor.replace(/\./g, "").replace(",", ".")) * 100) || 0;
  const parcela = Math.round(centavos * coeficientes[String(n)]);
  const total = parcela * n;
  return (
    <div className="rounded-2xl border border-texto/15 p-5">
      <p className="rotulo">Simulador de parcelas</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm text-texto-2">
          Valor do aparelho (R$)
          <input
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="4.299,00"
            className="num min-h-[44px] rounded-lg border border-texto/20 bg-preto px-3 text-texto"
          />
        </label>
        <label className="grid gap-1 text-sm text-texto-2">
          Parcelas
          <select value={n} onChange={(e) => setN(Number(e.target.value))} className="num min-h-[44px] rounded-lg border border-texto/20 bg-preto px-3 text-texto">
            {parcelas.map((p) => (
              <option key={p} value={p}>
                {p}x
              </option>
            ))}
          </select>
        </label>
      </div>
      {centavos > 0 && (
        <dl className="num mt-4 grid grid-cols-3 gap-2 text-sm" aria-live="polite">
          <div>
            <dt className="text-texto-2">Parcela</dt>
            <dd className="text-lg">{moeda(parcela)}</dd>
          </div>
          <div>
            <dt className="text-texto-2">Total</dt>
            <dd className="text-lg">{moeda(total)}</dd>
          </div>
          <div>
            <dt className="text-texto-2">Juros</dt>
            <dd className="text-lg">{total > centavos ? moeda(total - centavos) : "sem juros"}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
