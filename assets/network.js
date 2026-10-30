document.querySelector('.all-link').addEventListener('click',function(){const panel=document.getElementById('all-projects');panel.hidden=!panel.hidden;this.setAttribute('aria-expanded',String(!panel.hidden));this.innerHTML=(panel.hidden?'Zobrazit všechny projekty':'Skrýt další projekty')+' <b>→</b>';});document.getElementById('year').textContent=new Date().getFullYear();
const mobileHeaderQuery=window.matchMedia('(max-width:600px)');
const mobileHeader=document.querySelector('header');
let mobileHeaderTimer;
function scheduleHeaderHide(){
 clearTimeout(mobileHeaderTimer);
 if(!mobileHeaderQuery.matches)return;
 mobileHeaderTimer=setTimeout(()=>{mobileHeader.classList.add('mobile-hidden');mobileHeader.setAttribute('inert','');},1000);
}
function revealMobileHeader(){
 if(!mobileHeaderQuery.matches)return;
 mobileHeader.classList.remove('mobile-hidden');mobileHeader.removeAttribute('inert');scheduleHeaderHide();
}
window.addEventListener('load',scheduleHeaderHide);
document.addEventListener('pointerdown',revealMobileHeader,{passive:true});
mobileHeaderQuery.addEventListener('change',()=>{
 clearTimeout(mobileHeaderTimer);mobileHeader.classList.remove('mobile-hidden');mobileHeader.removeAttribute('inert');scheduleHeaderHide();
});
