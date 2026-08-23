/* ONE SHOT v6.6.12 · FIELD FLOW CLEANUP */
(()=>{
'use strict';
if(window.ONE_V6612_FIELD_FLOW_CLEANUP)return;
const BUILD='oneshot-v6.6.12-field-flow-cleanup-01';
const D=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let rescueBusy=false,advancedOpen=false;

function installCss(){
  if(D('oneV6612FieldCss'))return;
  const s=document.createElement('style');
  s.id='oneV6612FieldCss';
  s.textContent=`
/* Assistant intentionally OFF while field flow is stabilized */
#oneAssistantFab,#assistantNudge,#oneAssistantModal,
[id^="assistantLive"],[class*="assistant-live" i],.oneAssistantFab,.assistantNudge,.oneAssistantSheet{
  display:none!important;visibility:hidden!important;pointer-events:none!important;
}
/* Stable rescue controls */
#editModal #editRescuePanel{position:relative!important;z-index:35!important;color:#fff!important;background:#071426!important;border:1px solid #29486d!important;pointer-events:auto!important;touch-action:pan-y!important}
#editModal #editRescuePanel.open{display:block!important;visibility:visible!important;pointer-events:auto!important}
#editModal #editRescuePanel .rescueHead b{color:#fff!important}
#editModal #editRescuePanel .rescueHead small,#editModal #editRescuePanel label{color:#c6d5e8!important}
#editModal #editRescuePanel button,#editModal #editRescuePanel input{pointer-events:auto!important;opacity:1!important}
#editModal #editRescuePanel button{touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
#editModal #editRescuePanel input[type="range"]{width:100%!important;min-height:34px!important;touch-action:none!important;accent-color:#2582ff!important}
#editModal #editRescuePanel .rescueButtons button.active{background:#2373ed!important;color:#fff!important;border-color:#83b7ff!important}
#editModal #rescueApplyBtn[data-busy="1"]{opacity:.72!important;pointer-events:none!important}
/* Field-first territory */
#viewPlaces .one-v6612-advanced.one-v6612-collapsed{display:none!important}
#viewPlaces #territoryUxGuide{display:none!important}
#oneV6612FieldMode{margin:12px 0;padding:15px 16px;border-radius:18px;background:linear-gradient(135deg,#0b3269,#1358b8);color:#fff;box-shadow:0 10px 24px #123a6920}
#oneV6612FieldMode b{display:block;font-size:18px;line-height:1.1}
#oneV6612FieldMode span{display:block;margin-top:5px;color:#d9e8ff;font-size:13px;line-height:1.35}
#oneV6612AdvancedToggle{width:100%;margin:14px 0;padding:14px 16px;border:1px solid #d4dfed;border-radius:16px;background:#fff;color:#153d73;font-weight:900;text-align:left;box-shadow:0 6px 18px #153d7310}
#oneV6612AdvancedToggle small{display:block;margin-top:4px;color:#74849a;font-weight:650;line-height:1.3}
#oneV6612AdvancedToggle[aria-expanded="true"]{background:#eaf3ff;border-color:#b7d2f7}
@media(max-width:700px){
  #editModal #editRescuePanel{margin:8px 10px 10px!important;padding:12px!important;border-radius:18px!important}
  #editModal #editRescuePanel .rescueButtons{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
  #editModal #editRescuePanel .rescueButtons button{min-width:0!important;min-height:44px!important;padding:8px 5px!important;font-size:13px!important}
  #editModal #editRescuePanel .rescueActions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}
  #editModal #editRescuePanel .rescueActions button{min-width:0!important;min-height:46px!important;white-space:normal!important}
  #editModal #rescueApplyBtn{grid-column:1/-1!important;min-height:52px!important}
  #viewPlaces .territoryPlanner,#viewPlaces .teamMissionCard,#viewPlaces .smartRouteCard{margin-top:12px!important}
}
`;
  document.head.appendChild(s);
}

function currentRecord(){
  try{
    if(typeof Editor!=='undefined'&&Editor.current)return Editor.current;
    const id=D('editId')?.value?.trim();
    if(id&&typeof State!=='undefined')return State.records?.find(r=>String(r.id)===id)||null;
  }catch(_){}
  return null;
}
function toast(text,ms=2600){try{UI?.toast?.(text,ms,{placement:'top',tone:'soft'})}catch(_){} }
function saveStatus(mode,text){try{Editor?.paintSaveStatus?.(mode,text)}catch(_){} }
function state(){
  try{return typeof EvidenceRescue!=='undefined'?EvidenceRescue.state:null}catch(_){return null}
}
function syncInputs(){
  const s=state();if(!s)return;
  if(D('rescueZoomInput'))D('rescueZoomInput').value=String(s.zoom??1);
  if(D('rescueXInput'))D('rescueXInput').value=String(s.x??0);
  if(D('rescueYInput'))D('rescueYInput').value=String(s.y??0);
  document.querySelectorAll('[data-rescue-aspect]').forEach(b=>b.classList.toggle('active',(b.dataset.rescueAspect||'original')===(s.aspect||'original')));
}
function preview(){
  const img=D('editEvidenceImg'),s=state();if(!img||!s)return;
  const z=Math.max(1,Math.min(2.4,Number(s.zoom||1)));
  const x=Math.max(-1,Math.min(1,Number(s.x||0)));
  const y=Math.max(-1,Math.min(1,Number(s.y||0)));
  img.style.transition='transform .12s ease, object-position .12s ease';
  img.style.transform=`rotate(${Number(s.rotation||0)}deg) scale(${Math.min(1.45,z)})`;
  img.style.objectPosition=`${50+x*25}% ${50+y*25}%`;
}
function resetRescue(){
  const s=state();if(!s)return;
  s.rotation=0;s.aspect='original';s.zoom=1;s.x=0;s.y=0;
  syncInputs();preview();
}
function openRescue(){
  const p=D('editRescuePanel');if(!p)return;
  p.classList.add('open');syncInputs();preview();
  requestAnimationFrame(()=>p.scrollIntoView?.({behavior:'smooth',block:'nearest'}));
}
function closeRescue(){D('editRescuePanel')?.classList.remove('open')}

async function applyRescue(){
  if(rescueBusy)return;
  const r=currentRecord();
  if(!r)return toast('No se encontró la evidencia activa');
  if(typeof EvidenceRescue==='undefined'||typeof EvidenceRescue.render!=='function')return toast('El editor de marco aún no está listo');
  rescueBusy=true;
  const btn=D('rescueApplyBtn'),old=btn?.textContent||'✓ Aplicar marco';
  if(btn){btn.dataset.busy='1';btn.textContent='Guardando marco…'}
  saveStatus('dirty','Aplicando marco…');
  try{
    await new Promise(requestAnimationFrame);
    const data=await EvidenceRescue.render();
    if(!data)throw new Error('No se pudo generar la imagen corregida');
    const s=state()||{rotation:0,aspect:'original',zoom:1,x:0,y:0};
    r.rescuedImage=data;
    r.rescueDerivedHash=await Evidence.imageHash(data);
    r.rescueHistory=Array.isArray(r.rescueHistory)?r.rescueHistory:[];
    r.rescueHistory.push({at:new Date().toISOString(),rotation:Number(s.rotation||0),aspect:s.aspect||'original',zoom:Number(s.zoom||1),x:Number(s.x||0),y:Number(s.y||0),derivedHash:r.rescueDerivedHash,source:'manual-field-v6612'});
    r.stampedImage=await Watermark.stamp(data,r);
    r.stampedHash=await Evidence.imageHash(r.stampedImage);
    r.updatedAt=new Date().toISOString();
    const saved=await Store.save(r);if(saved===false)throw new Error('No se pudo guardar en el dispositivo');
    if(D('editEvidenceImg'))D('editEvidenceImg').src=data;
    if(D('editImageOrientation')){D('editImageOrientation').textContent='AJUSTADA';D('editImageOrientation').classList.add('editDerivedBadge')}
    try{Reports?.invalidate?.()}catch(_){}
    closeRescue();resetRescue();saveStatus('saved','Marco guardado');toast('✓ Marco corregido · original conservado',1800);
    setTimeout(()=>{try{Gallery?.render?.()}catch(_){}},120);
  }catch(err){saveStatus('error','No se pudo aplicar el marco');toast(err?.message||String(err),3600)}
  finally{rescueBusy=false;if(btn){btn.dataset.busy='0';btn.textContent=old}}
}
async function restoreOriginal(){
  if(rescueBusy)return;
  const r=currentRecord();if(!r)return toast('No se encontró la evidencia activa');
  if(!r.rescuedImage)return toast('La evidencia ya usa el original');
  if(!confirm('¿Volver a usar la fotografía original? El historial del ajuste se conservará.'))return;
  rescueBusy=true;saveStatus('dirty','Restaurando original…');
  try{
    r.rescueHistory=Array.isArray(r.rescueHistory)?r.rescueHistory:[];
    r.rescueHistory.push({at:new Date().toISOString(),action:'restore-original',source:'manual-field-v6612'});
    delete r.rescuedImage;delete r.rescueDerivedHash;
    r.stampedImage=await Watermark.stamp(r.image,r);r.stampedHash=await Evidence.imageHash(r.stampedImage);r.updatedAt=new Date().toISOString();
    await Store.save(r);
    if(D('editEvidenceImg'))D('editEvidenceImg').src=r.image;
    if(D('editImageOrientation')){D('editImageOrientation').textContent=r.photoOrientation||'ORIGINAL';D('editImageOrientation').classList.remove('editDerivedBadge')}
    try{Reports?.invalidate?.()}catch(_){}
    closeRescue();resetRescue();saveStatus('saved','Original restaurado');toast('✓ Fotografía original restaurada',1800);
    setTimeout(()=>{try{Gallery?.render?.()}catch(_){}},120);
  }catch(err){saveStatus('error','No se pudo restaurar');toast(err?.message||String(err),3600)}finally{rescueBusy=false}
}

function handleRescueClick(e){
  const t=e.target?.closest?.('#editOpenRescueBtn,#editRescuePanel button,[data-rescue-rotate],[data-rescue-aspect]');
  if(!t)return;
  if(!D('editModal')?.classList.contains('open'))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(t.id==='editOpenRescueBtn')return openRescue();
  if(t.id==='editRescueClose')return closeRescue();
  if(t.id==='rescueResetBtn')return resetRescue();
  if(t.id==='rescueApplyBtn')return void applyRescue();
  if(t.id==='rescueRestoreOriginalBtn')return void restoreOriginal();
  const s=state();if(!s)return;
  if(t.dataset.rescueRotate!=null){s.rotation=Number(s.rotation||0)+Number(t.dataset.rescueRotate||0);preview();return}
  if(t.dataset.rescueAspect!=null){s.aspect=t.dataset.rescueAspect||'original';syncInputs();preview();return}
}
function handleRescueInput(e){
  if(!['rescueZoomInput','rescueXInput','rescueYInput'].includes(e.target?.id))return;
  const s=state();if(!s)return;
  if(e.target.id==='rescueZoomInput')s.zoom=Number(e.target.value||1);
  if(e.target.id==='rescueXInput')s.x=Number(e.target.value||0);
  if(e.target.id==='rescueYInput')s.y=Number(e.target.value||0);
  preview();
}

function assistantOff(){
  try{
    if(typeof State!=='undefined'&&State.settings){
      for(const k of ['assistantEnabled','assistantVoice','assistantAuto','assistantOcr','assistantMascot','assistantContextHelp','assistantGuidedEdit'])State.settings[k]=false;
    }
    D('oneAssistantFab')?.classList.add('isHidden');D('oneAssistantModal')?.classList.remove('open');D('assistantNudge')?.classList.remove('show');
    if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel?.();
  }catch(_){}
}

function advancedNodes(){return [D('territoryPlanner'),D('teamMissionCard'),D('smartRouteCard')].filter(Boolean)}
function setAdvanced(open){
  advancedOpen=!!open;
  advancedNodes().forEach(el=>{el.classList.add('one-v6612-advanced');el.classList.toggle('one-v6612-collapsed',!advancedOpen)});
  const b=D('oneV6612AdvancedToggle');if(b){b.setAttribute('aria-expanded',String(advancedOpen));b.innerHTML=advancedOpen?'▾ Ocultar planificación asignada<small>Vuelve al modo simple de recolección en campo.</small>':'▸ Planificación asignada · avanzado<small>Solo cuando coordinación te entregue una zona, sector o misión.</small>'}
}
function configureTerritory(){
  const view=D('viewPlaces');if(!view)return;
  advancedNodes().forEach(el=>el.classList.add('one-v6612-advanced'));
  let info=D('oneV6612FieldMode');
  if(!info){info=document.createElement('div');info.id='oneV6612FieldMode';info.innerHTML='<b>📍 Modo campo</b><span>Lo esencial: registra tu recorrido, marca tramos repetitivos y conserva los lugares/evidencias encontradas.</span>';const route=D('routeCoverageCard');route?.parentElement?.insertBefore(info,route)}
  let toggle=D('oneV6612AdvancedToggle');
  if(!toggle){toggle=document.createElement('button');toggle.id='oneV6612AdvancedToggle';toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.onclick=()=>setAdvanced(!advancedOpen)}
  const corridor=D('v6413CorridorCard'),route=D('routeCoverageCard');
  const anchor=corridor||route;if(anchor&&toggle.parentElement!==anchor.parentElement)anchor.insertAdjacentElement('afterend',toggle);else if(anchor&&toggle.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',toggle);
  setAdvanced(advancedOpen);
  const badge=view.querySelector('.v4Badge');if(badge)badge.textContent='MODO CAMPO';
}

function boot(){
  installCss();assistantOff();configureTerritory();
  document.addEventListener('click',handleRescueClick,true);
  document.addEventListener('input',handleRescueInput,true);
  document.querySelectorAll('.bottomNav button').forEach(b=>b.addEventListener('click',()=>{assistantOff();if(b.dataset.view==='Places')setTimeout(configureTerritory,60)},true));
  const places=D('viewPlaces');if(places&&!places.dataset.v6612Observed){places.dataset.v6612Observed='1';const o=new MutationObserver(()=>configureTerritory());o.observe(places,{childList:true,subtree:false})}
  let tries=0;const timer=setInterval(()=>{tries++;assistantOff();if(typeof State!=='undefined'&&typeof EvidenceRescue!=='undefined'){clearInterval(timer);configureTerritory();}else if(tries>160)clearInterval(timer)},40);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.ONE_V6612_FIELD_FLOW_CLEANUP={BUILD,configureTerritory,setAdvanced,applyRescue,restoreOriginal,openRescue};
})();
