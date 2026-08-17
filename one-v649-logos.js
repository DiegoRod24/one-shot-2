/* ONE SHOT v6.4.10 · NORMALIZED PARTY LOGOS */
(()=>{
'use strict';
if(window.ONE_V6410_LOGOS)return;
const BUILD='oneshot-v6.4.10-normalized-logo-catalog-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
let tries=0,observer=null,spriteOk=null;
const catalog=()=>Array.isArray(window.ONE_PARTY_CATALOG_V6410)?window.ONE_PARTY_CATALOG_V6410:(Array.isArray(window.ONE_PARTY_CATALOG_V648)?window.ONE_PARTY_CATALOG_V648:(Array.isArray(window.ONE_PARTY_CATALOG_V631)?window.ONE_PARTY_CATALOG_V631:[]));
const byName=()=>new Map(catalog().map(x=>[N(x.name),x]));
function initials(name){return String(name||'?').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';}
function paintFallback(span,name){span.style.backgroundImage='none';span.style.background='#edf4ff';span.style.color='#123b70';span.style.display='grid';span.style.placeItems='center';span.style.fontWeight='900';span.style.fontSize='18px';span.textContent=initials(name);}
function paintLogo(span,item,name){
  if(!item)return paintFallback(span,name);
  span.textContent='';span.style.display='block';span.style.backgroundColor='#fff';span.style.backgroundRepeat='no-repeat';span.style.backgroundOrigin='border-box';
  if(item.logoData){span.style.backgroundImage=`url('${item.logoData}')`;span.style.backgroundSize='cover';span.style.backgroundPosition='center';return;}
  if(spriteOk===false||!Number.isInteger(Number(item.i))||Number(item.i)<0)return paintFallback(span,name);
  const i=Number(item.i),c=i%10,r=Math.floor(i/10);span.style.backgroundImage="url('party-logos-v631.webp?v=6410')";span.style.backgroundSize='640px 512px';span.style.backgroundPosition=`-${c*64}px -${r*64}px`;
}
function sync(){
  const box=document.getElementById('guidedChoices');if(!box)return;const map=byName();
  box.querySelectorAll('button[data-guided-value]').forEach(btn=>{const name=btn.dataset.guidedValue||btn.dataset.guidedLabel||'',span=btn.querySelector('.v648PartyLogo,.v643PartyLogo');if(!span)return;if(!name)return paintFallback(span,'?');paintLogo(span,map.get(N(name)),name);span.dataset.v6410Logo='1';});
  const count=document.getElementById('v648PartyCount'),input=document.getElementById('v648PartyInput');if(count&&!String(input?.value||'').trim())count.textContent=`${catalog().length} organizaciones`;
}
function verifySprite(){return new Promise(resolve=>{const img=new Image();img.onload=()=>{spriteOk=img.naturalWidth===640&&img.naturalHeight===512;resolve(spriteOk);};img.onerror=()=>{spriteOk=false;resolve(false);};img.src=`party-logos-v631.webp?v=6410-${Date.now()}`;});}
function observe(){const box=document.getElementById('guidedChoices');if(!box||observer)return;observer=new MutationObserver(()=>setTimeout(sync,0));observer.observe(box,{childList:true,subtree:true});document.addEventListener('input',e=>{if(e.target?.id==='v648PartyInput')setTimeout(sync,0);},true);}
async function start(){if(window.__ONE_V6410_LOGOS_STARTED)return;if(!document.getElementById('guidedChoices')||!catalog().length){if(tries++<120)setTimeout(start,100);return;}window.__ONE_V6410_LOGOS_STARTED=true;await verifySprite();observe();sync();document.addEventListener('click',e=>{if(e.target?.closest?.('#editModal'))setTimeout(sync,40);},true);try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}}
window.ONE_V6410_LOGOS={BUILD,start,sync,catalog};window.ONE_V649_LOGOS=window.ONE_V6410_LOGOS;window.addEventListener('load',()=>setTimeout(start,1500),{once:true});if(document.readyState==='complete')setTimeout(start,1500);
})();