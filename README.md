<div align="center">
  <h1>🏴‍☠️ One Piece — Fan Page</h1>
  <p><strong>Uma homenagem independente ao universo de One Piece, com navegação dinâmica e páginas de mídia.</strong></p>
  <p><img alt="HTML5" src="https://img.shields.io/badge/HTML5%20%2B%20CSS3-Interface-E34F26"> <img alt="jQuery" src="https://img.shields.io/badge/jQuery-AJAX-0769AD?logo=jquery&logoColor=white"></p>
</div>

## Experiência do site

Fan page criada como exercício de frontend e navegação de conteúdo. O arquivo `js/navigation.js` carrega páginas parciais via AJAX, aplica transições visuais e guarda a seção visitada no `localStorage`.

| Página | Arquivo |
| --- | --- |
| Início | `view/home.html` |
| História | `view/story.html` |
| Trailers | `view/trailer.html` |
| Wallpapers | `view/wallpaper.html` |

A experiência também contém menu mobile e recursos de imagem e vídeo na pasta `media/`.

## Executar

```bash
git clone https://github.com/HelioConde/one-piece-fan-page.git
cd one-piece-fan-page
python -m http.server 8000
```

Acesse `http://localhost:8000`. O servidor é importante para permitir que as páginas em `view/` sejam carregadas corretamente por AJAX.

## Organização

`index.html` · `css/` · `js/navigation.js` · `view/` · `media/` · `fontawesome-free-6.5.1-web/`.

## Estado e avisos

**Projeto de estudo, sem afiliação oficial.** O conteúdo não é apresentado como catálogo atualizado de episódios, mangás ou lançamentos.

One Piece e seus personagens, marcas, trilhas, imagens e vídeos pertencem a seus respectivos titulares. O repositório não concede direito de redistribuir materiais de terceiros.

Melhorias possíveis: acessibilidade do menu, URLs para cada seção, performance dos assets, créditos de mídia e testes responsivos.

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).
