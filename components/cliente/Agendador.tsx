"use client";
import { useEffect, useState } from "react";
import { proximosDias, type DiaAgenda, type HorarioSemana } from "@/lib/agenda";
import { mensagemAgendamento } from "@/lib/whatsapp";
import { track } from "@/lib/track";
import type { WhatsAppConfig } from "@/lib/tipos";
import { IconeWhatsApp } from "../Icones";
import { abrirWhatsApp } from "./whatsapp-abrir";

export function Agendador({
  horario,
  fuso,
  config,
  hrefInicial,
}: {
  horario: HorarioSemana;
  fuso: string;
  config: WhatsAppConfig;
  hrefInicial: string;
}) {
  // Datas dependem do relógio de quem abre: calculadas só no navegador (altura reservada para não pular).
  const [dias, setDias] = useState<DiaAgenda[] | null>(null);
  const [dia, setDia] = useState(0);
  const [turno, setTurno] = useState(0);
  useEffect(() => setDias(proximosDias(horario, fuso)), [horario, fuso]);

  const escolhido = dias?.[dia];
  const turnoEscolhido = escolhido?.turnos[Math.min(turno, escolhido.turnos.length - 1)];

  return (
    <div className="min-h-[300px]">
      <fieldset>
        <legend className="rotulo mb-3">1 · Dia</legend>
        <div role="radiogroup" aria-label="Dia da visita" className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {(dias ?? Array.from({ length: 7 }, () => null)).map((d, i) =>
            d ? (
              <button
                key={d.iso}
                role="radio"
                aria-checked={i === dia}
                onClick={() => {
                  setDia(i);
                  setTurno(0);
                }}
                className="flex min-h-[60px] flex-col items-center justify-center rounded-xl border border-preto/20 text-preto transition-colors aria-checked:border-preto aria-checked:bg-preto aria-checked:text-marfim"
              >
                <span className="text-[12px] uppercase tracking-wide">{d.curto}</span>
                <span className="num text-[15px]">{d.numero}</span>
              </button>
            ) : (
              <span key={i} className="min-h-[60px] rounded-xl border border-preto/10" aria-hidden="true" />
            ),
          )}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="rotulo mb-3">2 · Turno</legend>
        <div role="radiogroup" aria-label="Turno da visita" className="flex flex-wrap gap-2">
          {escolhido?.turnos.map((t, i) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={t === turnoEscolhido}
              onClick={() => setTurno(i)}
              className="min-h-[44px] rounded-full border border-preto/20 px-5 text-preto transition-colors aria-checked:border-preto aria-checked:bg-preto aria-checked:text-marfim"
            >
              {t.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      <a
        href={hrefInicial}
        target="_blank"
        rel="noopener"
        aria-disabled={!turnoEscolhido}
        className="btn mt-8 w-full bg-preto text-marfim hover:bg-grafite sm:w-auto"
        onClick={(e) => {
          if (!escolhido || !turnoEscolhido) return e.preventDefault();
          const msg = mensagemAgendamento(escolhido.extenso, turnoEscolhido.naFrase);
          track("agendamento_enviado", { dia: escolhido.iso, turno: turnoEscolhido.id });
          const link = abrirWhatsApp(config, msg, { local: "agendador" });
          if (link) e.currentTarget.href = link;
          else e.preventDefault();
        }}
      >
        <IconeWhatsApp />
        {escolhido && turnoEscolhido ? `Agendar ${escolhido.curto === "hoje" || escolhido.curto === "amanhã" ? escolhido.curto : escolhido.extenso.split(",")[0]}, ${turnoEscolhido.naFrase}` : "Agendar pelo WhatsApp"}
      </a>
    </div>
  );
}
