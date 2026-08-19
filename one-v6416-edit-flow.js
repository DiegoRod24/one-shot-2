/* ONE SHOT v6.4.16 · DETERMINISTIC GUIDED EDIT FLOW */
(()=>{
'use strict';
if(window.ONE_V6416_EDIT_FLOW)return;
const BUILD='oneshot-v6.4.16-edit-flow-evidence-recovery-01';
const FLOW=['party','type','summary'];
const VALID_TYPES=new Set(['PANEL','BANNER','PINTA']);
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let tries=0,ferObserver=null;

function key(){try{return String(GuidedEditor.current?.()?.key||FLOW[Number(GuidedEditor.index)||0]||'party')}catch(_){return'party'}}
function draft(){const r=Editor.current;if(!r)return null;r.classificationDraft=r.classificationDraft||{answers:{},startedAt:new Date().toISOString(),status:'in-progress'};r.classificationDraft.answers=r.classificationDraft.answers||{};r.classificationDraft.version='6.4.16';return r.classificationDraft;}
function setStep(i,{render=true}={}){
  const idx=Math.max(0,Math.min(Number(i)||0,2));GuidedEditor.index=idx;const d=draft();if(d){d.currentStep=idx;d.updatedAt=new Date().toISOString();}
  if(render)GuidedEditor.render?.();setTimeout(polish,0);setTimeout(repairFer,30);
}
function currentFieldValue(k=key()){
  if(k==='party')return String(document.getElementById('editParty')?.value||'').trim();
  if(k==='type')return String(document.getElementById('editType')?.value||'').trim().toUpperCase();
  return'';
}
function validForStep(k,v){if(k==='party')return true;if(k==='type')return VALID_TYPES.has(String(v||'').toUpperCase());return false;}
async function persistStep(nextIndex){const r=Editor.current,d=draft();if(!r||!d)throw new Error('No hay evidencia activa');d.currentStep=nextIndex;d.updatedAt=new Date().toISOString();const saved=await Store.save(r);if(!saved)throw new Error('No se pudo confirmar el guardado de este paso');return saved;}
async function advance(label=''){
  const i=Math.max(0,Math.min(Number(GuidedEditor.index)||0,2));if(i>=2)return;
  const next=i+1;const d=draft();if(d)d.currentStep=next;
  if(label){const heard=document.getElementById('guidedHeard');if(heard)heard.textContent=`✓ ${label} · avanzando…`;}
  await persistStep(next);await wait(230);setStep(next);
}
async function choose(value,{source='tap',label='',raw='',showAutoRecognition=false}={}){
  const k=key(),v=String(value??'');
  GuidedEditor.clearRecognition?.();
  if(k==='summary'){
    if(v==='save-next')return GuidedEditor.saveNext?.();
    if(v==='save')return GuidedEditor.finish?.(false);
    if(v==='back')return GuidedEditor.back?.();
    return;
  }
  if(!FLOW.includes(k))return;
  if(!validForStep(k,v)){
    GuidedEditor.robot?.('alert');GuidedEditor.say?.(k==='type'?'En este flujo usa PANEL, BANNER o PINTA.':'Elige una organización o deja el dato pendiente.');return;
  }
  if(showAutoRecognition)GuidedEditor.showRecognition?.(raw,v,label||v,{confidence:'alta',manualConfirm:false});
  const box=document.getElementById('guidedChoices');box?.classList.add('v6416Advancing');
  try{
    await GuidedEditor.recordValue?.(GuidedEditor.current?.(),v,source);
    const d=draft();if(d){d.answers[k]=v;d.lastAutoAdvanceAt=new Date().toISOString();d.lastAutoAdvanceSource=source;}
    GuidedEditor.robot?.('success');window.FerVisual?.setState?.('success');
    const shown=label||v||(k==='party'?'Partido pendiente':'Dato pendiente');
    const speech=k==='party'?`Perfecto. Registré ${shown}. Ahora dime qué tipo de propaganda es.`:`Perfecto. Registré ${shown}. Revisemos el resumen.`;
    GuidedEditor.say?.(speech);
    await advance(shown);
  }catch(e){console.error('ONE SHOT guided choose',e);GuidedEditor.robot?.('error');UI?.toast?.('No pude guardar esta respuesta. La evidencia sigue abierta para reintentar.',3600);}
  finally{box?.classList.remove('v6416Advancing');}
}
function skip(){
  const k=key();if(k==='summary')return GuidedEditor.back?.();
  const d=draft();if(d){d.skippedSteps=Array.isArray(d.skippedSteps)?d.skippedSteps:[];if(!d.skippedSteps.includes(k))d.skippedSteps.push(k);d.updatedAt=new Date().toISOString();}
  GuidedEditor.clearRecognition?.();GuidedEditor.robot?.('idle');advance('Pendiente').catch(e=>{console.error('guided skip persist',e);UI?.toast?.('No pude guardar el paso pendiente. La evidencia sigue abierta.',3400);});
}
function next(){
  const k=key();if(k==='summary')return;
  const v=currentFieldValue(k);if(k==='party'||k==='type'){
    if((k==='party'&&v!=='')||(k==='type'&&VALID_TYPES.has(v)))return advance(v).catch(e=>{console.error('guided next persist',e);UI?.toast?.('No pude confirmar el guardado. Intenta otra vez.',3200);});
    GuidedEditor.robot?.('help');return GuidedEditor.say?.('Elige una opción. Si quieres dejar este dato pendiente, usa “Dejar pendiente”.');
  }
}
function catalogChoices(){
  const c=window.ONE_PARTY_CATALOG_V6410||window.ONE_PARTY_CATALOG_V648||window.ONE_PARTY_CATALOG_V631||[];
  return Array.isArray(c)?c.map(x=>[String(x.name||x.label||''),String(x.name||x.label||'')]).filter(x=>x[0]):[];
}
async function parseVoice(raw){
  const k=key(),q=N(raw);if(!q)return;
  if(k==='type'){
    const found=/\bPANEL\b|VALLA|CARTEL GRANDE/.test(q)?'PANEL':/\bBANNER\b|BANDEROLA|LONA/.test(q)?'BANNER':/\bPINTA\b|PARED PINTADA|PINTADO/.test(q)?'PINTA':'';
    if(found)return choose(found,{source:'voice-auto',label:found,raw,showAutoRecognition:true});
    GuidedEditor.robot?.('alert');return GuidedEditor.say?.('No pude asociarlo. En este paso dime panel, banner o pinta.');
  }
  if(k==='party'){
    if(/NO SE|NO IDENTIF|SIN PARTIDO|NO VEO/.test(q))return choose('',{source:'voice-auto',label:'Partido pendiente',raw,showAutoRecognition:true});
    const choices=catalogChoices(),exact=choices.filter(([lab])=>{const n=N(lab);return q===n||q.includes(n)||n.includes(q)});
    if(exact.length===1)return choose(exact[0][1],{source:'voice-auto',label:exact[0][0],raw,showAutoRecognition:true});
    const scored=choices.map(([lab,val])=>({lab,val,score:GuidedEditor.similarity?.(q,N(lab))||0})).sort((a,b)=>b.score-a.score);
    if(scored[0]?.score>=.82&&(scored.length<2||scored[0].score-scored[1].score>.12))return choose(scored[0].val,{source:'voice-auto',label:scored[0].lab,raw,showAutoRecognition:true});
    if(scored[0]?.score>=.55){GuidedEditor.propose?.(scored[0].val,raw,scored[0].lab,scored[0].score>=.7?'media':'baja');return;}
    GuidedEditor.robot?.('alert');return GuidedEditor.say?.('No reconocí con seguridad la organización. Prueba otra vez o toca su tarjeta.');
  }
  return window.ONE_V6416_EDIT_FLOW?.baseParseVoice?.(raw);
}
function repairFer(){
  const hosts=[document.getElementById('guidedRobot'),document.getElementById('editMiniAssistant')].filter(Boolean);
  for(const host of hosts){
    host.style.removeProperty('display');host.style.removeProperty('visibility');host.style.opacity='1';
    const sprite=host.querySelector('.ferSpriteV6412');
    if(!sprite&&window.FerVisual?.mount){delete host.dataset.v6412FerMounted;host.classList.remove('ferV6412Host');try{window.FerVisual.mount(host);}catch(_){}}
    const mounted=host.querySelector('.ferSpriteV6412');
    if(mounted){mounted.style.display='inline-block';host.classList.add('v6416FerVisible');}
    else{host.classList.remove('ferV6412Host');const legacy=host.querySelector('.ferAvatar');if(legacy)legacy.style.setProperty('display','block','important');}
  }
  window.FerVisual?.setState?.(window.FerVisual.current||'idle');
}
function polish(){
  const ed=document.getElementById('guidedEditor');if(!ed)return;const k=key();ed.dataset.v6416Step=k;
  const skipBtn=document.getElementById('guidedSkipBtn');if(skipBtn){skipBtn.textContent=k==='summary'?'← Corregir':'Dejar pendiente';skipBtn.title=k==='summary'?'Volver al paso anterior':'Continuar sin completar este dato';}
  const nextBtn=document.getElementById('guidedNextBtn');if(nextBtn)nextBtn.style.display='none';
  const heard=document.getElementById('guidedHeard');if(heard&&!GuidedEditor.listenRequested)heard.textContent=k==='summary'?'Revisa el resumen y guarda.':'Toca una opción o habla. Al reconocerla, Fer guardará y avanzará automáticamente.';
  repairFer();
}
function css(){if(document.getElementById('v6416EditFlowCss'))return;const s=document.createElement('style');s.id='v6416EditFlowCss';s.textContent=`
#guidedRobot{display:grid!important;visibility:visible!important;opacity:1!important;min-height:104px!important}
#guidedRobot.v6416FerVisible .ferSpriteV6412.hero{width:92px!important;min-width:92px!important}
#guidedRobot .v6412FerIdentity{display:grid!important;opacity:1!important}
#guidedRobot .v6412FerIdentity b{font-size:16px!important;color:#fff!important}
#guidedChoices.v6416Advancing{pointer-events:none;opacity:.78}
#guidedEditor[data-v6416-step="party"] #guidedSaveNextBtn,#guidedEditor[data-v6416-step="party"] #guidedDeleteBtn,#guidedEditor[data-v6416-step="type"] #guidedSaveNextBtn,#guidedEditor[data-v6416-step="type"] #guidedDeleteBtn{display:none!important}
#guidedEditor[data-v6416-step="party"] #guidedSkipBtn,#guidedEditor[data-v6416-step="type"] #guidedSkipBtn{background:transparent!important;border:1px solid #35506f!important;color:#b9cbe1!important;font-weight:750!important}
#guidedEditor[data-v6416-step="summary"] #guidedSkipBtn{background:#10243e!important;color:#fff!important}
@media(max-width:740px){#guidedRobot.v6416FerVisible .ferSpriteV6412.hero{width:78px!important;min-width:78px!important}}
`;document.head.appendChild(s);}
function patch(){
  if(GuidedEditor.__v6416Deterministic)return;GuidedEditor.__v6416Deterministic=true;
  const oldParse=GuidedEditor.parseVoice?.bind(GuidedEditor);window.ONE_V6416_EDIT_FLOW.baseParseVoice=oldParse;
  GuidedEditor.choose=choose;GuidedEditor.skip=skip;GuidedEditor.next=next;GuidedEditor.parseVoice=parseVoice;
  const oldRender=GuidedEditor.render?.bind(GuidedEditor);if(oldRender)GuidedEditor.render=(...a)=>{const out=oldRender(...a);setTimeout(polish,0);setTimeout(repairFer,80);return out;};
  const oldStart=GuidedEditor.start?.bind(GuidedEditor);if(oldStart)GuidedEditor.start=(...a)=>{const out=oldStart(...a);setTimeout(()=>{const d=draft();if(d&&(!Number.isInteger(Number(d.currentStep))||Number(d.currentStep)>2))d.currentStep=0;setStep(Number(d?.currentStep)||0);},40);return out;};
  const oldOpen=Editor.open?.bind(Editor);if(oldOpen&&!Editor.__v6416FerOpen){Editor.__v6416FerOpen=true;Editor.open=(...a)=>{const out=oldOpen(...a);setTimeout(repairFer,80);setTimeout(repairFer,500);return out;};}
  const host=document.getElementById('guidedRobot');if(host&&window.MutationObserver&&!ferObserver){ferObserver=new MutationObserver(()=>setTimeout(repairFer,0));ferObserver.observe(host,{childList:true,subtree:true});}
}
function start(){if(window.__ONE_V6416_EDIT_FLOW_STARTED)return;if(typeof GuidedEditor==='undefined'||typeof Editor==='undefined'||typeof Store==='undefined'){if(tries++<160)return void setTimeout(start,80);return;}window.__ONE_V6416_EDIT_FLOW_STARTED=true;css();patch();repairFer();polish();}
window.ONE_V6416_EDIT_FLOW={BUILD,start,choose,advance,repairFer,polish,baseParseVoice:null};
window.addEventListener('load',()=>setTimeout(start,3100),{once:true});if(document.readyState==='complete')setTimeout(start,3100);
})();
