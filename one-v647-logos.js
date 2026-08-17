/* ONE SHOT v6.4.7 · PARTY LOGO CANVAS RENDERER */
(()=>{
'use strict';
if(window.ONE_V647_LOGOS)return;
const BUILD='oneshot-v6.4.7-data-fer-visual-fix-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
let sprite=null,loading=false,tries=0,paintTimer=null;
const catalog=()=>Array.isArray(window.ONE_PARTY_CATALOG_V631)?window.ONE_PARTY_CATALOG_V631:[];
const item=name=>catalog().find(x=>N(x.name)===N(name))||null;
const initials=name=>String(name||'').split(/\s+/).filter(Boolean).filter(x=>!/^(DE|DEL|LA|EL|Y)$/i.test(x)).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'OP';
function css(){if(document.getElementById('v647LogoCss'))return;const s=document.createElement('style');s.id='v647LogoCss';s.textContent=`
.v643PartyLogo{position:relative!important;overflow:hidden!important;background:#fff!important;background-image:none!important;display:grid!important;place-items:center!important}
.v643PartyLogo .v645PartySprite{display:none!important}
.v643PartyLogo .v647PartyCanvas{position:absolute!important;inset:0!important;width:64px!important;height:64px!important;display:block!important}
.v643PartyLogo .v647PartyFallback{position:absolute!important;inset:0!important;display:none;place-items:center;background:linear-gradient(145deg,#edf4ff,#dce9fb);color:#143b70;font-size:18px;font-weight:950;letter-spacing:.5px}
.v643PartyLogo.v647Fallback .v647PartyCanvas{display:none!important}.v643PartyLogo.v647Fallback .v647PartyFallback{display:grid!important}
`;document.head.appendChild(s);}
function load(){if(sprite||loading)return;loading=true;const im=new Image();im.decoding='async';im.onload=()=>{sprite=im;loading=false;paint();};im.onerror=()=>{loading=false;document.querySelectorAll('.v643PartyLogo').forEach(b=>b.classList.add('v647Fallback'));};im.src=`party-logos-v631.webp?v=647-${BUILD}`;}
function cellHasContent(ctx){try{const d=ctx.getImageData(0,0,64,64).data;let ink=0,opaque=0;for(let i=0;i<d.length;i+=16){const a=d[i+3],r=d[i],g=d[i+1],b=d[i+2];if(a>20){opaque++;if(r<242||g<242||b<242)ink++;}}return opaque>20&&ink>12;}catch(_){return true;}}
function renderBox(box,name){
  const x=item(name);box.dataset.initials=initials(name);let fb=box.querySelector('.v647PartyFallback');if(!fb){fb=document.createElement('span');fb.className='v647PartyFallback';box.appendChild(fb);}fb.textContent=initials(name);
  if(!x||!sprite){box.classList.add('v647Fallback');return;}
  let c=box.querySelector('.v647PartyCanvas');if(!c){c=document.createElement('canvas');c.width=64;c.height=64;c.className='v647PartyCanvas';box.appendChild(c);}const ctx=c.getContext('2d',{alpha:true});ctx.clearRect(0,0,64,64);const col=x.i%10,row=Math.floor(x.i/10);ctx.drawImage(sprite,col*64,row*64,64,64,0,0,64,64);box.classList.toggle('v647Fallback',!cellHasContent(ctx));box.dataset.logoIndex=String(x.i);
}
function paint(){clearTimeout(paintTimer);paintTimer=setTimeout(()=>{if(!sprite){load();return;}document.querySelectorAll('#guidedChoices button[data-guided-label] .v643PartyLogo').forEach(box=>{const btn=box.closest('button[data-guided-label]');renderBox(box,btn?.dataset.guidedLabel||'');});},30);}
function start(){if(window.__ONE_V647_LOGOS_STARTED)return;if(!catalog().length){if(tries++<100)setTimeout(start,100);return;}window.__ONE_V647_LOGOS_STARTED=true;css();load();const target=document.getElementById('guidedChoices');if(target&&window.MutationObserver)new MutationObserver(paint).observe(target,{subtree:true,childList:true});document.addEventListener('click',e=>{if(e.target.closest('#guidedEditor,#editModal'))setTimeout(paint,30)},true);}
window.ONE_V647_LOGOS={BUILD,start,paint};window.addEventListener('load',()=>setTimeout(start,850),{once:true});if(document.readyState==='complete')setTimeout(start,850);
})();