document.addEventListener('DOMContentLoaded',()=>{
  const page=document.querySelector('.page');
  if(!page||page.querySelector('.site-header'))return;
  page.querySelector('.nav')?.remove();
  const header=document.createElement('header');
  header.className='site-header';
  const base=location.pathname.includes('/que-analizamos/')?'../':'../';
  header.innerHTML='<a class="site-brand" href="'+base+'" aria-label="CocheCierto, inicio"><img src="'+base+'brand-symbol.svg" alt=""><span>Coche<strong>Cierto</strong></span></a><nav class="site-nav" aria-label="Navegación principal"><a href="'+base+'como-funciona/">Cómo funciona</a><a href="'+base+'que-analizamos/">Qué analizamos</a><a href="'+base+'demo/">Informe de ejemplo</a><a href="'+base+'metodologia/">Metodología</a></nav><a class="site-cta" href="'+base+'valorador/">Empezar diagnóstico</a><button class="site-menu-toggle" type="button" aria-expanded="false" aria-label="Abrir menú">☰</button>';
  page.prepend(header);
  const style=document.createElement('style');
  style.textContent='.site-header{display:flex;align-items:center;gap:24px;padding:0 0 8px}.site-brand{display:flex;align-items:center;gap:9px;color:#f7f8f5;text-decoration:none;font-size:21px;font-weight:700;letter-spacing:-.04em}.site-brand img{width:38px;height:38px}.site-brand strong{color:#fc4c02}.site-nav{display:flex;gap:24px;margin-left:auto}.site-nav a{color:#b8cbd2;text-decoration:none;font-size:13px}.site-nav a:hover,.site-nav a:focus-visible{color:#fff}.site-cta{background:#fc4c02;color:#071521!important;text-decoration:none;padding:12px 16px;border-radius:9px;font-size:13px;font-weight:700;white-space:nowrap}.site-menu-toggle{display:none;border:1px solid #2b647d;background:transparent;color:#f7f8f5;border-radius:9px;padding:8px 10px;font-size:20px}@media(max-width:820px){.site-nav{display:none;position:absolute;top:76px;right:22px;z-index:4;flex-direction:column;gap:0;padding:10px;background:#073b57;border:1px solid #2b647d;border-radius:14px}.site-nav.is-open{display:flex}.site-nav a{padding:11px 13px}.site-menu-toggle{display:block}.site-cta{margin-left:auto}.site-header{position:relative}}@media(max-width:520px){.site-cta{font-size:11px;padding:10px 11px}.site-brand{font-size:18px}.site-brand img{width:32px;height:32px}}';
  document.head.append(style);
  const toggle=header.querySelector('.site-menu-toggle');
  toggle.addEventListener('click',()=>{const open=header.querySelector('.site-nav').classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open))});
});
