import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,basename} from 'node:path';
const root='test-results',output='qa-report',entries=[];
async function walk(dir){
  for(const item of await readdir(dir,{withFileTypes:true}).catch(()=>[])){
    const file=join(dir,item.name);
    if(item.isDirectory())await walk(file);
    else if(item.isFile()&&basename(file)==='auditoria.json'){
      try{entries.push(JSON.parse(await readFile(file,'utf8')));}
      catch(e){console.warn('Diagnóstico inválido:',file,e.message);}
    }
  }
}
await walk(root);
entries.sort((a,b)=>a.route.localeCompare(b.route)||a.viewport.width-b.viewport.width);
const failures=entries.filter(e=>e.javascriptErrors.length||e.consoleErrors.length||e.networkErrors.length||
  e.brokenImages.length||e.clippedElements.length||e.overlappedCards.length||e.overflowPixels>1);
const result={total:entries.length,passed:entries.length-failures.length,failed:failures.length,errors:failures,entries};
await mkdir(output,{recursive:true});
await writeFile(join(output,'summary.json'),JSON.stringify(result,null,2));
const lines=[
  '# Auditoria visual automatizada — One Piece Fan Page','',
  'Cenários: '+entries.length+' / 30 · Aprovados: '+result.passed+' · Com problemas: '+result.failed,'',
  '| Página | Largura | JS | Console | Rede | Imagens | Clipping | Sobreposição | Overflow |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...entries.map(e=>['| '+e.page,e.viewport.width+'px',e.javascriptErrors.length,e.consoleErrors.length,
    e.networkErrors.length,e.brokenImages.length,e.clippedElements.length,e.overlappedCards.length,
    e.overflowPixels+'px |'].join(' | ')),
  '',
  'Capturas JPG e diagnósticos JSON ficam em test-results. Um teste geométrico não substitui revisão visual humana.'
];
await writeFile(join(output,'summary.md'),lines.join('\n')+'\n');
console.log('Relatório consolidado:',result.passed+'/'+result.total+' cenários aprovados.');
if(entries.length!==30||failures.length)process.exitCode=1;
