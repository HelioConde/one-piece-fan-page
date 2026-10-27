import {test,expect} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';

const routes=[
  ['home','Home'],['story','História'],['characters','Transformações'],
  ['wallpaper','Galeria'],['trailer','Trailers']
];
const widths=[320,375,768,1024,1440,1920];

// Diagnóstico real: 30 combinações (5 páginas x 6 resoluções).
for(const [route,label] of routes){
  for(const width of widths){
    test('captura completa '+label+' / '+width+'px',async({page},testInfo)=>{
      const height=width<=375?812:900;
      await page.setViewportSize({width,height});
      await page.emulateMedia({reducedMotion:'reduce'});
      const javascriptErrors=[],consoleErrors=[],networkErrors=[];
      page.on('pageerror',error=>javascriptErrors.push(error.stack||error.message));
      page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
      const isLocal=url=>{
        try{return new URL(url).origin==='http://127.0.0.1:4173';}
        catch{return false;}
      };
      page.on('requestfailed',request=>{
        if(isLocal(request.url()))networkErrors.push('Falha: '+request.url()+' — '+(request.failure()?.errorText||'sem detalhe'));
      });
      page.on('response',response=>{
        if(isLocal(response.url())&&response.status()>=400)
          networkErrors.push('HTTP '+response.status()+': '+response.url());
      });

      await page.goto('/#'+route);
      await expect(page.locator('main h1')).toBeVisible();
      await page.evaluate(async()=>{
        const images=[...document.images].filter(img=>img.getAttribute('src'));
        images.forEach(img=>{img.loading='eager';});
        await Promise.all(images.map(img=>img.decode().catch(()=>null)));
        document.querySelector('#hero-pause')?.click();
        document.querySelector('#slide-pause')?.click();
      });
      const diagnostics=await page.evaluate(()=>{
        const visible=element=>{
          const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
          return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0;
        };
        const rounded=n=>Math.round(n*10)/10;
        const width=document.documentElement.clientWidth;
        const overflow=Math.max(0,document.documentElement.scrollWidth-width);
        const brokenImages=[...document.images]
          .filter(img=>img.getAttribute('src')&&visible(img)&&(!img.complete||img.naturalWidth===0))
          .map(img=>({src:img.getAttribute('src'),alt:img.alt}));
        const clippedElements=[...document.querySelectorAll('main h1,main h2,main h3,main .button,main .card,main .gallery-item,main .video-card')]
          .filter(visible).flatMap(element=>{
            const rect=element.getBoundingClientRect();
            return (rect.left < -2 || rect.right > width+2)
              ?[{tag:element.tagName,className:element.className,text:element.textContent?.trim().slice(0,60),x:rounded(rect.left),right:rounded(rect.right)}]:[];
          });
        const overlappedCards=[];
        for(const grid of document.querySelectorAll('.cards,.gallery-grid,.video-grid,.feature-band')){
          const children=[...grid.children].filter(visible);
          for(let i=0;i<children.length;i++){
            const a=children[i].getBoundingClientRect();
            for(let j=i+1;j<children.length;j++){
              const b=children[j].getBoundingClientRect();
              const dx=Math.min(a.right,b.right)-Math.max(a.left,b.left);
              const dy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
              if(dx>2&&dy>2)overlappedCards.push({grid:grid.className,items:[i,j],overlap:[rounded(dx),rounded(dy)]});
            }
          }
        }
        const hero=document.querySelector('[data-hero-slider]');
        return {overflowPixels:overflow,brokenImages,clippedElements,overlappedCards,
          heroImageVisible:hero?Boolean(hero.querySelector('.hero-image.is-active')?.getBoundingClientRect().width):null,
          scrollHeight:document.documentElement.scrollHeight};
      });
      const screenshot=testInfo.outputPath('pagina-inteira.jpg');
      await page.screenshot({path:screenshot,type:'jpeg',quality:77,fullPage:true,animations:'disabled'});
      await testInfo.attach('captura-'+route+'-'+width+'.jpg',{path:screenshot,contentType:'image/jpeg'});
      const result={page:label,route,viewport:{width,height},url:page.url(),...diagnostics,
        javascriptErrors,consoleErrors,networkErrors,capturedAt:new Date().toISOString()};
      const reportPath=testInfo.outputPath('auditoria.json');
      await mkdir(dirname(reportPath),{recursive:true});
      await writeFile(reportPath,JSON.stringify(result,null,2));
      await testInfo.attach('auditoria-'+route+'-'+width+'.json',{path:reportPath,contentType:'application/json'});
      expect.soft(javascriptErrors,'Erros JavaScript de '+label+'/'+width).toEqual([]);
      expect.soft(consoleErrors,'Erros de console de '+label+'/'+width).toEqual([]);
      expect.soft(networkErrors,'Falhas de rede local de '+label+'/'+width).toEqual([]);
      expect.soft(diagnostics.brokenImages,'Imagens ausentes de '+label+'/'+width).toEqual([]);
      expect.soft(diagnostics.clippedElements,'Componentes recortados de '+label+'/'+width).toEqual([]);
      expect.soft(diagnostics.overlappedCards,'Cards sobrepostos de '+label+'/'+width).toEqual([]);
      expect.soft(diagnostics.overflowPixels,'Overflow horizontal de '+label+'/'+width).toBeLessThanOrEqual(1);
      if(route==='home')expect.soft(diagnostics.heroImageVisible,'Capa deve continuar visível').toBe(true);
    });
  }
}
