// Silhuetas autorais (sem material da Apple) para produtos ainda sem foto.

export function SilhuetaAparelho({ className = "", tela = true }: { className?: string; tela?: boolean }) {
  return (
    <svg viewBox="0 0 120 240" className={className} aria-hidden="true">
      <rect x="6" y="4" width="108" height="232" rx="22" fill="currentColor" opacity=".08" />
      <rect x="6" y="4" width="108" height="232" rx="22" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".55" />
      {tela && <rect x="13" y="11" width="94" height="218" rx="16" fill="currentColor" opacity=".1" />}
      <rect x="47" y="18" width="26" height="7" rx="3.5" fill="currentColor" opacity=".45" />
      <rect x="114" y="62" width="2.5" height="30" rx="1.2" fill="currentColor" opacity=".45" />
      <rect x="3.5" y="54" width="2.5" height="14" rx="1.2" fill="currentColor" opacity=".45" />
      <rect x="3.5" y="76" width="2.5" height="24" rx="1.2" fill="currentColor" opacity=".45" />
    </svg>
  );
}

export function SilhuetaAcessorio({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 200" className={className} aria-hidden="true">
      <rect x="40" y="24" width="80" height="80" rx="16" fill="currentColor" opacity=".08" stroke="currentColor" strokeWidth="1.6" strokeOpacity=".55" />
      <rect x="70" y="52" width="20" height="8" rx="4" fill="currentColor" opacity=".45" />
      <path d="M80 104v22c0 18 -34 14 -34 38s38 22 38 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

export function SemFoto({ categoria }: { categoria: "iphone" | "acessorio" }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-preto">
      {categoria === "iphone" ? <SilhuetaAparelho className="h-[72%] w-auto" /> : <SilhuetaAcessorio className="h-[72%] w-auto" />}
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-preto/70">foto em breve</span>
    </div>
  );
}
