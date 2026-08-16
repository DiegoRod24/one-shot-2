/* ONE SHOT v6.4.6 · STABILITY + UX REPAIR · CORE */
(()=>{
'use strict';
if(window.ONE_V646_CORE)return;
const BUILD='oneshot-v6.4.6-stability-ux-repair-01';
const TYPES=new Set(['PANEL','BANNER','PINTA']);
const JUNK=new Set(['31','UNDEFINED','NULL','N/A','NA','USAR SUGERENCIAS']);
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const clean=v=>{const s=String(v??'').trim();return !s||JUNK.has(N(s))?'':s;};
const now=()=>new Date().toISOString();
const semver=v=>{const m=String(v||'').match(/(?:oneshot-)?v(\d+)\.(\d+)\.(\d+)/i);return m?[+m[1],+m[2],+m[3]]:null;};
const compare=(a,b)=>{const A=semver(a),B=semver(b);if(!A||!B)return 0;for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]>B[i]?1:-1;}return 0;};
window.RuntimeVersion={BUILD,currentBuild:()=>BUILD,compare,isAtLeast:v=>compare(BUILD,v)>=0};

const FieldRules={
  types:TYPES,
  safeType(r){const t=N(r?.type);return TYPES.has(t)?t:'PENDIENTE';},
  captureAddress(r){return clean(r?.captureAddress||r?.address||r?.ubicacion||r?.direccionCaptura);},
  wasReviewed(r){return !!(r?.reviewTouched||r?.reviewedAt||r?.lastEditorSavedAt||r?.classificationDraft?.status==='completed'||(Array.isArray(r?.classificationAudit)&&r.classificationAudit.length));},
  reviewState(r){
    if(!r)return'PENDIENTE';
    const complete=!!clean(r.party)&&TYPES.has(N(r.type));
    if(!FieldRules.wasReviewed(r)||!complete)return'PENDIENTE';
    const lowGps=Number(r.gps?.accuracy??r.accuracy??0)>60;
    const municipal=!!clean(r.municipality)&&!!clean(r.municipalMayor)&&!!clean(r.municipalAddress);
    return municipal&&!lowGps&&!r.municipalBoundaryReview?'REVISADA':'REVISAR_UBICACION';
  },
  reviewLabel(r){const s=FieldRules.reviewState(r);return s==='REVISADA'?'REVISADA':s==='REVISAR_UBICACION'?'REVISAR UBICACIÓN':'FALTA REVISAR';},
  idProx(r){const a=Number(r?.gps?.latitude),b=Number(r?.gps?.longitude);return Number.isFinite(a)&&Number.isFinite(b)?`${a.toFixed(4)}-${b.toFixed(4)}`:'';},
  nomenclature(r){const date=String(r?.fecha||'').split('-').reverse().join('-'),time=String(r?.hora||'').replace(/:/g,'.');return [date,time,clean(r?.party),clean(r?.department||r?.region),clean(r?.province),clean(r?.district),FieldRules.safeType(r)].filter(Boolean).join('_').replace(/[\\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim();}
};

const Municipal={
  rows(){return Array.isArray(window.ONE_MUNICIPAL_DIRECTORY_ROWS)?window.ONE_MUNICIPAL_DIRECTORY_ROWS:[];},
  obj(x){return x?{ubigeo:String(x[0]||''),department:x[1]||'',province:x[2]||'',district:x[3]||'',role:x[4]||'',mayor:x[5]||'',address:x[6]||'',cityCode:x[7]||'',phone:x[8]||'',email:x[9]||''}:null;},
  name(m){return !m?'':(/PROVINCIAL/i.test(m.role||'')?`Municipalidad Provincial de ${m.province}`:`Municipalidad Distrital de ${m.district}`);},
  match(r){
    const rows=Municipal.rows(),ub=String(r?.ubigeo||'').replace(/\D/g,'').slice(0,6);
    if(ub.length===6){const hits=rows.filter(x=>String(x[0]||'')===ub);if(hits.length===1)return{row:hits[0],source:'UBIGEO',confidence:'ALTA'};}
    const d=N(r?.department||r?.region),p=N(r?.province),s=N(r?.district);
    if(d&&p&&s){const hits=rows.filter(x=>N(x[1])===d&&N(x[2])===p&&N(x[3])===s);if(hits.length===1)return{row:hits[0],source:'DEPARTAMENTO + PROVINCIA + DISTRITO',confidence:'MEDIA'};}
    return{row:null,source:'SIN MATCH',confidence:'BAJA'};
  },
  clearAuto(r){
    if(!r||r.municipalOverride)return;
    for(const k of ['municipality','municipalMayor','municipalMayorRole','municipalAddress','municipalPhone','municipalEmail'])r[k]='';
  },
  apply(r,{manual=null,touch=false}={}){
    if(!r)return null;
    if(!r.captureAddress&&clean(r.address))r.captureAddress=r.address;
    const hit=manual?{row:manual,source:'MANUAL · LÍMITE',confidence:'CONFIRMADA'}:Municipal.match(r),m=Municipal.obj(hit.row);
    if(touch)r.reviewTouched=true;
    if(m){
      r.department=m.department;r.region=m.department;r.province=m.province;r.district=m.district;r.ubigeo=m.ubigeo;
      r.municipality=Municipal.name(m);r.municipalMayor=m.mayor;r.municipalMayorRole=m.role;r.municipalAddress=m.address;r.municipalPhone=m.phone;r.municipalEmail=m.email;
      r.municipalMatchSource=hit.source;r.municipalMatchConfidence=hit.confidence;r.municipalMatchedAt=now();r.municipalDirectoryVersion='DIRECTORIO 2026-08-14';
      if(manual){r.municipalOverride=true;r.municipalBoundaryReview=false;}
    }else{
      Municipal.clearAuto(r);r.municipalMatchSource='SIN MATCH';r.municipalMatchConfidence='BAJA';
    }
    const next=FieldRules.reviewState(r);if(r.reviewStatus!==next){r.reviewHistory=Array.isArray(r.reviewHistory)?r.reviewHistory:[];r.reviewHistory.push({at:now(),from:r.reviewStatus||'PENDIENTE',to:next,reason:'V646_FIELD_RULES'});r.reviewHistory=r.reviewHistory.slice(-100);}r.reviewStatus=next;r.reviewUpdatedAt=now();
    if(next==='REVISADA'){r.reviewedAt=r.reviewedAt||now();try{r.reviewedBy=r.reviewedBy||State.settings.reviewer||r.reviewer||'';}catch(_){}}
    return m;
  }
};

function migrateRecord(r){
  if(!r||r.v646Migrated)return false;let changed=false;const removed={};
  if(!r.captureAddress&&clean(r.address)){r.captureAddress=r.address;changed=true;}
  if(N(r.type)==='PENDIENTE'&&N(r.legacyTypeV643)==='PINTA'){r.type='PINTA';changed=true;}
  const t=N(r.type);
  if(t&&t!=='PENDIENTE'&&!TYPES.has(t)){r.legacyTypeV646=r.legacyTypeV646||r.type;r.type='PENDIENTE';r.reviewStatus='PENDIENTE';changed=true;}
  for(const f of ['party','candidate','candidateType','observation','reviewer','reviewedBy','electionType','province','department','region','district','municipality','municipalMayor','municipalMayorRole','municipalAddress','municipalPhone','municipalEmail']){
    const raw=String(r[f]??'').trim();if(raw&&JUNK.has(N(raw))){removed[f]=raw;r[f]='';changed=true;}
  }
  Municipal.apply(r,{touch:false});r.v646Migrated=now();r.v646MigrationAudit={at:r.v646Migrated,removed,legacyType:r.legacyTypeV646||r.legacyTypeV643||''};return true;
}

function patchMunicipal(){
  if(!window.ONE_V63_CORE)return;
  ONE_V63_CORE.match=r=>{const h=Municipal.match(r);return{x:h.row,source:h.source,confidence:h.confidence};};
  ONE_V63_CORE.apply=(r,o={})=>Municipal.apply(r,{manual:o.manual||null,touch:o.touch===true});
  ONE_V63_CORE.state=r=>FieldRules.reviewState(r);
  ONE_V63_CORE.label=s=>s==='REVISADA'?'REVISADA':s==='REVISAR_UBICACION'?'REVISAR UBICACIÓN':'FALTA REVISAR';
}

function patchGuidedTypes(){
  if(typeof GuidedEditor==='undefined')return;
  GuidedEditor.steps=()=>[
    {key:'party',field:'editParty',question:'¿A qué partido u organización pertenece?',choices:()=>Array.isArray(window.ONE_PARTY_CATALOG_V631)?[...window.ONE_PARTY_CATALOG_V631.map(x=>[x.name,x.name]),['No identificado','']]:GuidedEditor.partyChoices?.()||[]},
    {key:'type',field:'editType',question:'¿Qué tipo de evidencia encontraste?',choices:()=>[['PANEL','PANEL'],['BANNER','BANNER'],['PINTA','PINTA']]},
    {key:'summary',question:'Listo. Revisa partido, tipo y destino antes de guardar.',choices:()=>[['✓ Guardar y siguiente','save-next'],['Guardar','save'],['← Corregir','back']]}
  ];
  const oldParse=GuidedEditor.parseVoice?.bind(GuidedEditor);
  if(oldParse&&!GuidedEditor.__v646Parse){GuidedEditor.__v646Parse=true;GuidedEditor.parseVoice=raw=>{const q=N(raw);if(GuidedEditor.current?.()?.key==='type'){
    const hit=q.includes('PANEL')?'PANEL':q.includes('BANNER')||q.includes('BANDEROLA')||q.includes('LONA')?'BANNER':q.includes('PINTA')||q.includes('PINTADO')||q.includes('PARED PINTADA')?'PINTA':'';
    if(hit)return GuidedEditor.choose(hit,{source:'voice-auto',label:hit,showAutoRecognition:true,raw});
  }return oldParse(raw);};}
}

function patchEditor(){
  if(typeof Editor==='undefined')return;
  const populate=Editor.populateLists?.bind(Editor);
  if(populate&&!Editor.__v646Populate){Editor.__v646Populate=true;Editor.populateLists=r=>{const out=populate(r);const e=document.getElementById('editType');if(e){const value=TYPES.has(N(r?.type))?N(r.type):'PENDIENTE';e.innerHTML='<option value="PENDIENTE">PENDIENTE</option><option value="PANEL">PANEL</option><option value="BANNER">BANNER</option><option value="PINTA">PINTA</option>';e.value=value;}return out;};}
  const persist=Editor.persist?.bind(Editor);
  if(persist&&!Editor.__v646Persist){Editor.__v646Persist=true;Editor.persist=async options=>{const before=Editor.current,out=await persist(options||{}),r=out||Editor.current||before;if(r){if(!r.captureAddress&&clean(r.address))r.captureAddress=r.address;Municipal.apply(r,{touch:true});await Promise.resolve(Store.save?.(r)).catch(()=>{});Reports.invalidate?.();}return out||r;};}
}

function patchRoute(){
  if(typeof RouteCoverage==='undefined'||RouteCoverage.__v646Capture)return;RouteCoverage.__v646Capture=true;
  RouteCoverage.capture=(g,force=false)=>{
    const r=RouteCoverage.active();if(!r||!g||r.pausedBySystem)return;
    const p={latitude:Number(g.latitude),longitude:Number(g.longitude),accuracy:Number(g.accuracy||0),timestamp:Number(g.timestamp||Date.now())};
    if(!Number.isFinite(p.latitude)||!Number.isFinite(p.longitude))return;
    const last=r.points?.[r.points.length-1],dist=last?RouteCoverage.distance(last,p):0,elapsed=last?(p.timestamp-Number(last.timestamp||0))/1000:999,minM=Number(State.settings.routeRecordMinM||20),maxS=Number(State.settings.routeRecordMaxSec||25);
    if(!force&&p.accuracy>120){r.gpsRejected=(r.gpsRejected||0)+1;return;}
    if(!force&&last&&dist<minM&&elapsed<maxS)return;
    if(!Array.isArray(r.points))r.points=[];
    if(last&&dist>300&&elapsed<180){r.gpsRejected=(r.gpsRejected||0)+1;r.lastGpsRejected={at:now(),distanceM:Math.round(dist),accuracy:p.accuracy,reason:'IMPOSSIBLE_JUMP'};return;}
    if(last&&dist>300){p.segmentBreak=true;r.coverageGaps=Array.isArray(r.coverageGaps)?r.coverageGaps:[];r.coverageGaps.push({at:now(),from:last,to:p,distanceM:Math.round(dist),reason:'LONG_GAP_OR_BACKGROUND'});}
    r.points.push(p);if(r.points.length>2500)r.points=r.points.slice(-2500);if(last&&dist<300)r.distanceM=Number(r.distanceM||0)+dist;r.lastPointAt=Date.now();Store.saveLite();RouteCoverage.paint();
  };
}

async function migrateAll(){
  let changed=false;for(const r of State.records||[])if(migrateRecord(r))changed=true;
  if(changed){try{await Promise.resolve(Store.saveBatch?.(State.records));}catch(_){}try{Reports.invalidate?.();Gallery.render?.();}catch(_){}}
}

let attempts=0;
async function start(){
  if(window.__ONE_V646_CORE_STARTED)return;
  if(typeof State==='undefined'||typeof Store==='undefined'||typeof Reports==='undefined'||typeof Editor==='undefined'||typeof GuidedEditor==='undefined'||typeof RouteCoverage==='undefined'){if(attempts++<80)setTimeout(start,120);return;}
  window.__ONE_V646_CORE_STARTED=true;patchMunicipal();patchGuidedTypes();patchEditor();patchRoute();await migrateAll();
  try{const applied=localStorage.getItem('oneshotAppliedBuild')||'';localStorage.setItem('oneshotRuntimeBuild',BUILD);if(!applied||compare(BUILD,applied)>=0)localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}
  document.title='ONE SHOT v6.4.6 · STABILITY + UX REPAIR';
}
window.ONE_V646_CORE={BUILD,TYPES,FieldRules,Municipal,start,migrateRecord};
window.addEventListener('load',()=>setTimeout(start,260),{once:true});if(document.readyState==='complete')setTimeout(start,260);
})();