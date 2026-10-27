import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('início: conteúdo real, navegação e seções',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:/O mundo é feito de aventuras/i})).toBeVisible();
  await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link',{name:'História'}).click();
  await expect(page).toHaveURL(/#story$/);
  await expect(page.getByRole('heading',{name:'Uma história de sonhos e liberdade'})).toBeVisible();
  await expect(page.getByRole('link',{name:'História',exact:true})).toHaveAttribute('aria-current','page');
  await page.goBack();
  await expect(page.getByRole('heading',{name:/O mundo é feito de aventuras/i})).toBeVisible();
});

test('história: capítulos internos não quebram a rota',async({page})=>{
  await page.goto('/#story');
  await page.getByRole('navigation',{name:'Capítulos da história'}).getByRole('link',{name:'A promessa'}).click();
  await expect(page).toHaveURL(/#story$/);
  await expect(page.locator('#chapter-shanks')).toBeFocused();
});

test('menu mobile abre, navega e fecha com Escape',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/');
  const menu=page.getByRole('button',{name:'Abrir menu'});
  await expect(menu).toBeVisible();await menu.click();
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','true');
  await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link',{name:'Galeria'}).click();
  await expect(page.getByRole('heading',{name:'Galeria dos mares'})).toBeVisible();
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','false');
  await page.locator('#menu-toggle').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','false');
});

test('carrossel: controles e pausa',async({page})=>{
  await page.goto('/#home');
  await expect(page.locator('#slide-title')).toHaveText('Luffy');
  await page.getByRole('button',{name:'Próxima imagem'}).click();
  await expect(page.locator('#slide-title')).toHaveText('Gear Second');
  await page.getByRole('button',{name:'Pausar reprodução automática'}).click();
  await expect(page.locator('#slide-pause')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-carousel]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#slide-title')).toHaveText('Luffy');
});

test('galeria: filtros e janela modal',async({page})=>{
  await page.goto('/#wallpaper');
  await expect(page.locator('.gallery-item')).toHaveCount(10);
  await page.getByRole('button',{name:'Especiais'}).click();
  await expect(page.locator('.gallery-item')).toHaveCount(1);
  await page.getByRole('button',{name:/Nightmare Luffy/}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Fechar imagem'}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('vídeos: consentimento antes de carregar iframe',async({page})=>{
  await page.goto('/#trailer');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button',{name:'Reproduzir vídeo do YouTube'}).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('iframe')).toHaveAttribute('src',/youtube-nocookie.com/);
});

for(const route of ['home','story','characters','wallpaper','trailer']){
  test('acessibilidade WCAG 2 A/AA em '+route,async({page})=>{
    await page.goto('/#'+route);
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}

for(const width of [320,375,768,1024,1440,1920]){
  test('responsivo: sem overflow horizontal em '+width+'px',async({page},testInfo)=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/#home');
    await expect(page.locator('#hero-title')).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    // Força a decodificação das imagens abaixo da dobra antes da captura
    await page.evaluate(async()=>{
      const imgs=[...document.querySelectorAll('img')];
      imgs.forEach(img=>img.loading='eager');
      await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));
    });
    await testInfo.attach('home-'+width+'.png',{body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'});
  });
}


test('capa inicial: recupera rotação das artes originais e pausa',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/#home');
  const hero=page.locator('[data-hero-slider]');
  await expect(hero).toHaveAttribute('data-hero-index','0');
  await expect(hero.locator('.hero-image.is-active')).toHaveAttribute('src',/Luffy\.webp/);
  await expect(hero).toHaveAttribute('data-hero-index','1',{timeout:9000});
  await expect(hero.locator('.hero-image.is-active')).toHaveAttribute('src',/g2_0\.webp/);
  await hero.locator('#hero-pause').click();
  await expect(hero.locator('#hero-pause')).toHaveAttribute('aria-pressed','true');
  await hero.locator('#hero-next').click();
  await expect(hero).toHaveAttribute('data-hero-index','2');
  await expect(hero.locator('.hero-image.is-active')).toHaveAttribute('src',/g2_1\.webp/);
  await hero.locator('#hero-prev').click();
  await expect(hero).toHaveAttribute('data-hero-index','1');
});

test('capa inicial: respeita redução de movimento, sem esconder arte no celular',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:740});
  await page.goto('/#home');
  await expect(page.locator('#hero-pause')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.hero-image.is-active')).toBeVisible();
  await page.locator('#hero-next').click();
  await expect(page.locator('[data-hero-slider]')).toHaveAttribute('data-hero-index','1');
});


