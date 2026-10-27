import {test,expect} from '@playwright/test';

for(const width of [320,375,768,1024,1440,1920]){
  test('regressão geométrica do hero e header em '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/#home');
    await expect(page.locator('#hero-title')).toBeVisible();
    const title=await page.locator('.hero-copy').boundingBox();
    const illustration=await page.locator('.hero-figure').boundingBox();
    expect(title).not.toBeNull();expect(illustration).not.toBeNull();
    if(width<=760) {
      expect(illustration.y).toBeGreaterThanOrEqual(title.y+title.height-1);
      await expect(page.locator('#menu-toggle')).toBeVisible();
    } else {
      expect(illustration.x).toBeGreaterThanOrEqual(title.x+title.width-1);
      await expect(page.locator('#primary-nav')).toBeVisible();
    }
    const documentSize=await page.evaluate(()=>({
      width:document.documentElement.scrollWidth,
      viewport:document.documentElement.clientWidth
    }));
    expect(documentSize.width).toBeLessThanOrEqual(documentSize.viewport+1);
  });
}

test('galeria: todas as imagens locais são carregáveis',async({page})=>{
  await page.goto('/#wallpaper');
  await expect(page.locator('.gallery-item')).toHaveCount(10);
  const broken=await page.locator('.gallery-item img').evaluateAll(async imgs=>{
    for(const image of imgs)image.loading='eager';
    await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));
    return imgs.filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.getAttribute('src'));
  });
  expect(broken).toEqual([]);
});


// Captura enviada: 1366x768 inclui chrome do navegador; viewport útil ~1366x647.
for(const [width,height] of [[1366,647],[1440,720],[1600,810],[1024,768]]){
  test('capa visível sem rolagem '+width+'x'+height,async({page},testInfo)=>{
    await page.setViewportSize({width,height});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/#home');
    const cta=page.getByRole('link',{name:/Conhecer a história/});
    const trailer=page.getByRole('link',{name:/Ver trailers/});
    await expect(cta).toBeVisible();
    await expect(trailer).toBeVisible();
    const metrics=await page.evaluate(()=>{
      const actions=[...document.querySelectorAll('.hero-copy .actions a')].map(item=>{
        const box=item.getBoundingClientRect();
        return {name:item.textContent.trim(),bottom:box.bottom,left:box.left,right:box.right};
      });
      const caption=document.querySelector('.hero-caption').getBoundingClientRect();
      return {viewport:innerHeight,actions,captionBottom:caption.bottom};
    });
    await testInfo.attach('dobra-'+width+'x'+height+'.json',{body:Buffer.from(JSON.stringify(metrics,null,2)),contentType:'application/json'});
    for(const action of metrics.actions)expect(action.bottom,'CTA '+action.name+' deve caber na primeira tela').toBeLessThanOrEqual(height-8);
    expect(metrics.captionBottom,'Controles do hero devem caber na tela').toBeLessThanOrEqual(height-4);
    await testInfo.attach('primeira-dobra-'+width+'x'+height+'.png',{body:await page.screenshot({fullPage:false,animations:'disabled'}),contentType:'image/png'});
  });
}

test('capítulo selecionado não fica coberto pelo cabeçalho',async({page})=>{
  await page.setViewportSize({width:1366,height:647});
  await page.goto('/#story');
  await page.getByRole('navigation',{name:'Capítulos da história'}).getByRole('link',{name:'O primeiro passo'}).click();
  const distance=await page.evaluate(()=>{
    const chapter=document.querySelector('#chapter-sea').getBoundingClientRect();
    const header=document.querySelector('.site-header').getBoundingClientRect();
    return chapter.top-header.bottom;
  });
  expect(distance).toBeGreaterThanOrEqual(0);
});
