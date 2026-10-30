// Mostra um dado do config. Pendências ficam visíveis na pré-visualização (o build de produção não passa com elas).

type Campo = { valor: unknown; revisado: boolean; origem: string };

/** Texto livre que pode conter trechos "[CONFIRMAR ...]". */
export function ComPendencias({ texto }: { texto: string }) {
  const partes = texto.split(/(\[CONFIRMAR[^\]]*\])/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("[CONFIRMAR") ? (
          <mark key={i} className="pendente" title="Aguardando confirmação do dono">
            {p.slice(1, -1)}
          </mark>
        ) : (
          p
        ),
      )}
    </>
  );
}

export function Dado({ campo, sufixo = "" }: { campo: Campo; sufixo?: string }) {
  const texto = `${String(campo.valor ?? "[CONFIRMAR]")}${sufixo}`;
  if (texto.includes("[CONFIRMAR")) return <ComPendencias texto={texto} />;
  if (!campo.revisado)
    return (
      <span className="a-revisar" title={`Dado do ${campo.origem === "perfil" ? "perfil do Instagram" : "config"}, aguardando revisão do dono`}>
        {texto}
      </span>
    );
  return <>{texto}</>;
}
