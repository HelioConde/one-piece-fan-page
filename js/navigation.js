const pages = {
  home:{title:'Início'},story:{title:'História'},characters:{title:'Transformações'},
  wallpaper:{title:'Galeria'},trailer:{title:'Trailers'}
};
export function setupNavigation(onPageReady) {
  const app = document.querySelector('#app');
  const links = [...document.querySelectorAll('[data-nav]')];
  const menu = document.querySelector('#primary-nav');
  const toggle = document.querySelector('#menu-toggle');
  let activeRequest = null;
  let viewCleanup = () => {};
  let requestNumber = 0;
  const closeMenu = () => {
    menu.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Abrir menu');
  };
  toggle.addEventListener('click', () => {
    const open = menu.getAttribute('data-open') !== 'true';
    if (open) menu.setAttribute('data-open','true'); else closeMenu();
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header-inner')) closeMenu();
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  async function render() {
    // Um fragmento percent-encoded inválido pode vir de links externos.
    // Nunca interromper a navegação nem manter a tela de carregamento.
    let raw = '';
    try { raw = decodeURIComponent(location.hash.slice(1)); }
    catch { raw = ''; }
    const [requestedPage, artworkId, ...extra] = raw.split('/');
    // Uma arte da galeria pode ser compartilhada como #wallpaper/gear5.
    const valid=Object.hasOwn(pages,requestedPage) &&
      ((requestedPage==='wallpaper' && extra.length===0) ||
       (requestedPage!=='wallpaper' && !artworkId && extra.length===0));
    const page=valid?requestedPage:'home';
    if(!valid)history.replaceState(null,'',location.pathname+location.search+'#home');
    const id = ++requestNumber;
    if (activeRequest) activeRequest.abort();
    viewCleanup();
    viewCleanup = () => {};
    activeRequest = new AbortController();
    links.forEach(link => {
      if (link.dataset.nav === page) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.title = 'One Piece | ' + pages[page].title;
    app.setAttribute('aria-busy','true');
    app.innerHTML = '<div class="loading-screen" role="status">Carregando sua próxima aventura…</div>';
    try {
      const response = await fetch('./view/' + page + '.html', {signal:activeRequest.signal});
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const markup = await response.text();
      if (id !== requestNumber) return;
      app.innerHTML = markup;
      viewCleanup = onPageReady(page) || (()=>{});
    } catch (error) {
      if (error.name === 'AbortError' || id !== requestNumber) return;
      app.innerHTML = '<div class="error-panel"><h1 style="font-size:2rem">Não foi possível carregar a página.</h1><p>Confira sua conexão ou tente novamente.</p><button type="button" class="button button-primary" id="retry">Tentar novamente</button></div>';
      app.querySelector('#retry').addEventListener('click',render,{once:true});
      console.error('Falha de navegação:',error);
    } finally {
      if (id === requestNumber) {
        app.removeAttribute('aria-busy');
        window.scrollTo({top:0,behavior:'instant'});
        if (document.readyState === 'complete' && document.activeElement !== document.body) app.focus({preventScroll:true});
      }
    }
  }
  window.addEventListener('hashchange',render);
  render();
  return () => { window.removeEventListener('hashchange',render); viewCleanup(); if(activeRequest)activeRequest.abort(); };
}
