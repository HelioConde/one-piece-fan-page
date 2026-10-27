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
