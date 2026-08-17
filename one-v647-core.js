/* ONE SHOT v6.4.7 · SEMANTIC DATA REPAIR */
(()=>{
'use strict';
if(window.ONE_V647_CORE)return;
const BUILD='oneshot-v6.4.7-data-fer-visual-fix-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const now=()=>new Date().toISOString();
const COMMANDS=new Set(['SAVE','SAVE-NEXT','BACK','OK','CONFIRM','CONFIRMAR','GUARDAR','GUARDAR Y SIGUIENTE','SIGUIENTE','ATRAS','ATRÁS','CANCEL','CANCELAR','USAR SUGERENCIAS','UNDEFINED','NULL','N/A','NA']);
const PURE_NUMBER=/^[+-]?\d+(?:[.,]\d+)?$/;
const text=v=>String(v??'').trim();
const semanticBad=v=>{const s=text(v);return !!s&&(PURE_NUMBER.test(s)||COMMANDS.has(N(s)));};
const semantic=v=>{const s=text(v);return !s||semanticBad(s)?'':s;};
const phone=v=>{const s=text(v);if(!s)return'';const digits=s.replace(/\D/g,'');return digits.length>=6?s:'';};
const email=v=>{const s=text(v);return s&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)?s:'';};
const ubigeo=v=>{const s=String(v??'').replace(/\D/g,'');return s.length===6?s:'';};
const idValue=(v,prefix)=>{const s=text(v);return s&&(!semanticBad(s))&&(!prefix||s.toLowerCase().startsWith(prefix))?s:'';};
const SEMANTIC_FIELDS=['party','candidate','candidateType','observation','reviewer','reviewedBy','electionType','province','department','region','district','municipality','municipalMayor','municipalMayorRole','municipalAddress','municipalMatchSource','municipalMatchConfidence','company','empresa','zone','zona','weather','clima','status','city'];
const priorRuntime=window.RuntimeVersion||{};window.RuntimeVersion={...priorRuntime,BUILD,currentBuild:()=>BUILD};

function sanitizeRecord(r,{audit=true}={}){
  if(!r)return false;let changed=false;const removed={};
  for(const f of SEMANTIC_FIELDS){const old=r[f],next=semantic(old);if(text(old)!==next){if(text(old))removed[f]=old;r[f]=next;changed=true;}}
  const oldUb=r.ubigeo,nextUb=ubigeo(oldUb);if(text(oldUb)!==nextUb){if(text(oldUb))removed.ubigeo=oldUb;r.ubigeo=nextUb;changed=true;}
  const oldPhone=r.municipalPhone,nextPhone=phone(oldPhone);if(text(oldPhone)!==nextPhone){if(text(oldPhone))removed.municipalPhone=oldPhone;r.municipalPhone=nextPhone;changed=true;}
  const oldMail=r.municipalEmail,nextMail=email(oldMail);if(text(oldMail)!==nextMail){if(text(oldMail))removed.municipalEmail=oldMail;r.municipalEmail=nextMail;changed=true;}
  for(const [f,prefix] of [['routeId','route-'],['missionId','mission-'],['teamAssignmentId',''],['teamMemberId','']]){const old=r[f],next=idValue(old,prefix);if(text(old)!==next){if(text(old))removed[f]=old;r[f]=next;changed=true;}}
  if(r.party&&COMMANDS.has(N(r.party))){removed.party=r.party;r.party='';changed=true;}
  if(r.captureAddress&&semanticBad(r.captureAddress)){removed.captureAddress=r.captureAddress;r.captureAddress='';changed=true;}
  if(r.address&&semanticBad(r.address)){removed.address=r.address;r.address='Ubicación pendiente';changed=true;}
  if(changed&&audit){r.dataRepairAuditV647=Array.isArray(r.dataRepairAuditV647)?r.dataRepairAuditV647:[];r.dataRepairAuditV647.push({at:now(),removed,rule:'SEMANTIC_FIELDS_REJECT_BARE_NUMERIC_OR_UI_COMMAND'});r.dataRepairAuditV647=r.dataRepairAuditV647.slice(-30);}
  return changed;
}

function patchReverse(){
  if(typeof GPS==='undefined'||!GPS.reverse||GPS.__v647Reverse)return;GPS.__v647Reverse=true;
  const previous=GPS.reverse.bind(GPS);
  GPS.reverse=async g=>{const loc=await previous(g);if(!loc)return loc;loc.department=semantic(loc.department);loc.province=semantic(loc.province);loc.district=semantic(loc.district);loc.city=semantic(loc.city);loc.ubigeo=ubigeo(loc.ubigeo);return loc;};
}
function patchGuided(){
  if(typeof GuidedEditor==='undefined'||GuidedEditor.__v647Semantic)return;GuidedEditor.__v647Semantic=true;
  const choose=GuidedEditor.choose?.bind(GuidedEditor);if(choose)GuidedEditor.choose=(v,o={})=>{const step=GuidedEditor.current?.();if(step?.key==='party'&&semanticBad(v)){GuidedEditor.say?.('Ese valor no corresponde a una organización política. Elige el partido o déjalo pendiente.');return;}return choose(v,o);};
}
function patchEditor(){
  if(typeof Editor==='undefined'||Editor.__v647Semantic)return;Editor.__v647Semantic=true;
  const persist=Editor.persist?.bind(Editor);if(persist)Editor.persist=async options=>{const out=await persist(options||{}),r=out||Editor.current;if(r&&sanitizeRecord(r)){try{window.ONE_V646_CORE?.Municipal?.apply(r,{touch:true});await Store.save(r);Reports.invalidate?.();}catch(_){}}return out||r;};
  const open=Editor.open?.bind(Editor);if(open)Editor.open=id=>{const r=State.records.find(x=>x.id===id);if(r&&sanitizeRecord(r)){Store.save(r).catch?.(()=>{});}return open(id);};
}
function patchReports(){
  if(typeof Reports==='undefined'||!Reports.makeExcel||Reports.__v647Semantic)return;Reports.__v647Semantic=true;
  const previous=Reports.makeExcel.bind(Reports);Reports.makeExcel=async(...args)=>{let changed=false;for(const r of Evidence.selectedForReport?.()||[]){if(sanitizeRecord(r))changed=true;try{window.ONE_V646_CORE?.Municipal?.apply(r,{touch:false});}catch(_){}}if(changed){try{await Store.saveBatch?.(State.records);}catch(_){}}return previous(...args);};
}
async function migrateAll(){let changed=false;for(const r of State.records||[]){if(r.v647Migrated)continue;const did=sanitizeRecord(r);try{window.ONE_V646_CORE?.Municipal?.apply(r,{touch:false});}catch(_){}r.v647Migrated=now();if(did)changed=true;}if(changed){try{await Store.saveBatch?.(State.records);}catch(_){}try{Reports.invalidate?.();Gallery.render?.();}catch(_){}}}
let tries=0;
async function start(){
  if(window.__ONE_V647_CORE_STARTED)return;if(typeof State==='undefined'||typeof Store==='undefined'||typeof GPS==='undefined'||typeof Reports==='undefined'||typeof Evidence==='undefined'||typeof Editor==='undefined'||typeof GuidedEditor==='undefined'){if(tries++<90)setTimeout(start,120);return;}
  window.__ONE_V647_CORE_STARTED=true;patchReverse();patchGuided();patchEditor();patchReports();await migrateAll();try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}document.title='ONE SHOT v6.4.7 · DATA + FER VISUAL FIX';
}
window.ONE_V647_CORE={BUILD,semanticBad,semantic,sanitizeRecord,start};window.addEventListener('load',()=>setTimeout(start,720),{once:true});if(document.readyState==='complete')setTimeout(start,720);
})();