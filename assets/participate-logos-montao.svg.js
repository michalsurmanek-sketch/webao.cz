import {BASE,KEY,ANON,request,escapeHTML as e,money} from './webao-api.js';
const dialog=document.createElement('dialog');dialog.className='participate-dialog';dialog.setAttribute('aria-label','Podpořit projekt WEBAO');document.body.append(dialog);
let lastTrigger,projects;
async function openProject(slug,trigger){
 lastTrigger=trigger;dialog.innerHTML='<button class="dialog-close" aria-label="Zavřít">×</button><p role="status">Načítám projekt…</p>';dialog.showModal();
 try{
  projects=await request('/rest/v1/webao_projects?select=*&is_active=eq.true&order=sort_order');
  const p=projects.find(p=>p.slug===slug);if(!p)throw new Error('Projekt zatím nemá otevřenou možnost spolupráce.');
  dialog.innerHTML=`<button class="dialog-close" aria-label="Zavřít">×</button><p class="eyebrow">Staňte se součástí příběhu</p><h2>${e(p.name)}<span> může růst i s vámi.</span></h2><p class="participate-intro">${e(p.summary)}</p><div class="project-intent"><div><small>Kam projekt směřuje</small><p>${e(p.thesis||'Podrobnosti s vámi rádi probereme osobně.')}</p></div><div><small>Oblasti dalšího rozvoje</small><p>${e(p.use_of_funds||'Konkrétní rozsah dohodneme individuálně.')}</p></div></div><div class="project-state"><span>${e(p.stage)}</span>${p.funding_goal?`<span>Plán rozvoje: ${money(p.funding_goal)}</span>`:''}</div>${p.open_to_interest?`<form id="participate-form"><h3>Pojďme probrat možnosti</h3><p>Nezávazně nám napište, jak se chcete zapojit. Ozveme se s dalšími informacemi.</p><div class="interest-fields"><label>Jméno a příjmení *<input name="name" required minlength="2" maxlength="120" autocomplete="name"></label><label>E-mail *<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Telefon<input name="phone" type="tel" maxlength="40" autocomplete="tel"></label><label>Firma<input name="company" maxlength="160" autocomplete="organization"></label><label>Jak se chcete zapojit? *<select name="interest_type"><option value="investment">Jednat o investici</option><option value="partnership">Obchodní partnerství</option><option value="expertise">Zkušenosti a odborná spolupráce</option></select></label><label>Orientační částka v Kč (nepovinné)<input name="amount" type="number" min="1" max="1000000000" step="1" inputmode="numeric" placeholder="Nechávám otevřené"></label><label class="full-field">Co máte na mysli?<textarea name="message" maxlength="3000" rows="3" placeholder="Co vás na projektu zaujalo? Jakou spolupráci si představujete?"></textarea></label></div><label class="interest-honeypot" aria-hidden="true">Web<input name="website" tabindex="-1" autocomplete="off"></label><label class="privacy-check"><input name="privacy" type="checkbox" required> <span>Seznámil/a jsem se s <a href="/spoluprace-soukromi.html" target="_blank" rel="noopener">informacemi o zpracování osobních údajů</a>.</span></label><p class="interest-status" role="status" aria-live="polite"></p><button class="button" type="submit">Chci probrat spolupráci <b>→</b></button><small class="interest-note">Odeslání není závazkem investovat. Částka je orientační. Konkrétní podmínky, způsob financování a související rizika se řeší individuálně před případnou smlouvou.</small></form>`:'<p class="closed-interest">Tento projekt nyní nepřijímá nové zájemce. Napište nám na <a href="mailto:studio@webao.cz">studio@webao.cz</a>.</p>'}`;
  dialog.scrollTop=0;
  const form=dialog.querySelector('form');if(form)form.addEventListener('submit',async ev=>{
   ev.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type="submit"]'),status=form.querySelector('.interest-status');button.disabled=true;status.textContent='Odesílám…';
   try{const fields=Object.fromEntries(new FormData(form));const r=await fetch(BASE+'/functions/v1/webao-interest',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+ANON,'Content-Type':'application/json'},body:JSON.stringify({...fields,privacy:form.elements.privacy.checked,project:slug})});const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||'Odeslání se nepodařilo.');form.innerHTML='<div class="interest-success"><span>✓</span><h3>Děkujeme za váš zájem.</h3><p>Zpráva je bezpečně uložená u projektu '+e(p.name)+'. Ozveme se na uvedený e-mail a probereme další možnosti.</p><button class="button finish-interest" type="button">Zavřít</button></div>';}
   catch(err){status.textContent=err.message;button.disabled=false;}
  });
 }catch(err){dialog.innerHTML='<button class="dialog-close" aria-label="Zavřít">×</button><h2>Ještě chvíli.</h2><p>'+e(err.message)+'</p><a class="button" href="mailto:studio@webao.cz">Napsat e-mail</a>';}
}
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-support]');if(button)openProject(button.dataset.support,button);});
dialog.addEventListener('click',ev=>{if(ev.target===dialog||ev.target.closest('.dialog-close,.finish-interest'))dialog.close();});
dialog.addEventListener('close',()=>lastTrigger?.focus());


