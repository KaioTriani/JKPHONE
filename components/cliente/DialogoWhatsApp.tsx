"use client";
import { useEffect, useRef, useState } from "react";
import { IconeCopiar, IconeFechar, IconeWhatsApp } from "../Icones";
import type { PedidoWhatsApp } from "./whatsapp-abrir";

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Navegadores internos (Instagram) às vezes bloqueiam a API: plano B.
    const t = document.createElement("textarea");
    t.value = texto;
    t.setAttribute("readonly", "");
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  }
}

/** Usado só enquanto não há número: o link wa.me/message/... do perfil não aceita mensagem pronta. */
export function DialogoWhatsApp() {
  const ref = useRef<HTMLDialogElement>(null);
  const [pedido, setPedido] = useState<PedidoWhatsApp | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const ouvir = (e: Event) => {
      setPedido((e as CustomEvent<PedidoWhatsApp>).detail);
      setCopiado(false);
      ref.current?.showModal();
    };
    window.addEventListener("jk:whatsapp", ouvir);
    return () => window.removeEventListener("jk:whatsapp", ouvir);
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dlg-wpp-titulo"
      className="m-auto w-[min(92vw,420px)] rounded-2xl border border-texto/15 bg-grafite p-0 text-texto backdrop:bg-preto/70"
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      {pedido && (
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 id="dlg-wpp-titulo" className="text-2xl">
              Copie a mensagem
            </h2>
            <button className="-m-2 grid h-11 w-11 place-items-center text-texto-2" aria-label="Fechar" onClick={() => ref.current?.close()}>
              <IconeFechar />
            </button>
          </div>
          <p className="mt-1 text-sm text-texto-2">O WhatsApp vai abrir sem texto. Copie antes e cole na conversa.</p>
          <p className="mt-4 rounded-xl border border-ouro/40 bg-preto p-4 text-[15px] leading-snug">{pedido.mensagem}</p>
          <div className="mt-4 grid gap-2">
            <button
              className="btn-linha w-full"
              onClick={async () => setCopiado(await copiar(pedido.mensagem))}
              aria-live="polite"
            >
              <IconeCopiar /> {copiado ? "Mensagem copiada" : "Copiar mensagem"}
            </button>
            <a
              href={pedido.link}
              target="_blank"
              rel="noopener"
              className="btn-ouro w-full"
              onClick={async () => {
                if (!copiado) await copiar(pedido.mensagem);
                ref.current?.close();
              }}
            >
              <IconeWhatsApp /> Abrir WhatsApp
            </a>
          </div>
        </div>
      )}
    </dialog>
  );
}