test('história: capítulo ativo acompanha a leitura sem alterar o hash',async({page})=>{
  await page.setViewportSize({width:1366,height:647});
  await page.goto('/#story');
  const links=page.getByRole('navigation',{name:'Capítulos da história'});
  await expect(links.getByRole('link',{name:'A Grande Era'})).toHaveAttribute('aria-current','location');
  await links.getByRole('link',{name:'A promessa'}).click();
  await expect(page.locator('#chapter-shanks')).toBeFocused();
  await expect(links.getByRole('link',{name:'A promessa'})).toHaveAttribute('aria-current','location');
  await links.getByRole('link',{name:'O primeiro passo'}).click();
  await expect(page.locator('#chapter-sea')).toBeFocused();
  await expect(links.getByRole('link',{name:'O primeiro passo'})).toHaveAttribute('aria-current','location');
  await expect(page).toHaveURL(/#story$/);
});

test('navegação após rolagem abre a página no título sem esconder sob a navbar',async({page})=>{
  await page.setViewportSize({width:1366,height:647});
  await page.goto('/#home');
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link',{name:'História'}).click();
  await expect(page.getByRole('heading',{name:'Uma história de sonhos e liberdade'})).toBeVisible();
  const bounds=await page.evaluate(()=>{
    const heading=document.querySelector('.page-heading h1').getBoundingClientRect();
    const header=document.querySelector('.site-header').getBoundingClientRect();
    return {headingTop:heading.top,headerBottom:header.bottom,scrollY};
  });
  expect(bounds.headingTop).toBeGreaterThanOrEqual(bounds.headerBottom-1);
  expect(bounds.scrollY).toBeLessThanOrEqual(5);
});

test('botão do rodapé volta ao topo sem navegar para a Home',async({page})=>{
  await page.goto('/#story');
  await page.locator('#back-to-top').scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Voltar ao topo'}).click();
  await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:4500}).toBeLessThanOrEqual(3);
  await expect(page).toHaveURL(/#story$/);
});


