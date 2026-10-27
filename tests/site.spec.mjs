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