const cardGrid=document.querySelector('.cards');
const networkLinks=Array.from(document.querySelectorAll('.network a[href]'));
let lastProjectSignature='',syncing=false;
const domainFor=p=>p.slug==='kurzy'?'kurzy.pro':p.slug+'.cz';
function renderPublicProjects(rows){
 const signature=JSON.stringify(rows);if(signature===lastProjectSignature)return;lastProjectSignature=signature;
 const list=document.getElementById('all-projects');if(list)list.replaceChildren();
 if(cardGrid)cardGrid.replaceChildren();
 for(const p of rows){
  const domain=domainFor(p),url='https://'+domain+'/';
  const card=document.createElement('article');card.className='project-card website-card';card.dataset.project=p.slug;card.setAttribute('aria-label',p.name);
  const hasPreview=new Set(['plotao','gurmao','slevao','betonao','montao','renovao','vibrao','poptejplot','poptejcenu','vydrhnu','reklamas','adresao','chatao','herbao','casinao','farmao','webao']).has(p.slug);
  const accent=p.slug==='gurmao'?'gold':'green';
  card.dataset.accent=accent;
  const shortName=e(p.name||domain.replace('.cz','').toUpperCase());
  const description=e(p.summary||'Projekt sítě WEBAO');
  const verifiedSvgLogos={plotao:'/assets/brand-logos/plotao.svg',betonao:'/assets/brand-logos/betonao.svg',renovao:'/assets/brand-logos/renovao.svg',slevao:'/assets/brand-logos/slevao.svg?v=dark',gurmao:'/assets/brand-logos/gurmao.svg',vibrao:'/assets/brand-logos/vibrao.png'};
  const brandSvg=verifiedSvgLogos[p.slug]||'';
  const brandLogoClass=['vibrao'].includes(p.slug)?' project-light-logo':'';
  card.innerHTML='<div class="project-card-heading"><div class="project-identity">'+(brandSvg?'<img class="project-full-svg'+brandLogoClass+'" src="'+e(brandSvg)+'" alt="'+shortName+'" loading="lazy" decoding="async">':'<span class="project-name-label">'+shortName+'</span>')+'<div class="project-identity-text"><span>'+description+'</span></div></div><span class="tag">'+e(p.category)+'</span></div><div class="website-preview">'+(hasPreview?'<img src="/assets/previews/'+e(p.slug)+'.webp" alt="Náhled úvodní stránky '+e(domain)+'" loading="lazy" decoding="async" width="1100" height="756">':'<span class="preview-pending">'+e(domain)+' · Náhled připravujeme</span>')+'</div><div class="project-quick-info"><span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18M12 3c-5 5-5 13 0 18"/></svg><span><small>Web projektu</small><strong>'+e(domain)+'</strong></span></span><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 22h8M12 19v3"/></svg><span><small>Oblast</small><strong>'+e(p.category)+'</strong></span></span></div><div class="project-actions"><a class="button" href="'+e(url)+'" target="_blank" rel="noopener" aria-label="Navštívit '+e(domain)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-10 10M19 14v5H5V5h5"/></svg>Navštívit web ↗</a>'+(p.open_to_interest?'<button class="button support-button" data-support="'+e(p.slug)+'" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>Podpořit projekt</button>':'')+'</div>';
  if(p.slug==='montao'){const label=card.querySelector('.project-name-label');if(label)label.outerHTML='<span class="project-montao-brand"><img src="/assets/brand-logos/montao.svg" alt="" aria-hidden="true"><strong>Montao.cz</strong></span>';}
  cardGrid?.append(card);
  if(list){const item=document.createElement('div');item.className='project-mini';item.innerHTML='<a href="'+e(url)+'" target="_blank" rel="noopener"><strong>'+e(p.name)+' <span>↗</span></strong><small>'+e(p.summary)+'</small></a>'+(p.open_to_interest?'<button type="button" data-support="'+e(p.slug)+'">Podpořit projekt ↗</button>':'');list.append(item);}
 }
 const activeDomains=new Set(rows.map(domainFor));
 for(const link of networkLinks){let host='';try{host=new URL(link.getAttribute('href')).hostname.replace(/^www\./,'');}catch{}link.style.display=activeDomains.has(host)?'':'none';}
 document.querySelector('.network')?.setAttribute('data-projects-ready','');
 if(cardGrid){cardGrid.setAttribute('aria-busy','false');if(!rows.length)cardGrid.innerHTML='<p>Nové projekty právě připravujeme.</p>';}
 const counter=document.querySelector('.stats strong');if(counter)counter.textContent=rows.length;
 const label=counter?.parentElement;if(label&&label.lastChild?.nodeType===3)label.lastChild.textContent='aktivních projektů';
 if(dialog.open&&lastTrigger&&!rows.some(p=>p.slug===lastTrigger.dataset.support))dialog.close();
}
async function syncPublicProjects(){
 if(syncing)return;syncing=true;
 try{const rows=await request('/rest/v1/webao_projects?select=slug,name,summary,category,open_to_interest,stage&is_active=eq.true&order=sort_order');renderPublicProjects(rows);}
 catch{if(!lastProjectSignature&&cardGrid){cardGrid.innerHTML='<p>Projekty se nepodařilo načíst. Obnovte prosím stránku.</p>';cardGrid.setAttribute('aria-busy','false');}}
 finally{syncing=false;}
}
syncPublicProjects();
window.addEventListener('storage',ev=>{if(ev.key==='webao-projects-changed')syncPublicProjects();});
window.addEventListener('focus',syncPublicProjects);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncPublicProjects();});
setInterval(()=>{if(!document.hidden)syncPublicProjects();},15000);