test('transformações: link abre diretamente a arte correta e permite navegar',async({page})=>{
  await page.goto('/#characters');
  await page.locator('.card').filter({has:page.getByRole('heading',{name:'Gear Fifth'})})
    .getByRole('link',{name:/Ampliar esta arte/}).click();
  await expect(page).toHaveURL(/#wallpaper\/gear5$/);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#dialog-image')).toHaveAttribute('src',/g5_1\.webp$/);
  await expect(page.locator('#dialog-caption')).toContainText('Gear Fifth');
  await page.getByRole('button',{name:'Próxima imagem ampliada'}).click();
  await expect(page.locator('#dialog-caption')).toContainText('Nightmare Luffy');
  await expect(page).toHaveURL(/#wallpaper\/nightmare$/);
  await page.getByRole('button',{name:'Imagem ampliada anterior'}).click();
  await expect(page.locator('#dialog-caption')).toContainText('Gear Fifth');
  await page.getByRole('button',{name:'Fechar imagem'}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).toHaveURL(/#wallpaper$/);
});

test('galeria: link compartilhável direto e teclado, inclusive no celular',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('/#wallpaper/snakeman');
  await expect(page.getByRole('heading',{name:'Galeria dos mares'})).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#dialog-caption')).toContainText('Snakeman');
  await page.getByRole('dialog').press('ArrowRight');
  await expect(page.locator('#dialog-caption')).toContainText('Gear Fifth');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).toHaveURL(/#wallpaper$/);
});

test('galeria: controles respeitam o filtro selecionado',async({page})=>{
  await page.goto('/#wallpaper');
  await page.getByRole('button',{name:'Especiais'}).click();
  await page.getByRole('button',{name:/Nightmare Luffy/}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#dialog-position')).toHaveText('01 / 01');
  await page.getByRole('button',{name:'Próxima imagem ampliada'}).click();
  await expect(page.locator('#dialog-caption')).toContainText('Nightmare Luffy');
});

test('galeria: voltar no navegador fecha o modal sem perder a rota',async({page})=>{
  await page.goto('/#wallpaper');
  await page.getByRole('button',{name:/Gear Second em ação/}).click();
  await expect(page).toHaveURL(/#wallpaper\/gear2b$/);
  await page.goBack();
  await expect(page).toHaveURL(/#wallpaper$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.gallery-item')).toHaveCount(10);
});

test('galeria: nenhuma violação axe A/AA com modal aberto',async({page})=>{
  await page.goto('/#wallpaper/gear5');
  await expect(page.getByRole('dialog')).toBeVisible();
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});


for(const [width,height] of [[375,812],[1440,900]]){
  test('captura de modal navegável em '+width+'px',async({page},testInfo)=>{
    await page.setViewportSize({width,height});
    await page.goto('/#wallpaper/gear5');
    const modal=page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.locator('#dialog-image')).toHaveJSProperty('complete',true);
    const rects=await page.evaluate(()=>{
      const dialog=document.querySelector('#gallery-dialog').getBoundingClientRect();
      const controls=document.querySelector('.gallery-dialog-controls').getBoundingClientRect();
      const close=document.querySelector('#dialog-close').getBoundingClientRect();
      const image=document.querySelector('#dialog-image').getBoundingClientRect();
      return {dialog:{left:dialog.left,right:dialog.right,top:dialog.top,bottom:dialog.bottom},
        controls:{left:controls.left,right:controls.right,top:controls.top,bottom:controls.bottom},
        close:{left:close.left,right:close.right,top:close.top,bottom:close.bottom},
        imageWidth:image.width,
        screen:{width:innerWidth,height:innerHeight}};
    });
    expect(rects.dialog.left).toBeGreaterThanOrEqual(0);
    expect(rects.dialog.right).toBeLessThanOrEqual(width);
    expect(rects.controls.left).toBeGreaterThanOrEqual(0);
    expect(rects.controls.right).toBeLessThanOrEqual(width);
    expect(rects.controls.bottom).toBeLessThanOrEqual(height+1);
    expect(rects.imageWidth).toBeGreaterThan(80);
    await testInfo.attach('galeria-modal-'+width+'.png',{
      body:await page.screenshot({fullPage:false,animations:'disabled'}),
      contentType:'image/png'
    });
  });
}

test('links hash inválidos não quebram a navegação nem o carregamento',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const fragment of ['#%E0%A4%A','#wallpaper/%E0%A4%A','#rota-inexistente','#wallpaper/gear5/extra']){
    await page.goto('/'+fragment);
    await expect(page.getByRole('heading',{name:/O mundo é feito de aventuras/i})).toBeVisible();
    await expect(page).toHaveURL(/#home$/);
    // O render remove aria-busy ao concluir, em vez de manter o atributo com 'false'.
    await expect(page.locator('#app')).not.toHaveAttribute('aria-busy','true');
    await expect(page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link',{name:'Início'}))
      .toHaveAttribute('aria-current','page');
  }
  await page.goto('/#wallpaper/gear5');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#dialog-caption')).toContainText('Gear Fifth');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(errors).toEqual([]);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});


test('Home: vídeo Uma viagem pelos mares como fundo, sem áudio e com controle',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  // O teste verifica a integração sem depender de respostas do provedor externo.
  await page.route('https://player.vimeo.com/**',route=>route.fulfill({
    status:200,contentType:'text/html',body:'<!doctype html><html><body></body></html>'
  }));
  await page.goto('/#home');
  const video=page.locator('#hero-video-bg iframe');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('src',/927337615\?background=1.*muted=1/);
  await expect(video).toHaveAttribute('tabindex','-1');
  await expect(video).toHaveAttribute('aria-hidden','true');
  await expect(page.getByRole('heading',{name:/O mundo é feito de aventuras/i})).toBeVisible();
  const toggle=page.getByRole('button',{name:'Desativar vídeo de fundo'});
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  await toggle.click();
  await expect(video).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Ativar vídeo de fundo'})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Ativar vídeo de fundo'}).click();
  await expect(video).toHaveCount(1);
  await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link',{name:'História'}).click();
  await expect(page.locator('#hero-video-bg')).toHaveCount(0);
});

test('Home: preferência por movimento reduzido desliga o fundo de vídeo',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('https://player.vimeo.com/**',route=>route.fulfill({
    status:200,contentType:'text/html',body:'<!doctype html><html></html>'
  }));
  await page.goto('/#home');
  await expect(page.locator('#hero-video-bg iframe')).toHaveCount(0);
  await expect(page.locator('.hero-image.is-active')).toBeVisible();
  await page.getByRole('button',{name:'Ativar vídeo de fundo'}).click();
  await expect(page.locator('#hero-video-bg iframe')).toHaveCount(1);
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});
  // Alterar a preferência em tempo real deve desativar o vídeo.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('#hero-video-bg iframe')).toHaveCount(0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
