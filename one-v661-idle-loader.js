/* ONE SHOT v6.6.1 · PERFORMANCE · IDLE FEATURE LOADER */
(()=>{
'use strict';
if(window.ONE_V661_IDLE_LOADER)return;
const BUILD='oneshot-v6.6.1-performance-runtime-slim-01';
const FEATURES={
  municipal:[
    'municipal-data-v630-01.js','municipal-data-v630-02.js','municipal-data-v630-03.js',
    'municipal-data-v630-04.js','municipal-data-v630-05.js','municipal-data-v630-metro.js',
    'one-v651-municipal.js'
  ],
  maps:['one-v646-map.js'],
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
async function ensureAll(){for(const name of ['municipal','maps','reports','territory']){try{await ensure(name);}catch(e){console.warn('[ONE SHOT PERF]',name,e);}await new Promise(r=>setTimeout(r,0));}document.documentElement.dataset.oneShotIdleReady='1';}
function warmByIntent(e){const t=e.target?.closest?.('button,a,[data-view],[data-nav]');if(!t)return;const text=((t.textContent||'')+' '+(t.id||'')+' '+(t.dataset?.view||'')+' '+(t.dataset?.nav||'')).toLowerCase();if(/reporte|excel|pdf|export/.test(text))ensure('reports').catch(()=>{});if(/municip|carta|destino/.test(text))ensure('municipal').catch(()=>{});if(/mapa|territorio|lugar|ruta|tramo|recorrido/.test(text)){ensure('maps').catch(()=>{});ensure('territory').catch(()=>{});}}
function schedule(){const run=()=>ensureAll().catch(e=>console.warn('[ONE SHOT PERF] idle',e));if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:6500});else setTimeout(run,3200);}
document.addEventListener('pointerdown',warmByIntent,{capture:true,passive:true});window.addEventListener('load',schedule,{once:true});if(document.readyState==='complete')schedule();window.ONE_V661_IDLE_LOADER={BUILD,ensure,ensureAll,FEATURES};
})();
