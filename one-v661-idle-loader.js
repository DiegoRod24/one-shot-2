/* ONE SHOT v6.6.8 · PERFORMANCE · IDLE FEATURE LOADER */
(()=>{
'use strict';
if(window.ONE_V661_IDLE_LOADER)return;
const BUILD='oneshot-v6.6.8-mobile-editor-polish-01';
const FEATURES={
  mobile:['one-v667-mobile-batch.js','one-v668-mobile-editor-polish.js'],
  cloud:['one-sync-worker-mode.js','one-dropbox-sync.js','one-phase2-edit-center.js'],
  reports:['one-v646-reports.js','one-v6411-reports.js','one-v651-reports-ui.js'],
  territory:['one-v6413-corridor.js','one-v6413-corridor-reports.js','one-v6415-territory-ops.js','one-v653-field-findings.js']
};
const loaded=new Set();
const pending=new Map();
function loadScript(src){
  if(loaded.has(src)||document.querySelector(`script[data-one-v661-src="${src}"]`))return Promise.resolve();
  if(pending.has(src))return pending.get(src);
  const p=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`/${src}`;s.async=false;s.dataset.oneV661Src=src;s.onload=()=>{loaded.add(src);pending.delete(src);resolve();};s.onerror=()=>{pending.delete(src);reject(new Error(`No se pudo cargar ${src}`));};document.body.appendChild(s);});
  pending.set(src,p);return p;
}
async function ensure(name){for(const src of FEATURES[name]||[])await loadScript(src);return true;}
async function ensureAdmin(){for(const name of ['reports','territory']){try{await ensure(name);}catch(e){console.warn('[ONE SHOT PERF]',name,e);}await new Promise(r=>setTimeout(r,0));}document.documentElement.dataset.oneShotIdleReady='1';}
function warmByIntent(e){
  const t=e.target?.closest?.('button,a,[data-view],[data-nav]');if(!t)return;
  const text=((t.textContent||'')+' '+(t.id||'')+' '+(t.dataset?.view||'')+' '+(t.dataset?.nav||'')).toLowerCase();
  if(/seleccion|evidencia|clasificar|lote|editar|marco/.test(text))ensure('mobile').catch(()=>{});
  if(/sincron|dropbox|nube|respaldo|editar nube/.test(text))ensure('cloud').catch(()=>{});
  if(/reporte|excel|pdf|export/.test(text))ensure('reports').catch(()=>{});
  if(/territorio|ruta|tramo|recorrido|cobertura|sector/.test(text))ensure('territory').catch(()=>{});
}
function schedule(){
  const mobile=()=>ensure('mobile').catch(e=>console.warn('[ONE SHOT PERF] mobile',e));
  const cloud=()=>ensure('cloud').catch(e=>console.warn('[ONE SHOT PERF] cloud',e));
  const admin=()=>ensureAdmin().catch(e=>console.warn('[ONE SHOT PERF] idle',e));
  setTimeout(mobile,220);
  if('requestIdleCallback' in window){requestIdleCallback(cloud,{timeout:2600});requestIdleCallback(admin,{timeout:7000});}
  else{setTimeout(cloud,1600);setTimeout(admin,4200);}
}
function optimizeImages(root=document){
  root.querySelectorAll?.('#evidenceList img, .evidenceList img, .gallery img').forEach(img=>{img.loading='lazy';img.decoding='async';img.fetchPriority='low';});
}
const observer=new MutationObserver(m=>{for(const x of m)for(const n of x.addedNodes)if(n.nodeType===1)optimizeImages(n);});
function start(){
  try{if(typeof State!=='undefined'&&State.settings){State.settings.assistantVoice=false;State.settings.assistantAuto=false;State.settings.assistantOcr=false;Store?.saveLite?.();}}catch(_){}
  optimizeImages();observer.observe(document.body,{childList:true,subtree:true});schedule();
}
document.addEventListener('pointerdown',warmByIntent,{capture:true,passive:true});
window.addEventListener('load',start,{once:true});if(document.readyState==='complete')start();
window.ONE_V661_IDLE_LOADER={BUILD,ensure,ensureAdmin,FEATURES};
})();
