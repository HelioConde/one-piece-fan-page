import { artworks, imagePath } from './data.js';
import { setupNavigation } from './navigation.js';

const dialog = document.querySelector('#gallery-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogCaption = document.querySelector('#dialog-caption');
document.querySelector('#dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

const element = (tag,attrs={},text='') => {
  const node=document.createElement(tag);
  Object.entries(attrs).forEach(([key,value]) => node.setAttribute(key,String(value)));
  if(text)node.textContent=text;
  return node;
};

/**
 * Capa rotativa inspirada na primeira versão da fan page.
 * Alterna as dez artes originais, com transição suave e sem ocultar no mobile.
 */
function setupHeroSlider(){
  const slider=document.querySelector('[data-hero-slider]');
  if(!slider)return ()=>{};
  const images=[...slider.querySelectorAll('[data-hero-image]')];
  const label=slider.querySelector('#hero-art-title');
  const counter=slider.querySelector('#hero-art-count');
  const pause=slider.querySelector('#hero-pause');
  const slides=artworks;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index=0,active=0,paused=reduced,focused=false,hovered=false,visible=true,timer=null,disposed=false;
  let request=0,startX=null;
  const clear=()=>{if(timer!==null){clearInterval(timer);timer=null;}};
  const schedule=()=>{
    clear();
    if(!disposed&&!paused&&!focused&&!hovered&&visible&&!document.hidden){
      timer=setInterval(()=>show(index+1),4400);
    }
  };
  function show(next){
    const target=(next+slides.length)%slides.length;
    if(target===index)return;
    const sequence=++request;
    const art=slides[target];
    const source=imagePath(art);
    const preload=new Image();
    preload.onload=()=>{
      if(disposed||sequence!==request)return;
      const incoming=images[1-active],outgoing=images[active];
      incoming.src=source;
      incoming.alt='Ilustração de '+art.title;
      incoming.setAttribute('aria-hidden','false');
      outgoing.setAttribute('aria-hidden','true');
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
      active=1-active;index=target;
      slider.dataset.heroIndex=String(index);
      label.textContent=art.title.toUpperCase()+' · LUFFY';
      counter.textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
      counter.setAttribute('aria-label','Imagem '+(index+1)+' de '+slides.length);
    };
    preload.onerror=()=>{if(!disposed&&sequence===request)console.warn('Arte da capa indisponível:',source);};
    preload.src=source;
  }
  function toggle(){
    paused=!paused;
    pause.setAttribute('aria-pressed',String(paused));
    pause.setAttribute('aria-label',paused?'Retomar troca automática de imagens':'Pausar troca automática de imagens');
    pause.title=paused?'Retomar imagens':'Pausar imagens';
    pause.textContent=paused?'▶':'Ⅱ';
    schedule();
  }
  if(paused){
    pause.setAttribute('aria-pressed','true');
    pause.setAttribute('aria-label','Retomar troca automática de imagens');
    pause.title='Retomar imagens';
    pause.textContent='▶';
  }
  slider.querySelector('#hero-prev').addEventListener('click',()=>show(index-1));
  slider.querySelector('#hero-next').addEventListener('click',()=>show(index+1));
  pause.addEventListener('click',toggle);
  slider.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
      event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1));
    }
  });
  slider.addEventListener('pointerdown',event=>{startX=event.clientX;});
  slider.addEventListener('pointerup',event=>{
    if(startX!==null&&Math.abs(event.clientX-startX)>60)show(index+(event.clientX<startX?1:-1));
    startX=null;
  });
  slider.addEventListener('mouseenter',()=>{hovered=true;schedule();});
  slider.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  slider.addEventListener('focusin',()=>{focused=true;schedule();});
  slider.addEventListener('focusout',event=>{
    if(!slider.contains(event.relatedTarget)){focused=false;schedule();}
  });
  const onVisibility=()=>schedule();
  document.addEventListener('visibilitychange',onVisibility);
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;schedule();
  },{threshold:.1}):null;
  observer?.observe(slider);
  // Evita tela vazia ao selecionar a próxima arte.
  for(const art of slides.slice(1,3)){const preload=new Image();preload.src=imagePath(art);}
  schedule();
  return ()=>{
    disposed=true;request++;clear();observer?.disconnect();
    document.removeEventListener('visibilitychange',onVisibility);
  };
}

