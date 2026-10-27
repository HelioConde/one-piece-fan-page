# 🏴‍☠️ One Piece — Fan Experience

Fan page independente de **One Piece**, modernizada em HTML, CSS e JavaScript nativos. Funciona como site **100% estático no GitHub Pages**: sem backend, login ou banco de dados.

## Recursos

- Home cinematográfica e responsiva, com CTAs e conteúdo editorial.
- História da Grande Era dos Piratas em capítulos.
- Catálogo de transformações do Luffy a partir de imagens locais.
- Galeria com filtros, descrições e modal acessível.
- Trailers sob demanda (YouTube em modo de privacidade aprimorada e Vimeo).
- Carrossel com setas, indicadores, pausa, teclado, swipe e respeito a movimentos reduzidos.
- Navegação compartilhável por hash, estado ativo, botão mobile semântico e tratamento de falhas de carregamento.
- SEO social (Open Graph), menu de salto, foco visível e imagens WebP.
- Testes automatizados em Chromium para desktop e mobile, incluindo verificações de geometria do layout e carregamento de imagens.

## Acessar
Site publicado: https://helioconde.github.io/one-piece-fan-page/

> A publicação depende de o GitHub Pages estar configurado para a branch `main`. Mudanças em uma branch de trabalho aparecem somente após incorporação à `main`.

## Rodar localmente

Requer Node.js 20+ (ou qualquer servidor estático HTTP equivalente).

```bash
git clone https://github.com/HelioConde/one-piece-fan-page.git
cd one-piece-fan-page
node scripts/serve.mjs
```

Abra http://127.0.0.1:4173. Abrir o HTML com `file://` não funciona porque a navegação carrega páginas parciais via `fetch`.

## Testes

```bash
npm install
npx playwright install chromium
npm test
```

O relatório HTML é gerado em `playwright-report/`. Para atualizar as capturas de comparação, primeiro revise a saída em `test-results/`, capture baselines validadas e faça commit delas conscientemente. Capturas de QA são registradas nos artefatos da integração contínua. Antes de capturar, o teste força a decodificação das imagens lazy para evitar áreas vazias nas imagens de relatório. A suíte também detecta regressões geométricas (sobreposição entre colunas e rolagem horizontal), mas **ainda não implementa comparação pixel a pixel com snapshots de referência aprovadas**.

## Estrutura

```text
index.html                  Shell acessível e SEO
css/style.css               Estilos, tokens e responsividade
js/navigation.js            Rotas, menu, histórico hash e erros
js/script.js                Carrossel, galeria, modal, vídeos
js/data.js                  Metadados das artes
view/*.html                 Páginas parciais estáticas
media/img/                  Arte local original do repositório
docs/DESIGN_SYSTEM.md       Padrões de design e QA
tests/                      Testes E2E e acessibilidade
scripts/serve.mjs           Servidor local para testes
.github/workflows/qa.yml    Verificação automatizada
```

## Direitos e créditos
Projeto de estudo e homenagem **não oficial**, sem afiliação à Shueisha, Toei Animation ou à equipe de One Piece. Marcas, personagens e artes pertencem aos respectivos titulares. O repositório não garante licença de reprodução ou redistribuição das imagens e vídeos de terceiros. Vídeos são incorporados dos provedores somente após interação e podem estar indisponíveis dependendo das permissões do titular.

Criado por [Hélio Conde](https://github.com/HelioConde).

## Capturas automáticas e diagnóstico visual
Execute `npm run test:visual` para percorrer Home, História, Transformações, Galeria e Trailers em seis larguras, fotografando **páginas inteiras**. Os testes registram `pageerror`, erros de console e falhas de requisição local, verificam imagens e detectam overflow e elementos recortados. Os arquivos `.jpg` e `.json` são anexados ao relatório Playwright e publicados como artefatos do GitHub Actions. As capturas são evidências para revisão humana; não há promessa de classificação estética automática ou comparação pixel a pixel com baselines.

A Home também recuperou a **rotação de dez artes** do projeto clássico, com controle manual, pausa e suporte a movimento reduzido.

## Galeria de artes com deep links
É possível abrir diretamente uma arte usando, por exemplo, `#wallpaper/gear5`. Os cartões de Transformações levam à respectiva arte. No modal, navegue com as setas dos botões, teclas esquerda/direita ou gesto de deslizar; o contador indica a posição e os filtros continuam funcionais. O link é compartilhável e não necessita backend.

O Playwright também registra capturas do modal de galeria aberto nos viewports de 375 e 1440 px para detectar controles fora da tela.
