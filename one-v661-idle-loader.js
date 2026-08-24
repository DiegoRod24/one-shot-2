/* ONE SHOT v6.6.19 · CAMERA-FIRST IDLE LOADER */
(()=>{
'use strict';
if(window.ONE_V661_IDLE_LOADER)return;
const BUILD='oneshot-v6.6.19-camera-first-idle-loader-01';
const FEATURES={
  mobile:['one-v667-mobile-batch.js','one-v668-mobile-editor-polish.js','one-v669-local-partidario.js'],
  cloud:['one-sync-worker-mode.js','one-dropbox-sync.js','one-phase2-edit-center.js'],
  reports:['one-v646-reports.js','one-v6411-reports.js','one-v651-reports-ui.js'],
  tramo:['one-v6413-corridor.js','one-v6617-tramo-postes.js','one-v6413-corridor-reports.js','one-v6617-tramo-reports.js','one-v6619-tramo-map.js'],
  territory:['one-v6415-territory-ops.js','one-v653-field-findings.js']
};
const loaded=new Set(),pending=new Map();
function loadScript(src){if(loaded.has(src)||document.querySelector(`script[data-one-v661-src="${src}"]`))return Promise.resolve();if(pending.has(src))return pending.get(src);const p=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`/${src}`;s.async=false;s.dataset.oneV661Src=src;s.onload=()=>{loaded.add(src);pending.delete(src);resolve()};s.onerror=()=>{pending.delete(src);reject(new Error(`No se pudo cargar ${src}`))};document.body.appendChild(s)});pending.set(src,p);return p}
async function ensure(name){
  if(name==='territory')await ensure('tramo');
  for(const src of FEATURES[name]||[])await loadScript(src);
  if(name==='tramo'||name==='territory'){
    try{window.ONE_V6413_CORRIDOR?.start?.()}catch(_){}
    try{window.ONE_V6617_TRAMO_POSTES?.start?.()}catch(_){}
    try{window.PropagandaCorridor?.injectV6617?.();window.PropagandaCorridor?.paint?.()}catch(_){}
    try{window.ONE_V6619_TRAMO_MAP?.prepare?.()}catch(_){}
    try{window.ONE_V6413_CORRIDOR_REPORTS?.start?.();window.ONE_V6617_TRAMO_REPORTS?.start?.()}catch(_){}
  }
  return true
}
async function ensureAdmin(){for(const name of ['reports','territory']){try{await ensure(name)}catch(e){console.warn('[ONE SHOT PERF]',name,e)}await new Promise(r=>setTimeout(r,0))}document.documentElement.dataset.oneShotIdleReady='1'}
function warmByIntent(e){const t=e.target?.closest?.('button,a,[data-view],[data-nav]');if(!t)return;const text=((t.textContent||'')+' '+(t.id||'')+' '+(t.dataset?.view||'')+' '+(t.dataset?.nav||'')).toLowerCase();if(/seleccion|evidencia|clasificar|lote|editar|marco|local partidario|local/.test(text))ensure('mobile').catch(()=>{});if(/sincron|dropbox|nube|respaldo|editar nube/.test(text))ensure('cloud').catch(()=>{});if(/reporte|excel|pdf|export/.test(text))ensure('reports').catch(()=>{});if(/tramo|cartel|pancarta|poste/.test(text))ensure('tramo').catch(()=>{});if(/lugares|territorio|mapa local|ruta|recorrido|cobertura|sector/.test(text))ensure('territory').catch(()=>{})}
function cameraLive(){try{return typeof State!=='undefined'&&State.cameraStatus==='active'&&State.currentTrack?.readyState==='live'}catch(_){return false}}
function afterCameraReady(fn,maxWait=14000){const started=performance.now();const tick=()=>{if(cameraLive()){setTimeout(fn,220);return}if(performance.now()-started>=maxWait){setTimeout(fn,500);return}setTimeout(tick,110)};tick()}
function idle(fn,timeout){if('requestIdleCallback' in window)requestIdleCallback(fn,{timeout});else setTimeout(fn,Math.min(timeout,3200))}
function schedule(){
  // La cámara mantiene prioridad absoluta. Tramo se carga por intención y el resto espera video activo/idle.
  afterCameraReady(()=>idle(()=>ensure('mobile').catch(e=>console.warn('[ONE SHOT PERF] mobile',e)),1800),12000);
  afterCameraReady(()=>idle(()=>ensure('cloud').catch(e=>console.warn('[ONE SHOT PERF] cloud',e)),3600),15000);
  afterCameraReady(()=>idle(()=>ensureAdmin().catch(e=>console.warn('[ONE SHOT PERF] admin',e)),7500),18000);
}
function tuneImage(img){if(!img)return;img.loading='lazy';img.decoding='async';img.fetchPriority='low'}
function optimizeImages(root=document){if(root?.matches?.('#evidenceList img,.evidenceList img,.gallery img'))tuneImage(root);root?.querySelectorAll?.('img')?.forEach(tuneImage)}
let evidenceObserver=null;
function observeEvidenceList(){const root=document.querySelector('#evidenceList');if(!root||evidenceObserver)return;evidenceObserver=new MutationObserver(m=>{for(const x of m)for(const n of x.addedNodes)if(n.nodeType===1)optimizeImages(n)});evidenceObserver.observe(root,{childList:true,subtree:true});optimizeImages(root)}
function start(){try{if(typeof State!=='undefined'&&State.settings){State.settings.assistantEnabled=false;State.settings.assistantVoice=false;State.settings.assistantAuto=false;State.settings.assistantOcr=false;Store?.saveLite?.()}}catch(_){}observeEvidenceList();schedule()}
document.addEventListener('pointerdown',warmByIntent,{capture:true,passive:true});window.addEventListener('load',start,{once:true});if(document.readyState==='complete')start();window.ONE_V661_IDLE_LOADER={BUILD,ensure,ensureAdmin,FEATURES};
})();