function setupCarousel() {
  const carousel=document.querySelector('[data-carousel]');
  if(!carousel)return () => {};
  const slides=['base','gear2','gear3','gear4','snakeman','gear5','nightmare'].map(id=>artworks.find(a=>a.id===id));
  const image=carousel.querySelector('#slide-image');
  const title=carousel.querySelector('#slide-title');
  const description=carousel.querySelector('#slide-description');
  const counter=carousel.querySelector('#slide-count');
  const dots=carousel.querySelector('#slide-dots');
  const pauseButton=carousel.querySelector('#slide-pause');
  let index=0,paused=false,focused=false,hovered=false,visible=true,timer=null,startX=null;
  const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  slides.forEach((slide,i)=>{
    const dot=element('button',{type:'button','aria-label':'Exibir transformação '+(i+1)+': '+slide.title});
    dot.addEventListener('click',()=>show(i));
    dots.append(dot);
  });
  function show(next){
    index=(next+slides.length)%slides.length;
    const selected=slides[index];
    image.src=imagePath(selected);image.alt='Arte de '+selected.title;
    title.textContent=selected.title;description.textContent=selected.description;
    counter.textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
    [...dots.children].forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
  }
  function syncTimer(){
    if(timer){clearInterval(timer);timer=null;}
    if(!paused && !motionReduced && visible && !focused && !hovered && !document.hidden){
      timer=setInterval(()=>show(index+1),6500);
    }
  }
  const onVisibility=()=>syncTimer();
  const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncTimer();},{threshold:.15}) : null;
  if(observer) observer.observe(carousel);
  carousel.querySelector('#slide-prev').addEventListener('click',()=>show(index-1));
  carousel.querySelector('#slide-next').addEventListener('click',()=>show(index+1));
  pauseButton.addEventListener('click',()=>{
    paused=!paused;
    pauseButton.setAttribute('aria-pressed',String(paused));
    pauseButton.setAttribute('aria-label',paused?'Retomar reprodução automática':'Pausar reprodução automática');
    pauseButton.textContent=paused?'▶':'Ⅱ';
    syncTimer();
  });
  carousel.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1));
    }
  });
  carousel.addEventListener('pointerdown',event=>{startX=event.clientX;});
  carousel.addEventListener('pointerup',event=>{
    if(startX!==null && Math.abs(event.clientX-startX)>55)show(index+(event.clientX<startX?1:-1));
    startX=null;
  });
  carousel.addEventListener('mouseenter',()=>{hovered=true;syncTimer();});
  carousel.addEventListener('mouseleave',()=>{hovered=false;syncTimer();});
  carousel.addEventListener('focusin',()=>{focused=true;syncTimer();});
  carousel.addEventListener('focusout',event=>{if(!carousel.contains(event.relatedTarget)){focused=false;syncTimer();}});
  document.addEventListener('visibilitychange',onVisibility);
  show(0);syncTimer();
  return ()=>{if(timer)clearInterval(timer);observer?.disconnect();document.removeEventListener('visibilitychange',onVisibility);};
}

function setupCharacters(){
  const grid=document.querySelector('#character-grid');
  if(!grid)return ()=>{};
  const selected=artworks.filter(a=>!['gear2b','gear3b'].includes(a.id));
  for(const art of selected){
    const article=element('article',{class:'card'});
    const cover=element('div',{class:'card-cover'});
    cover.append(element('img',{src:imagePath(art),alt:'Ilustração de '+art.title,loading:'lazy',decoding:'async'}));
    const body=element('div',{class:'card-body'});
    body.append(element('h3',{},art.title),element('p',{},art.description));
    const link=element('a',{class:'text-link',href:'#wallpaper'},'Ver galeria ↗');
    body.append(link);article.append(cover,body);grid.append(article);
  }
  return ()=>{};
}

function setupGallery(){
  const grid=document.querySelector('#gallery-grid');
  if(!grid)return ()=>{};
  const count=document.querySelector('#gallery-count');
  const buttons=[...document.querySelectorAll('[data-filter]')];
  let filter='all';
  function render(){
    grid.replaceChildren();
    const selected=artworks.filter(art=>filter==='all'||art.category===filter);
    count.textContent=selected.length+' artes disponíveis';
    selected.forEach(art=>{
      const card=element('article',{class:'gallery-item'});
      const button=element('button',{type:'button'});
      const picture=element('div',{class:'gallery-picture'});
      picture.append(element('img',{src:imagePath(art),alt:'Arte de '+art.title,loading:'lazy',decoding:'async'}));
      const info=element('span',{class:'gallery-info'});
      info.append(element('strong',{},art.title),element('small',{},'Ampliar ↗'));
      button.append(picture,info);
      button.addEventListener('click',()=>{
        dialogImage.src=imagePath(art);dialogImage.alt='Arte ampliada de '+art.title;
        dialogCaption.textContent=art.title+' — imagem do acervo original do projeto';
        dialog.showModal();
      });
      card.append(button);grid.append(card);
    });
  }
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    filter=btn.dataset.filter;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    render();
  }));
  render();
  return ()=>{if(dialog.open)dialog.close();};
}

function setupStory(){
  const links=[...document.querySelectorAll('[data-scroll-target]')];
  links.forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();
    const section=document.getElementById(link.dataset.scrollTarget);
    if(section){section.setAttribute('tabindex','-1');section.scrollIntoView({behavior:'auto',block:'start'});section.focus({preventScroll:true});}
  }));
  return ()=>{};
}

function setupVideos(){
  const buttons=[...document.querySelectorAll('[data-play-video]')];
  const providers={
    youtube:{src:'https://www.youtube-nocookie.com/embed/MCb13lbVGE0?rel=0',title:'Vídeo de One Piece no YouTube'},
    vimeo:{src:'https://player.vimeo.com/video/927337615?dnt=1',title:'Vídeo de One Piece no Vimeo'}
  };
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const provider=providers[button.dataset.playVideo];if(!provider)return;
    const poster=button.closest('.video-poster');
    const frame=element('iframe',{src:provider.src,title:provider.title,loading:'lazy',allow:'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen',allowfullscreen:'',referrerpolicy:'strict-origin-when-cross-origin'});
    poster.replaceWith(frame);
  },{once:true}));
  return ()=>{};
}
setupNavigation(page=>{
  if(page==='home'){
    const stopHero=setupHeroSlider();
    const stopCarousel=setupCarousel();
    return ()=>{stopHero();stopCarousel();};
  }
  if(page==='story')return setupStory();
  if(page==='wallpaper')return setupGallery();
  if(page==='characters')return setupCharacters();
  if(page==='trailer')return setupVideos();
  return ()=>{};
});
