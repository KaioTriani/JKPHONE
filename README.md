# JK iPhone BR — landing page

Uma página, mobile-first, feita para tráfego do Instagram: vitrine de aparelhos → WhatsApp com o modelo escolhido ou com a visita agendada. Sem login, carrinho, formulário ou banco de dados.

Next.js 14 (App Router) · TypeScript · Tailwind · Zod · sharp · Vitest. JS inicial ≈ 96 KB gz.

```bash
npm install
npm run dev              # http://localhost:3000
npm test                 # testes (mensagens, promoções, agenda, importador...)
npm run check:placeholders
```

## Antes de publicar: pendências

Todo dado tem `valor`, `origem` (`perfil`, `dono`, `pendente`, `lei`) e `revisado`. O que veio do perfil do Instagram entra com `revisado: false`; o resto está como `[CONFIRMAR ...]`.

- Rode `npm run check:placeholders` antes de divulgar o site: ele lista tudo que ainda falta (`[CONFIRMAR`, `revisado: false`, produtos de EXEMPLO, logo e foto do hero). O build não depende dele.
- Na pré-visualização, pendências aparecem marcadas em amarelo tracejado na própria página.

## Trocar coisas em 10 minutos

| Quero trocar | Onde |
|---|---|
| Nome, Instagram, CNPJ, razão social | `content/site.json` → `marca` |
| WhatsApp | `content/site.json` → `whatsapp.numero` (só dígitos: `5583999990000`) |
| Endereço, horário, link do Maps | `content/site.json` → `loja` |
| Garantia, parcelamento, pagamento, entrega, troca | `content/site.json` → `condicoes` |
| Títulos e textos | `content/site.json` → `textos` |
| Perguntas frequentes | `content/site.json` → `faq` |
| Cores | `content/site.json` → `cores` (a página toda usa esses tokens) |
| Produtos, preços, promoções | `content/produtos.json` |

Depois de conferir um dado, troque o valor e marque `"revisado": true`.

**Horário** (habilita o agendador por dia/turno):
```json
"horario": { "valor": { "seg": ["09:00","18:00"], "ter": ["09:00","18:00"], "qua": ["09:00","18:00"], "qui": ["09:00","18:00"], "sex": ["09:00","18:00"], "sab": ["09:00","13:00"], "dom": null }, "origem": "dono", "revisado": true }
```

**Simulador de parcelas**: preencha `condicoes.coeficientes` com a tabela da maquininha (`{"1": 1, "2": 0.515, ..., "18": 0.0742}`) e marque revisado. O simulador mostra parcela, total e juros.

### WhatsApp
- Com `whatsapp.numero` válido, todo botão abre `wa.me/<número>?text=...` com a mensagem pronta, ex.: *"Olá! Vi o iPhone 15 128 GB Preto por R$ 4.299 no site da JK iPhone BR. Ainda está disponível?"* — e acrescenta *"(origem: Instagram)"* quando a visita veio com `utm_source=instagram`.
- Sem número, usa o link do perfil (`wa.me/message/...`), que **não aceita mensagem pronta**: o site mostra antes o botão "Copiar mensagem".
- Link para a bio/stories: `https://SEU-DOMINIO/?utm_source=instagram&utm_medium=bio` (ou `utm_medium=stories`).

## Produtos e promoções

`content/produtos.json` (validado com Zod). Preço **em centavos** (`R$ 4.299,00` = `429900`; `null` = "Consulte").

```json
{
  "id": "iphone-15-128-preto",
  "categoria": "iphone",            // iphone | acessorio
  "modelo": "iPhone 15",
  "armazenamento": 128,             // GB
  "cores": ["Preto", "Azul"],
  "condicao": "lacrado",            // novo | lacrado | seminovo
  "bateria": 88,                    // opcional, seminovos
  "origem": "nacional",             // nacional | importado
  "preco": 429900,
  "parcelado": "18x de R$ 289,90 (total R$ 5.218,20, com juros)",
  "promocao": true,
  "validade": "2026-11-15",         // obrigatória para aparecer em Promoções
  "status": "disponivel",           // disponivel | reservado | esgotado
  "destaque": true,
  "fotos": { "Preto": "produtos/iphone-15-128-preto/preto" },
  "fotoIlustrativa": false
}
```

