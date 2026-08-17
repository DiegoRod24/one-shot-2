/* ONE SHOT v6.4.8 · PARTY LOGO SOURCE */
(()=>{
'use strict';
if(window.ONE_V648_LOGOS)return;
const BUILD='oneshot-v6.4.8-guided-party-logos-fix-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const catalog=()=>Array.isArray(window.ONE_PARTY_CATALOG_V631)?window.ONE_PARTY_CATALOG_V631:[];
function paint(){document.querySelectorAll('#guidedChoices .v648PartyLogo:not(.v648NoLogo)').forEach(box=>{const btn=box.closest('button[data-guided-label]'),item=catalog().find(x=>N(x.name)===N(btn?.dataset.guidedLabel));if(!item)return;const col=item.i%10,row=Math.floor(item.i/10);box.style.backgroundImage="url('party-logos-v631.webp?v=6482')";box.style.backgroundSize='640px 512px';box.style.backgroundPosition=`-${col*64}px -${row*64}px`;});}
let timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(paint,40);}
function start(){paint();const box=document.getElementById('guidedChoices');if(box&&window.MutationObserver)new MutationObserver(schedule).observe(box,{childList:true,subtree:true});document.addEventListener('click',schedule,true);}
window.ONE_V648_LOGOS={BUILD,paint,start};window.addEventListener('load',()=>setTimeout(start,1400),{once:true});if(document.readyState==='complete')setTimeout(start,1400);
})();