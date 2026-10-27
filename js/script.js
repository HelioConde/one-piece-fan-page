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
      const button=element('button',{type:'button','aria-label':'Ampliar '+art.title});
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
  if(page==='home')return setupCarousel();
  if(page==='story')return setupStory();
  if(page==='wallpaper')return setupGallery();
  if(page==='characters')return setupCharacters();
  if(page==='trailer')return setupVideos();
  return ()=>{};
});
