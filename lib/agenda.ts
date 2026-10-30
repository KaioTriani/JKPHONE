// Próximos dias e turnos para o mini agendador. Seguro para o cliente.

export type HorarioSemana = Record<"dom" | "seg" | "ter" | "qua" | "qui" | "sex" | "sab", [string, string] | null> | null;

export type Turno = { id: "manha" | "tarde" | "noite"; rotulo: string; naFrase: string; inicio: number; fim: number };
export type DiaAgenda = { iso: string; curto: string; numero: string; extenso: string; turnos: Turno[]; hoje: boolean };

const TURNOS: Turno[] = [
  { id: "manha", rotulo: "Manhã", naFrase: "de manhã", inicio: 0, fim: 12 * 60 },
  { id: "tarde", rotulo: "Tarde", naFrase: "à tarde", inicio: 12 * 60, fim: 18 * 60 },
  { id: "noite", rotulo: "Noite", naFrase: "à noite", inicio: 18 * 60, fim: 24 * 60 },
];
const CHAVES = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
const CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const EXTENSO = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

const minutos = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Partes da data/hora atuais no fuso da loja. */
function agoraNoFuso(fuso: string, agora: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: fuso,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(agora)
      .map((x) => [x.type, x.value]),
  );
  return { ano: +p.year, mes: +p.month, dia: +p.day, minuto: +p.hour * 60 + +p.minute };
}

/**
 * Próximos `quantos` dias com turnos disponíveis.
 * Sem horário confirmado (null), todos os dias aparecem com manhã e tarde.
 */
export function proximosDias(horario: HorarioSemana, fuso: string, agora = new Date(), quantos = 7): DiaAgenda[] {
  const base = agoraNoFuso(fuso, agora);
  const dias: DiaAgenda[] = [];
  for (let i = 0; i < quantos; i++) {
    const d = new Date(Date.UTC(base.ano, base.mes - 1, base.dia + i));
    const semana = d.getUTCDay();
    const faixa = horario ? horario[CHAVES[semana]] : ["08:00", "18:00"];
    if (!faixa) continue;
    const [abre, fecha] = [minutos(faixa[0]), minutos(faixa[1])];
    const turnos = TURNOS.filter((t) => {
      const ini = Math.max(t.inicio, abre);
      const fim = Math.min(t.fim, fecha);
      if (fim - ini < 30) return false; // turno precisa de pelo menos 30 min de loja aberta
      return i > 0 || base.minuto < fim - 30; // hoje: só se ainda dá tempo
    });
    if (!turnos.length) continue;
    const iso = d.toISOString().slice(0, 10);
    const numero = `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
    dias.push({ iso, curto: i === 0 ? "hoje" : i === 1 ? "amanhã" : CURTO[semana], numero, extenso: `${EXTENSO[semana]}, ${numero}`, turnos, hoje: i === 0 });
  }
  return dias;
}
