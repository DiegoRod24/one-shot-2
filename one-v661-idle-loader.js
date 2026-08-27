/* ONE SHOT v6.7.0 · TRUE ON-DEMAND FIELD RUNTIME */
(()=>{
'use strict';
if(window.ONE_V661_IDLE_LOADER)return;
const BUILD='oneshot-v6.7.0-field-runtime-clean-01';
const FEATURES={
  mobile:['party-catalog-v6410.js','one-v6414-health-runtime.js','one-v6416-evidence-recovery.js','one-v6416-media-legacy-bridge.js','one-v6416-runtime-meta.js','one-v651-assets.js','one-v651-domain.js','one-v653-mobile-ux.js','one-v6612-field-flow-cleanup.js','one-v664-editor-stable.js','one-v667-mobile-batch.js','one-v668-mobile-editor-polish.js','one-v669-local-partidario.js','one-v6615-nearby-preferences.js','one-v6618-field-flow.js'],
  activity:['one-v660-political-activity.js','one-v6618-field-flow.js'],
  cloud:['one-v6616-sync-identity.js','one-sync-worker-mode.js','one-dropbox-sync.js','one-phase2-edit-center.js','one-v6618-field-flow.js'],
  municipal:['municipal-data-v630-01.js','municipal-data-v630-02.js','municipal-data-v630-03.js','municipal-data-v630-04.js','municipal-data-v630-05.js','municipal-data-v630-metro.js','one-v646-map.js','one-v651-municipal.js'],
  reports:['one-v646-reports.js','one-v6411-reports.js','one-v651-reports-ui.js'],
  tramo:['one-v6413-corridor.js','one-v6617-tramo-postes.js','one-v6413-corridor-reports.js','one-v6617-tramo-reports.js','one-v6620-tramo-map.js','one-v6622-tramo-calle.js','one-v6623-tramo-state-hotfix.js'],
  territory:['one-v6415-territory-ops.js','one-v653-field-findings.js']
};
const CSS={mobile:['one-v664-editor-stable.css'],activity:['one-v660-field-foundation.css'],cloud:['one-dropbox-sync.css','one-phase2-edit-center.css'],municipal:[],reports:[],tramo:[],territory:[]};
const loaded=new Set(),pending=new Map();
function loadCss(src){if(document.querySelector(`link[data-one-v670-css="${src}"]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=`/${src}`;l.dataset.oneV670Css=src;document.head.appendChild(l)}
function already(src){return loaded.has(src)||!!document.querySelector(`script[data-one-v661-src="${src}"],script[src$="/${src}"],script[src="${src}"]`)}
function loadScript(src){if(already(src)){loaded.add(src);return Promise.resolve()}if(pending.has(src))return pending.get(src);const p=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`/${src}`;s.async=false;s.dataset.oneV661Src=src;s.onload=()=>{loaded.add(src);pending.delete(src);resolve()};s.onerror=()=>{pending.delete(src);reject(new Error(`No se pudo cargar ${src}`))};document.body.appendChild(s)});pending.set(src,p);return p}
async function ensure(name){
  if(name==='territory'){await ensure('tramo');await ensure('municipal')}
  if(name==='reports')await ensure('municipal');
  for(const css of CSS[name]||[])loadCss(css);
  for(const src of FEATURES[name]||[])await loadScript(src);
  if(name==='tramo'||name==='territory'){
    try{window.ONE_V6413_CORRIDOR?.start?.()}catch(_){}
    try{window.ONE_V6617_TRAMO_POSTES?.start?.()}catch(_){}
    try{const c=typeof PropagandaCorridor!=='undefined'?PropagandaCorridor:window.PropagandaCorridor;c?.injectV6617?.();c?.paint?.()}catch(_){}
    try{window.ONE_V6620_TRAMO_MAP?.prepare?.()}catch(_){}
    try{window.ONE_V6622_TRAMO_CALLE?.prepare?.()}catch(_){}
    try{window.ONE_V6623_TRAMO_STATE_HOTFIX?.prepare?.()}catch(_){}
    try{window.ONE_V6413_CORRIDOR_REPORTS?.start?.();window.ONE_V6617_TRAMO_REPORTS?.start?.()}catch(_){}
  }
  return true;
}
async function ensureAdmin(){for(const name of ['reports','territory']){try{await ensure(name)}catch(e){console.warn('[ONE SHOT PERF]',name,e)}await new Promise(r=>setTimeout(r,0))}document.documentElement.dataset.oneShotIdleReady='1'}
function intent(name,label){let shown=false;const t=setTimeout(()=>{try{window.ONE_V6619_STARTUP_STATUS?.busy?.(`Cargando ${label}…`,'Se carga una sola vez cuando realmente lo necesitas. La cámara queda libre.');shown=true}catch(_){}},280);return ensure(name).catch(e=>{console.warn('[ONE SHOT PERF]',name,e);throw e}).finally(()=>{clearTimeout(t);if(shown)try{window.ONE_V6619_STARTUP_STATUS?.unbusy?.()}catch(_){}})}
function warmByIntent(e){const t=e.target?.closest?.('button,a,label,[data-view],[data-nav]');if(!t)return;const text=((t.textContent||'')+' '+(t.id||'')+' '+(t.dataset?.view||'')+' '+(t.dataset?.nav||'')).toLowerCase();if(/actividad|marcha|mitin|evento político|evento politico/.test(text)){intent('activity','Actividad política').catch(()=>{});return}if(/tramo|cartel|pancarta|poste/.test(text)){intent('tramo','Tramo de carteles').catch(()=>{});return}if(/lugares|territorio|mapa local|ruta|recorrido|cobertura|sector/.test(text)){intent('territory','Territorio').catch(()=>{});return}if(/reporte|excel|pdf|export/.test(text)){intent('reports','Reportes').catch(()=>{});return}if(/sincron|dropbox|nube|respaldo|editar nube/.test(text)){intent('cloud','Sincronización').catch(()=>{});return}if(/seleccion|evidencia|clasificar|lote|editar|marco|local partidario|local|anteriores|historial/.test(text)){intent('mobile','Evidencias').catch(()=>{});return}}
function tuneImage(img){if(!img)return;img.loading='lazy';img.decoding='async';img.fetchPriority='low'}
function optimizeImages(root=document){if(root?.matches?.('#evidenceList img,.evidenceList img,.gallery img'))tuneImage(root);root?.querySelectorAll?.('img')?.forEach(tuneImage)}
let evidenceObserver=null;
function observeEvidenceList(){const root=document.querySelector('#evidenceList');if(!root||evidenceObserver)return;evidenceObserver=new MutationObserver(m=>{for(const x of m)for(const n of x.addedNodes)if(n.nodeType===1)optimizeImages(n)});evidenceObserver.observe(root,{childList:true,subtree:true});optimizeImages(root)}
function start(){try{if(typeof State!=='undefined'&&State.settings){State.settings.assistantEnabled=false;State.settings.assistantVoice=false;State.settings.assistantAuto=false;State.settings.assistantOcr=false;State.settings.assistantMascot=false;Store?.saveLite?.()}}catch(_){}observeEvidenceList();/* Nada administrativo se precarga automáticamente. */}
document.addEventListener('pointerdown',warmByIntent,{capture:true,passive:true});window.addEventListener('load',start,{once:true});if(document.readyState==='complete')start();window.ONE_V661_IDLE_LOADER={BUILD,ensure,ensureAdmin,intent,FEATURES,CSS};
})();
