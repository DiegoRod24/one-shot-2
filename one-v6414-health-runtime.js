/* ONE SHOT v6.4.14 · RUNTIME HEALTH ALIGNMENT */
(()=>{
'use strict';
if(window.ONE_V6414_HEALTH_RUNTIME)return;
const BUILD='oneshot-v6.4.14-repo-health-cleanup-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
const H={
 migrateIdentity(){try{if(typeof State==='undefined')return;const n=N(State.settings?.assistantName);if(!n||n==='ONE'||n==='ONE ASSISTANT'){State.settings.assistantName='Fer';Store.saveLite?.();}}catch(_){}},
 paintIdentity(){const values={oneAssistantFabName:'Fer',assistantModalName:'Fer',assistantHelloName:'Fer'};for(const [id,v] of Object.entries(values)){const el=document.getElementById(id);if(el)el.textContent=v;}const fab=document.getElementById('oneAssistantFab');if(fab)fab.setAttribute('aria-label','Abrir Fer · Asistente de ONE SHOT');const nudge=document.getElementById('assistantNudge');if(nudge)nudge.setAttribute('aria-label','Abrir sugerencia de Fer');document.querySelectorAll('.assistantSafetyNote').forEach(x=>{x.textContent='Fer sugiere y ejecuta acciones seguras. Cierres o acciones sensibles requieren confirmación.';});try{document.title='ONE SHOT · Evidencia de campo';}catch(_){}},
 patchEvidenceBuild(){if(typeof Evidence==='undefined'||!Evidence.make||Evidence.__v6414Build)return;Evidence.__v6414Build=true;const old=Evidence.make.bind(Evidence);Evidence.make=(...a)=>{const r=old(...a);if(r){r.appBuild=BUILD;r.appVersion='v6.4.14';r.runtimeBuild=BUILD;}return r;};},
 patchAssistant(){try{if(typeof ONEAssistant!=='undefined'){ONEAssistant.paintIdentity?.();ONEAssistant.render?.();}}catch(_){}},
 run(){this.migrateIdentity();this.paintIdentity();this.patchEvidenceBuild();this.patchAssistant();document.documentElement.dataset.oneshotBuild=BUILD;}
};
let tries=0;function start(){if(window.__ONE_V6414_HEALTH_RUNTIME_STARTED)return;if(typeof State==='undefined'||typeof Evidence==='undefined'){if(tries++<180)return void setTimeout(start,90);return;}window.__ONE_V6414_HEALTH_RUNTIME_STARTED=true;H.run();window.addEventListener('oneshot-runtime-recovered',()=>setTimeout(()=>H.run(),100));}
window.ONE_V6414_HEALTH_RUNTIME={BUILD,start,H};window.addEventListener('load',()=>setTimeout(start,3400),{once:true});if(document.readyState==='complete')setTimeout(start,3400);
})();
