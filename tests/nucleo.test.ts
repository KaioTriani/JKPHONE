import { describe, expect, it } from "vitest";
import { comOrigem, destinoWhatsApp, linkWhatsApp, mensagemAgendamento, mensagemProduto } from "@/lib/whatsapp";
import { promocoesValidas } from "@/lib/promocoes";
import { moeda, armazenamentoTexto } from "@/lib/formato";
import { proximosDias } from "@/lib/agenda";
import { linhaDoModelo, faixasDePreco } from "@/lib/linhas";
import { lerCSV } from "@/lib/csv";
import { acharPendencias } from "@/lib/pendencias";
import { importarLista, lerPreco } from "@/lib/importar";

describe("WhatsApp", () => {
  const item = { modelo: "iPhone 15", armazenamento: 128, cor: "Preto", preco: 429900, status: "disponivel" as const };

  it("monta a mensagem do produto", () => {
    expect(mensagemProduto(item, "JK iPhone BR")).toBe("Olá! Vi o iPhone 15 128 GB Preto por R$ 4.299 no site da JK iPhone BR. Ainda está disponível?");
  });

  it("codifica acentos e preserva no link", () => {
    const link = linkWhatsApp(destinoWhatsApp("5583999990000", ""), mensagemProduto(item, "JK iPhone BR"));
    expect(link.startsWith("https://wa.me/5583999990000?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toContain("Olá! Vi o iPhone 15 128 GB Preto por R$ 4.299");
    expect(link).toContain("Ol%C3%A1");
    expect(link).toContain("est%C3%A1");
  });

  it("acrescenta origem só para utm_source=instagram", () => {
    expect(comOrigem("Oi", "instagram")).toBe("Oi (origem: Instagram)");
    expect(comOrigem("Oi", "Instagram")).toBe("Oi (origem: Instagram)");
    expect(comOrigem("Oi", "google")).toBe("Oi");
  });

  it("sem número válido usa o link do perfil (sem texto)", () => {
    const d = destinoWhatsApp("[CONFIRMAR 55DDDNÚMERO]", "https://wa.me/message/FWVMF3IHIQMMB1");
    expect(d.tipo).toBe("perfil");
    expect(linkWhatsApp(d, "qualquer")).toBe("https://wa.me/message/FWVMF3IHIQMMB1");
  });

  it("esgotado e sem preço mudam a mensagem", () => {
    expect(mensagemProduto({ ...item, status: "esgotado" }, "JK")).toContain("está esgotado");
    expect(mensagemProduto({ ...item, preco: null }, "JK")).toContain("Qual o valor");
  });

  it("mensagem de agendamento", () => {
    expect(mensagemAgendamento("quinta-feira, 30/10", "à tarde")).toBe("Quero agendar uma visita na loja para quinta-feira, 30/10, à tarde.");
  });
});

describe("promoções", () => {
  const base = { promocao: true, status: "disponivel" as const };
  const agora = new Date("2026-10-30T15:00:00-03:00").getTime();

  it("validade é inclusiva até o fim do dia no fuso da loja", () => {
    expect(promocoesValidas([{ ...base, validade: "2026-10-30" }], "-03:00", agora)).toHaveLength(1);
    const meiaNoite = new Date("2026-10-31T00:00:01-03:00").getTime();
    expect(promocoesValidas([{ ...base, validade: "2026-10-30" }], "-03:00", meiaNoite)).toHaveLength(0);
  });

  it("vencida, sem validade ou esgotada não entra", () => {
    const lista = [
      { ...base, validade: "2026-10-20" },
      { ...base, validade: undefined },
      { ...base, validade: "2026-12-01", status: "esgotado" as const },
      { ...base, validade: "2026-12-01" },
    ];
    expect(promocoesValidas(lista, "-03:00", agora)).toHaveLength(1);
  });
});

describe("formatos", () => {
  it("moeda", () => {
    expect(moeda(429900)).toBe("R$ 4.299");
    expect(moeda(429950)).toBe("R$ 4.299,50");
    expect(moeda(14900)).toBe("R$ 149");
    expect(moeda(1234567800)).toBe("R$ 12.345.678");
  });
  it("armazenamento", () => {
    expect(armazenamentoTexto(128)).toBe("128 GB");
    expect(armazenamentoTexto(1024)).toBe("1 TB");
  });
});

describe("agenda", () => {
  const quintaManha = new Date("2026-10-29T12:00:00Z"); // 09:00 em Fortaleza, quinta

  it("sem horário: próximos 7 dias com manhã e tarde", () => {
    const dias = proximosDias(null, "America/Fortaleza", quintaManha);
    expect(dias).toHaveLength(7);
    expect(dias[0].curto).toBe("hoje");
    expect(dias[0].extenso).toBe("quinta-feira, 29/10");
    expect(dias[0].turnos.map((t) => t.id)).toEqual(["manha", "tarde"]);
  });

  it("respeita dias fechados e turnos que já passaram", () => {
    const horario = { dom: null, seg: ["09:00", "18:00"], ter: ["09:00", "18:00"], qua: ["09:00", "18:00"], qui: ["09:00", "18:00"], sex: ["09:00", "18:00"], sab: ["09:00", "12:00"] } as const;
    const tarde = new Date("2026-10-29T19:00:00Z"); // 16:00 local
    const dias = proximosDias(horario as never, "America/Fortaleza", tarde);
    expect(dias.find((d) => d.extenso.startsWith("domingo"))).toBeUndefined();
    expect(dias[0].turnos.map((t) => t.id)).toEqual(["tarde"]);
    expect(dias.find((d) => d.extenso.startsWith("sábado"))!.turnos.map((t) => t.id)).toEqual(["manha"]);
  });
});

describe("vitrine", () => {
  it("linha do modelo", () => {
    expect(linhaDoModelo("iPhone 15 Pro Max", "iphone")).toBe("iPhone 15");
    expect(linhaDoModelo("iPhone SE (3ª geração)", "iphone")).toBe("iPhone SE");
    expect(linhaDoModelo("Capa", "acessorio")).toBe("Acessórios");
  });
  it("faixas de preço cobrem todos os preços", () => {
    const precos = [169900, 239900, 399900, 429900, 519900, 589900];
    const faixas = faixasDePreco(precos);
    expect(faixas.length).toBeGreaterThan(1);
    precos.forEach((p) => expect(faixas.some((f) => p > f.min && p <= f.max)).toBe(true));
  });
});

describe("pendências", () => {
  it("acha [CONFIRMAR], revisado:false e exemplo", () => {
    const p = acharPendencias({ _leia: "[CONFIRMAR] ignorado", a: { valor: "x", revisado: false, origem: "perfil" }, b: "[CONFIRMAR CNPJ]", c: [{ exemplo: true }] });
    expect(p.map((x) => x.caminho)).toEqual(["a", "b", "c[0]"]);
  });
  it("tudo revisado passa", () => {
    expect(acharPendencias({ a: { valor: "x", revisado: true, origem: "dono" } })).toEqual([]);
  });
});

describe("CSV da planilha", () => {
  it("lê aspas, vírgulas e quebras", () => {
    const linhas = lerCSV('id,modelo,cores\nx,"iPhone 15, azul","Preto;Azul"\r\ny,iPhone 13,\n');
    expect(linhas).toEqual([
      { id: "x", modelo: "iPhone 15, azul", cores: "Preto;Azul" },
      { id: "y", modelo: "iPhone 13", cores: "" },
    ]);
  });
});

describe("importar lista do WhatsApp", () => {
  const cores = ["Preto", "Meia-noite", "Azul", "Titânio natural", "Titânio preto"];
  it("preço em vários formatos", () => {
    expect(lerPreco("R$ 4.299,00")).toBe(429900);
    expect(lerPreco("iPhone 12 64GB 1.699")).toBe(169900);
    expect(lerPreco("R$2399")).toBe(239900);
  });
  it("converte linhas e aponta erros", () => {
    const r = importarLista(
      [
        "*LISTA DE HOJE* 📱",
        "📱 iPhone 13 128GB Meia-noite – seminovo 89% – R$ 2.399",
        "iPhone 15 Pro Max 256gb Titânio natural lacrado R$5.899,00",
        "iPhone 14 128GB R$ 3.000",
        "Carregador 20W novo R$ 149",
      ].join("\n"),
      cores,
    );
    const ok = r.filter((x) => x.ok).map((x) => (x.ok ? x.produto : null));
    expect(ok[0]).toMatchObject({ modelo: "iPhone 13", armazenamento: 128, condicao: "seminovo", bateria: 89, preco: 239900, cores: ["Meia-noite"] });
    expect(ok[1]).toMatchObject({ modelo: "iPhone 15 Pro Max", armazenamento: 256, condicao: "lacrado", preco: 589900, cores: ["Titânio natural"] });
    expect(ok[2]).toMatchObject({ categoria: "acessorio", condicao: "novo", preco: 14900 });
    const erros = r.filter((x) => !x.ok);
    expect(erros).toHaveLength(1);
    expect(erros[0].linha).toBe(4);
  });
});
