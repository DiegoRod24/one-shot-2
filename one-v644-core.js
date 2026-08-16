/* ONE SHOT v6.4.4 · CONTINUITY SAFE FIX */
(()=>{
'use strict';
if(window.ONE_V644_CORE)return;
const BUILD='oneshot-v6.4.4-continuity-safe-fix-01';
const TYPES=new Set(['PANEL','BANNER','PINTA']);
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const now=()=>new Date().toISOString();
const clean=v=>String(v??'').trim();
const wasReviewed=r=>!!(r?.reviewTouched||r?.reviewedAt||r?.lastEditorSavedAt||r?.classificationDraft?.status==='completed'||(Array.isArray(r?.classificationAudit)&&r.classificationAudit.length));
const hasMunicipal=r=>!!clean(r?.municipality)&&!!clean(r?.municipalMayor);
const reviewState=r=>{
  if(!r)return'PENDIENTE';
  const complete=!!clean(r.party)&&TYPES.has(N(r.type));
  if(!wasReviewed(r)||!complete)return'PENDIENTE';
  const lowGps=Number(r.gps?.accuracy??r.accuracy??0)>60;
  return hasMunicipal(r)&&!lowGps&&!r.municipalBoundaryReview?'REVISADA':'REVISAR_UBICACION';
};
const reviewLabel=r=>reviewState(r)==='REVISADA'?'REVISADA':reviewState(r)==='REVISAR_UBICACION'?'REVISAR UBICACIÓN':'FALTA REVISAR';
const safeType=r=>TYPES.has(N(r?.type))?N(r.type):'PENDIENTE';
const saveAll=()=>{try{return Promise.resolve(Store.saveBatch?.(State.records));}catch(_){return Promise.resolve();}};
function audit(r,msg){r.continuityAuditV644=Array.isArray(r.continuityAuditV644)?r.continuityAuditV644:[];r.continuityAuditV644.push({at:now(),action:msg});if(r.continuityAuditV644.length>40)r.continuityAuditV644=r.continuityAuditV644.slice(-40);}
function restoreRecords(){
  let changed=false;
  for(const r of State.records||[]){
    if(N(r.type)==='PENDIENTE'&&N(r.legacyTypeV643)==='PINTA'){
      r.type='PINTA';audit(r,'RESTORE_PINTA_FROM_V643');changed=true;
    }
    const next=reviewState(r);
    if(r.reviewStatus!==next){r.reviewStatus=next;r.reviewUpdatedAt=now();changed=true;}
  }
  if(changed){saveAll();Reports.invalidate?.();}
}
function patchTypeUi(){
  const syncSelect=(r=Editor.current)=>{
    const e=document.getElementById('editType');if(!e)return;
    const current=TYPES.has(N(r?.type))?N(r.type):'PENDIENTE';
    e.innerHTML='<option value="PENDIENTE">PENDIENTE</option><option value="BANNER">BANNER</option><option value="PANEL">PANEL</option><option value="PINTA">PINTA</option>';
    e.value=current;
  };
  const populate=Editor.populateLists?.bind(Editor);
  if(populate&&!Editor.__v644Populate){Editor.__v644Populate=true;Editor.populateLists=r=>{populate(r);syncSelect(r);};}
  const steps=()=>[
    {key:'party',field:'editParty',question:'¿A qué partido u organización pertenece?',choices:()=>Array.isArray(window.ONE_PARTY_CATALOG_V631)?[...window.ONE_PARTY_CATALOG_V631.map(x=>[x.name,x.name]),['No identificado','']]:GuidedEditor.partyChoices?.()||[]},
    {key:'type',field:'editType',question:'¿Qué tipo de evidencia encontraste?',choices:()=>[['PANEL','PANEL'],['BANNER','BANNER'],['PINTA','PINTA']]},
    {key:'summary',question:'Listo. Revisa partido, tipo y destino antes de guardar.',choices:()=>[['✓ Guardar y siguiente','save-next'],['Guardar','save'],['← Corregir','back']]}
  ];
  GuidedEditor.steps=steps;
  const choose=GuidedEditor.choose?.bind(GuidedEditor);
  if(choose&&!GuidedEditor.__v644Choose){
    GuidedEditor.__v644Choose=true;
    GuidedEditor.choose=(v,o={})=>{
      const step=GuidedEditor.current?.();
      if(step?.key==='type'){
        const t=N(v);
        if(!TYPES.has(t)){GuidedEditor.say?.('En campo usamos Panel, Banner o Pinta.');return;}
        if(t==='PINTA'){
          const originalCurrent=GuidedEditor.current;
          GuidedEditor.current=()=>({...step,key:'type-v644'});
          try{return choose('PINTA',o);}finally{GuidedEditor.current=originalCurrent;}
        }
      }
      return choose(v,o);
    };
  }
  const open=Editor.open?.bind(Editor);
  if(open&&!Editor.__v644Open){Editor.__v644Open=true;Editor.open=id=>{const out=open(id);setTimeout(()=>{syncSelect(Editor.current);if(Editor.current){Editor.current.reviewStatus=reviewState(Editor.current);const tag=document.getElementById('v63Status');if(tag){tag.textContent=reviewLabel(Editor.current);tag.className='v63Tag '+(Editor.current.reviewStatus==='REVISADA'?'r':Editor.current.reviewStatus==='REVISAR_UBICACION'?'u':'p');}}},140);return out;};}
  const persist=Editor.persist?.bind(Editor);
  if(persist&&!Editor.__v644Persist){Editor.__v644Persist=true;Editor.persist=async options=>{const before=Editor.current;const out=await persist(options||{});const r=out||Editor.current||before;if(r){if(N(r.type)==='PINTA'||N(document.getElementById('editType')?.value)==='PINTA')r.type='PINTA';r.reviewStatus=reviewState(r);r.reviewUpdatedAt=now();await Promise.resolve(Store.save?.(r)).catch(()=>{});Reports.invalidate?.();}return out||r;};}
}
function patchExcel(){
  if(!Reports?.makeExcel||Reports.__v644Excel)return;
  Reports.__v644Excel=true;
  const previous=Reports.makeExcel.bind(Reports);
  Reports.makeExcel=async()=>{
    const rows=(Evidence.selectedForReport?.()||[]).slice();
    const snapshots=rows.map(r=>({r,type:r.type,reviewStatus:r.reviewStatus,legacyTypeV643:r.legacyTypeV643}));
    const file=await previous();
    for(const s of snapshots){if(N(s.type)==='PINTA'||N(s.legacyTypeV643)==='PINTA')s.r.type='PINTA';s.r.reviewStatus=reviewState(s.r);}
    await saveAll();
    if(!window.ExcelJS||!file)return file;
    try{
      const wb=new ExcelJS.Workbook();await wb.xlsx.load(await file.arrayBuffer());
      const ev=wb.getWorksheet('EVIDENCIAS');if(ev){rows.forEach((r,i)=>{const row=i+2;ev.getCell(row,12).value=safeType(r);ev.getCell(row,15).value=reviewLabel(r);});}
      const tech=wb.getWorksheet('DATOS_TECNICOS');if(tech){rows.forEach((r,i)=>{const row=i+2;tech.getCell(row,28).value=safeType(r);tech.getCell(row,37).value=reviewLabel(r);});}
      const cls=wb.getWorksheet('CLASIFICACION_COMPATIBLE');if(cls){rows.forEach((r,i)=>{const row=i+2;cls.getCell(row,20).value=safeType(r);cls.getCell(row,22).value=reviewLabel(r);});}
      const hist=wb.getWorksheet('HISTORIAL');if(hist){for(let row=2;row<=hist.rowCount;row++){const code=String(hist.getCell(row,9).text||'');const r=rows.find(x=>String(x.photoCode||'')===code);if(r)hist.getCell(row,6).value=safeType(r);}}
      const meta=wb.getWorksheet('METADATOS');if(meta){meta.getCell('B1').value='v6.4.4 · CONTINUITY SAFE FIX';meta.getCell('A9').value='Regla 6.4.4';meta.getCell('B9').value='Tipos operativos de campo: PANEL, BANNER y PINTA. PINTA recuperada de registros afectados por v6.4.3 cuando corresponde.';}
      const buf=await wb.xlsx.writeBuffer();return new File([buf],`ONE_SHOT_EVIDENCIAS_${Dates.date()}_v6_4_4.xlsx`,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    }catch(_){return file;}
  };
}
function improveFer(){
  if(document.getElementById('v644FerCss'))return;
  const s=document.createElement('style');s.id='v644FerCss';s.textContent=`
  html.v644Continuity #guidedRobot .ferAvatar{width:112px!important;height:124px!important;min-width:112px!important;min-height:124px!important}
  html.v644Continuity .editMiniAssistant .ferAvatar{width:88px!important;height:97px!important;min-width:88px!important;min-height:97px!important}
  html.v644Continuity .reportOneMascot .ferAvatar{width:94px!important;height:104px!important;min-width:94px!important;min-height:104px!important}
  html.v644Continuity #oneAssistantFab.ferFab{left:10px!important;bottom:82px!important;width:90px!important;height:62px!important}
  html.v644Continuity #oneAssistantFab.ferFab .ferAvatar{width:50px!important;height:56px!important;min-width:50px!important;min-height:56px!important}
  html.v644Continuity .ferAvatar[data-fer-state=idle] .ferPupilL,html.v644Continuity .ferAvatar[data-fer-state=idle] .ferPupilR{animation:v644Look 5s ease-in-out infinite}
  html.v644Continuity .ferAvatar[data-fer-state=listening] .ferHeadGroup,html.v644Continuity .ferAvatar[data-fer-state=waiting] .ferHeadGroup{transform-origin:61px 48px;animation:v644Listen .9s ease-in-out infinite alternate}
  html.v644Continuity .ferAvatar[data-fer-state=thinking] .ferPupilL,html.v644Continuity .ferAvatar[data-fer-state=thinking] .ferPupilR{transform:translate(2px,-2px)}
  html.v644Continuity .ferAvatar[data-fer-state=success]{animation:v644Success .65s ease-out 1!important}
  html.v644Continuity .ferAvatar[data-fer-state=observing] .ferHeadGroup{transform-origin:61px 48px;animation:v644Observe 1.4s ease-in-out infinite alternate}
  @keyframes v644Look{0%,20%,100%{transform:translateX(0)}35%,50%{transform:translateX(2px)}65%,80%{transform:translateX(-2px)}}
  @keyframes v644Listen{to{transform:rotate(4deg) translateY(-1px)}}
  @keyframes v644Observe{to{transform:rotate(-3deg) translateY(1px)}}
  @keyframes v644Success{35%{transform:translateY(-7px) scale(1.04)}70%{transform:translateY(0) scale(.99)}100%{transform:translateY(0) scale(1)}}
  `;document.head.appendChild(s);document.documentElement.classList.add('v644Continuity');
}
function copyFix(){
  document.querySelectorAll('#guidedHeard').forEach(e=>{if(/mural/i.test(e.textContent||''))e.textContent='Puedes decir: “es panel”, “es banner”, “es pinta”, “atrás” o “guardar”.';});
  const badge=document.querySelector('.assistantVersionBadge');if(badge)badge.textContent='6.4.4 CONTINUIDAD';
  document.title='ONE SHOT v6.4.4 · CONTINUIDAD';
  try{State.settings.assistantName='Fer';Store.saveLite?.();localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}
}
let attempts=0;
function start(){
  if(window.__ONE_V644_STARTED)return;
  if(typeof State==='undefined'||typeof Editor==='undefined'||typeof GuidedEditor==='undefined'||typeof Reports==='undefined'||typeof Evidence==='undefined'){if(attempts++<30)setTimeout(start,200);return;}
  window.__ONE_V644_STARTED=true;
  restoreRecords();patchTypeUi();patchExcel();improveFer();copyFix();
  setTimeout(()=>{restoreRecords();copyFix();try{window.FER_V642?.sync?.();}catch(_){}},500);
}
window.ONE_V644_CORE={BUILD,start,reviewState,safeType};
window.addEventListener('load',()=>setTimeout(start,180),{once:true});
if(document.readyState==='complete')setTimeout(start,180);
})();