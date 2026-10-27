import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
createServer(async (request,response)=>{
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    const relative=decodeURIComponent(url.pathname);
    const pathname=resolve(root,'.' + relative);
    if(pathname!==root && !pathname.startsWith(root+sep)){response.writeHead(403);response.end('Acesso negado');return;}
    const target=(await stat(pathname)).isDirectory()?resolve(pathname,'index.html'):pathname;
    const body=await readFile(target);
    response.writeHead(200,{'Content-Type':mime[extname(target)] || 'application/octet-stream','X-Content-Type-Options':'nosniff'});
    response.end(request.method==='HEAD'?undefined:body);
  } catch {
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    response.end('Arquivo não encontrado');
  }
}).listen(port,'127.0.0.1',()=>console.log('Site local em http://127.0.0.1:'+port));
