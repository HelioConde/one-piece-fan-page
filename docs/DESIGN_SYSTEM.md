# Design System — One Piece Fan Experience

## Objetivo
Fan page estática, cinematográfica, responsiva e acessível. O design parte de imagens presentes no próprio repositório, sem dependência de API ou banco de dados.

## Princípios
1. **Conteúdo primeiro:** nenhuma informação indispensável fica oculta no mobile.
2. **Controle do usuário:** vídeo externo só após clique; carrossel pausável.
3. **Legibilidade:** tipografia nativa, linhas confortáveis e contraste alto.
4. **Progressão visual:** destaque principal → seções editoriais → galerias.
5. **Acessibilidade:** navegação por teclado, foco evidente, textos alternativos e respeito à redução de movimento.

## Tokens de CSS
Definidos em `css/style.css`, sob `:root`:

| Família | Tokens | Aplicação |
| --- | --- | --- |
| Cor | `--bg`, `--surface`, `--surface-raised` | fundo, cards e blocos |
| Texto | `--ink`, `--ink-muted` | hierarquia e leitura |
| Acentos | `--gold`, `--red`, `--sea` | ações e ênfase |
| Espaço | `--s1` a `--s16` | escala de 4 a 64px |
| Cantos | `--radius-sm`, `--radius`, `--radius-lg` | 12/20/32px |
| Efeitos | `--shadow`, `--motion` | elevação e transições |
| Fonte | `--font` | pilha do sistema, sem download de fontes |

## Componentes
- **Site header:** identidade + links semânticos + botão mobile com `aria-expanded`.
- **Hero:** `.hero-grid` com headline, CTA e ilustração; vira uma coluna em telas pequenas.
- **Buttons:** `.button.button-primary` (ação principal) e `.button.button-secondary` (alternativa).
- **Cards:** `.card`, `.card-cover` e `.card-body`; nunca ocultar card no mobile.
- **Carrossel:** controle manual, botões com nomes acessíveis, indicadores, pausa, teclado e swipe.
- **Galeria:** `.gallery-item`, filtros `aria-pressed` e `<dialog>` nativo.
- **Vídeos:** placeholder local, player sob demanda, saída para plataforma original.
- **Mensagens:** `.notice` e `.error-panel` para informação e erros.

## Breakpoints
- Até **460px**: conteúdo de uma coluna, controles reorganizados.
- Até **760px**: menu colapsável, hero vertical, grids de duas ou uma coluna.
- Até **980px**: navbar e grade ajustadas.
- Acima: layout com limite máximo de 1180px.

## Estados e interações
Todo elemento acionável é `<button>` ou `<a>`; foco por `:focus-visible`; alvos de toque de 44px; nenhuma ação exclusiva do hover. Movimento decorativo é desativado com `prefers-reduced-motion: reduce`.

## Uso de mídia
Imagens de `media/img/` são ilustrações herdadas do projeto de estudo. Não presumir permissões para redistribuição. Incluir atribuição e/ou substituir por arte própria ou licenciada antes de divulgação comercial.

## Checklist visual
Conferir 320, 375, 768, 1024, 1440 e 1920px; sem corte de títulos, sem rolagem horizontal, menu acessível, modal fechável, vídeo sem autoplay, estados hover/foco e contraste apropriado.

## Capa animada (conceito clássico recuperado)
A Home exibe as dez artes originais em sequência na coluna direita; a foto inicial é Luffy e as demais entram com crossfade suave. A troca ocorre a cada 4,4 segundos, suspensa enquanto usuário interage/foca/passa mouse ou ao perder visibilidade. Em `prefers-reduced-motion: reduce` a troca automática inicia pausada; setas e swipe seguem disponíveis. A arte não desaparece no mobile. Na captura automatizada a reprodução é pausada para resultados reproduzíveis.

## Refinamento por captura (27/10/2026)
A captura de 1366×768 mostrou CTA da Home fora da primeira dobra. A capa preserva as dez artes rotativas, com altura responsiva e versão compacta para viewports baixos. Menu fixado durante leitura, capítulos com `scroll-margin-top` para não ficar sob o cabeçalho e espaçamento editorial mais contido nas páginas internas. Testes de viewport baixo verificam presença dos botões da Home sem rolagem.

## Revisão de capturas — leitura e navegação
A navegação interna da História agora destaca o capítulo que está em leitura usando `aria-current=location`, sem alterar o hash da página. Um botão de retorno ao topo foi acrescentado no rodapé para as páginas extensas. Ambos são controlados por JavaScript sem dependências e dispõem de testes Playwright para navegação por rolagem e respeito ao cabeçalho fixo.

## Galeria navegável e links compartilháveis (27/10/2026)
Cada transformação abre sua própria arte através de `#wallpaper/<id>`, sem abandonar o GitHub Pages. O modal usa o elemento `<dialog>` nativo, com setas anterior/próximo, teclas esquerda/direita, swipe, contador e legendas derivadas de `js/data.js`. Dentro de um filtro, a navegação permanece nas artes filtradas; fechar remove o identificador da arte da URL. Os controles têm área de toque mínima de 44 px.