- **Promoção** só aparece com `promocao: true`, `validade` futura e estoque. Venceu (fim do dia, horário da loja) ou esgotou: some sozinha. Sem nenhuma válida, a seção some.
- **Cores**: a bolinha só aparece para cor que tem foto; cor sem foto aparece só com o nome.
- **Esgotado** fica apagado, com "Avise-me no WhatsApp".
- A lista atual é de **EXEMPLO** (preços fictícios, marcados no site). Troque tudo e apague `"exemplo": true`.

### Importar a lista de preços do WhatsApp
Cole a lista num `.txt` (uma linha por aparelho, com condição e preço):
```
iPhone 13 128GB Meia-noite seminovo 89% R$ 2.399
iPhone 15 Pro Max 256GB lacrado R$ 5.899,00
```
```bash
npm run importar-lista -- lista.txt            # mostra: novos, alterados, fora da lista, erros
npm run importar-lista -- lista.txt --gravar   # grava content/produtos.json
```

### Planilha do Google (opcional)
1. Crie uma planilha com os cabeçalhos: `id, categoria, modelo, armazenamento, cores, condicao, bateria, origem, preco, parcelado, promocao, validade, status, destaque, fotos, fotoIlustrativa`.
   - `cores`: separadas por `;` · `preco`: em centavos · `promocao`/`destaque`: `sim` ou vazio · `fotos`: `Preto=produtos/id/preto; Azul=produtos/id/azul`.
2. Arquivo → Compartilhar → Publicar na Web → a aba → **CSV** → copie o link.
3. Na hospedagem (Hostinger, Vercel...), defina `PLANILHA_CSV_URL` com esse link.

O site relê a planilha a cada 5 minutos. Se ela falhar ou tiver erro, usa `content/produtos.json`.

## Fotos

Só fotos originais da loja (do celular, não baixadas do Instagram). Os originais ficam em `originais/` (não vão para o Git, pois têm GPS).

```
originais/loja/hero.jpg               ← foto do hero (mural + prateleiras, sem pessoas)
originais/loja/mural.jpg, prateleiras.jpg, balcao.jpg, vitrine.jpg, fachada.jpg
originais/produtos/<id>/<cor>.jpg     ← ex.: originais/produtos/iphone-15-128-preto/preto.jpg
public/marca/logo.png                 ← logo original (PNG transparente ou SVG; ajuste marca.logo)
```
```bash
npm run images        # AVIF/WebP 480/960/1600, placeholder borrado, sem EXIF/GPS, qa/contact-sheet.png
npm run tokens:logo   # sugere --ouro/--preto a partir do logo (--aplicar para gravar)
```
Produtos saem padronizados em 1200×1500 (4:5), centralizados e com a base alinhada. O fundo só é removido se o `rembg` estiver instalado (`pip install rembg[cli]`); nunca por corte de branco (apagaria aparelhos brancos/prateados). Com fundo branco, o site funde o branco no palco claro do card.

Sem foto, o card mostra uma silhueta com "foto em breve".

## Medição

- **Plausible** (sem cookies): defina `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- **GA4 / Meta Pixel** (opcionais): `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`. Só carregam depois do "Permitir" no banner. Revise `/privacidade` com advogado.
- Eventos: `whatsapp_clique` (com modelo e local), `agendamento_enviado`, `ver_aparelhos`, `rolagem_50`, `rolagem_90`. UTMs ficam na sessão.

## QA e imagem de compartilhamento

```bash
npm run build && npm start
npm run screenshots              # qa/screens/{360,390,768,1440}.png + checa rolagem horizontal, nome/preço cortados, alvos < 44 px
npm run screenshots -- --og      # também gera public/og.jpg (1200x630) a partir de /og
```
Rode `--og` de novo sempre que trocar logo, foto do hero ou headline. Usa o Edge/Chrome instalados.

## Deploy (Hostinger)

Importe o repositório do GitHub como app Node.js. Build: `npm run build` · Início: `npm start` · Node 20 ou mais novo. Variável: só `NEXT_PUBLIC_SITE_URL` (as outras são opcionais; não crie as que não usar).

---
iPhone é marca da Apple Inc. A JK iPhone BR é loja independente, sem vínculo com a Apple. Este projeto não usa imagens, logotipos ou fontes da Apple.
