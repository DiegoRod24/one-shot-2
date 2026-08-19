/* ONE SHOT v6.4.17 · PANEL PROVIDER FLOW */
(()=>{
'use strict';
if(window.ONE_V6417_PANEL_PROVIDER)return;
const BUILD='oneshot-v6.4.17-panel-provider-flow-01';
const PROVIDERS=[
['CARPET OUTDOORS',['CARPET']],
['FUNDACION LIMA',['FUNDACION']],
['JMT OUTDOORS S.A.C.',['JMT','JMT OUTDOORS']],
['INVENTA PUBLICIDAD S.A.C.',['INVENTA']],
['GLOWSIDE S.R.L.',['GLOWSIDE']],
['PUBLICA PUBLICIDAD Y TECNOLOGIA S.A.C. (PUBLICA / PUBLICA OUTDOOR)',['PUBLICA','PUBLICA OUTDOOR']],
['ANVI PUBLICIDAD OUTDOOR S.A.C.',['ANVI','ANVI OUTDOOR']],
['PUNTO VISUAL S.A.',['PUNTO VISUAL']],
['ILUMINITY S.A.C. (LEDEX)',['ILUMINITY','LEDEX']],
['SERVICIOS GENERALES JC LOPEZ S.A.C. (JC LOPEZ)',['JC LOPEZ','JC LÓPEZ']],
['MUNDO EXPRESS S.A.C. (CITYMEDIA / CITYMEDIA OUTDOOR)',['MUNDO EXPRESS','CITYMEDIA','CITYMEDIA OUTDOOR']],
['DARDOS DIGITAL OUTDOOR S.A.C.',['DARDOS','DARDOS DIGITAL']],
['INGENIERIA PERUANA DE PUBLICIDAD S.A.C.',['INGENIERIA PERUANA','INGENIERÍA PERUANA']],
['REYAM OUTDOOR SOCIEDAD ANONIMA CERRADA',['REYAM','REYAM OUTDOOR']],
['PUBLICIDAD CAPI S.A.C.',['CAPI','PUBLICIDAD CAPI']],
['STREET 11.01 S.A.C',['STREET 11 01','STREET']],
['IWALL PERU S.A.C.',['IWALL','IWALL PERU']],
['JCDECAUX PERU S.A.C.',['JCDECAUX','JC DECAUX']],
['ALAC OOH PERU S.A.C.',['ALAC','ALAC OOH']],
['PRODUCCION Y MANTENIMIENTO DEL PERU S.A.C.',['PRODUCCION Y MANTENIMIENTO','PRODUCCIÓN Y MANTENIMIENTO']],
['LA COBERTURA EXTERIOR S.A.C',['LA COBERTURA','COBERTURA EXTERIOR']],
['PETTY DIGITAL SOCIEDAD ANONIMA CERRADA',['PETTY','PETTY DIGITAL']],
['PS MEDIA SERVICE PERU S.A.C.',['PS MEDIA','PS MEDIA SERVICE']],
['PUBLICIDAD & COMUNICACIONES S.A.C.',['PUBLICIDAD Y COMUNICACIONES','PUBLICIDAD COMUNICACIONES']],
['PUBLISTYLE PERU SOCIEDAD ANONIMA CERRADA',['PUBLISTYLE','PUBLISTYLE PERU']],
['REAL PLAZA S.R.L.',['REAL PLAZA']],
['ROMAT PUBLICIDAD S.A.C.',['ROMAT']],
['STRONG MINDS PERU S.A.C.',['STRONG MINDS']],
['SUMAKTA E.I.R.L.',['SUMAKTA']],
['FISICOS Y GRAFICOS PUBLICITARIOS SOCIEDAD ANONIMA CERRADA - F & G PUBLICITARIOS S.A.C.',['FISICOS Y GRAFICOS','FÍSICOS Y GRÁFICOS','F Y G','F&G','F G PUBLICITARIOS']],
['PANELES NAPSA S.R.L.',['NAPSA','PANELES NAPSA']],
['BRASIL PUBLICIDAD EXTERIOR S.A.C.',['BRASIL PUBLICIDAD','BRASIL PUBLICIDAD EXTERIOR']],
['IP PUBLICIDAD SOCIEDAD ANONIMA CERRADA',['IP PUBLICIDAD']],
['ESTILOS PUBLICIDAD S.A.C.',['ESTILOS','ESTILOS PUBLICIDAD']],
['A & T STUDIO FOTOGRAFICO Y TURISMO EMPRESA INDIVIDUAL DE RESPONSABILIDAD LIMITADA',['A Y T STUDIO','A&T STUDIO','AT STUDIO']],
['FRAD PRINT S.AC',['FRAD','FRAD PRINT']],
['GRUPO GRAFEX HUANCAYO SOCIEDAD ANONIMA CERRADA',['GRAFEX','GRUPO GRAFEX']],
['PANEL VIA DIGITAL S.A.C',['PANEL VIA DIGITAL','VIA DIGITAL']],
['MAZ PUBLICIDAD EFECTIVA SOCIEDAD ANONIMA CERRADA',['MAZ','MAZ PUBLICIDAD']],
['PUBLIORIENTE S.A.C.',['PUBLIORIENTE']],
['NO SE VISUALIZA EMPRESA',['NO SE VISUALIZA','NO SE VE EMPRESA','SIN EMPRESA','NO VEO EMPRESA']],
['H & C Outdoors Sociedad Comercial de Responsabilidad Limitada',['H Y C OUTDOORS','H&C OUTDOORS','HC OUTDOORS']]
].map(([name,aliases])=>({name,aliases}));
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/&/g,' Y ').replace(/[^A-Z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const H=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const WAIT=ms=>new Promise(r=>setTimeout(r,ms));
let tries=0,providerMode=false,baseChoose=null,baseParse=null,baseBack=null,baseSkip=null,baseRender=null,baseOpen=null,baseSync=null;
const record=()=>{try{return Editor.current||null}catch(_){return null}};
const type=()=>String(document.getElementById('editType')?.value||record()?.type||'').trim().toUpperCase();
const knownName=v=>{const q=N(v);return PROVIDERS.find(p=>N(p.name)===q||p.aliases.some(a=>N(a)===q))?.name||String(v||'').trim()};
const provider=r=>String(r?.panelProvider||r?.provider||r?.company||r?.empresa||'').trim();
function draft(){const r=record();if(!r)return null;r.classificationDraft=r.classificationDraft||{answers:{},startedAt:new Date().toISOString(),status:'in-progress'};r.classificationDraft.answers=r.classificationDraft.answers||{};r.classificationDraft.version='6.4.17';return r.classificationDraft;}
function setProvider(r,value,source='guided'){
  if(!r)return;const v=knownName(value);const old=provider(r);r.panelProvider=v;r.provider=v;r.company=v;r.empresa=v;r.panelProviderManaged=true;r.panelProviderSource=source;r.panelProviderUpdatedAt=new Date().toISOString();r.panelProviderStatus=!v?'PENDIENTE':N(v)==='NO SE VISUALIZA EMPRESA'?'NO_VISIBLE':'IDENTIFICADO';r.panelProviderHistory=Array.isArray(r.panelProviderHistory)?r.panelProviderHistory:[];if(old!==v)r.panelProviderHistory.push({at:new Date().toISOString(),from:old,to:v,source});if(r.panelProviderHistory.length>80)r.panelProviderHistory=r.panelProviderHistory.slice(-80);
}
function clearManagedProvider(r){if(!r?.panelProviderManaged)return;r.panelProvider='';r.provider='';r.company='';r.empresa='';r.panelProviderStatus='NO_APLICA';r.panelProviderUpdatedAt=new Date().toISOString();}
function removeProviderSearch(){document.getElementById('v6417ProviderSearch')?.remove();}
function providerButtons(){return PROVIDERS.map(p=>`<button type="button" class="v6417ProviderBtn ${N(provider(record()))===N(p.name)?'selected':''}" data-guided-value="${H(p.name)}" data-guided-label="${H(p.name)}"><b>${H(p.name)}</b>${p.aliases.length?`<small>${H(p.aliases.slice(0,3).join(' · '))}</small>`:''}</button>`).join('');}
function filterProviders(){const input=document.getElementById('v6417ProviderInput'),count=document.getElementById('v6417ProviderCount'),q=N(input?.value);let visible=0;document.querySelectorAll('#guidedChoices .v6417ProviderBtn').forEach(b=>{const ok=!q||N(b.textContent).includes(q);b.hidden=!ok;if(ok)visible++;});if(count)count.textContent=`${visible} de ${PROVIDERS.length}`;}
function renderProvider(){
  if(!record()||type()!=='PANEL'){providerMode=false;removeProviderSearch();return baseRender?.();}
  providerMode=true;const ed=document.getElementById('guidedEditor');if(!ed)return;GuidedEditor.clearRecognition?.();GuidedEditor.robot?.('idle');GuidedEditor.pulseQuestion?.();ed.dataset.v6417Step='provider';
  const label=document.getElementById('guidedStepLabel'),bar=document.getElementById('guidedProgressBar'),q=document.getElementById('guidedQuestion'),help=document.getElementById('guidedQuestionHelp'),box=document.getElementById('guidedChoices'),text=document.getElementById('guidedTextAnswer'),back=document.getElementById('guidedBackBtn'),next=document.getElementById('guidedNextBtn'),skip=document.getElementById('guidedSkipBtn'),heard=document.getElementById('guidedHeard');
  if(label)label.textContent='Paso 3 de 4 · Proveedor del panel';if(bar)bar.style.width='75%';if(q)q.textContent='¿Qué proveedor se visualiza en el panel?';if(help)help.textContent='Busca, toca una empresa o dilo por voz. Si el panel no permite identificarla, elige “NO SE VISUALIZA EMPRESA”.';if(box)box.innerHTML=providerButtons();if(text)text.classList.remove('show');if(back){back.disabled=false;back.style.display='';}if(next)next.style.display='none';if(skip){skip.textContent='Dejar pendiente';skip.title='Continuar sin identificar todavía el proveedor';}if(heard)heard.textContent=GuidedEditor.listenRequested?'Micrófono activo · dime el nombre del proveedor.':'Toca un proveedor o habla. Fer avanzará automáticamente al reconocerlo.';
  removeProviderSearch();if(box){const search=document.createElement('div');search.id='v6417ProviderSearch';search.innerHTML='<input id="v6417ProviderInput" autocomplete="off" placeholder="🔎 Buscar proveedor"><small id="v6417ProviderCount"></small>';box.before(search);document.getElementById('v6417ProviderInput')?.addEventListener('input',filterProviders);filterProviders();}
  document.getElementById('guidedSaveNextBtn')?.classList.add('v6417ProviderHide');document.getElementById('guidedDeleteBtn')?.classList.add('v6417ProviderHide');GuidedEditor.say?.('Es un panel. ¿Qué proveedor se visualiza? Puedes decir, por ejemplo, JCDecaux, Citymedia, Ledex, JC López o elegirlo de la lista.');window.FerVisual?.scan?.();
}
async function chooseProvider(value,{source='tap',label='',raw='',showAutoRecognition=false}={}){
  const r=record();if(!r)return;const v=knownName(value),d=draft();if(showAutoRecognition)GuidedEditor.showRecognition?.(raw,v,label||v,{confidence:'alta',manualConfirm:false});setProvider(r,v,source);if(d){d.answers.provider=v;d.providerPending=false;d.providerAskedAt=new Date().toISOString();d.updatedAt=new Date().toISOString();}
  GuidedEditor.robot?.('success');window.FerVisual?.setState?.('success');const saved=await Store.save(r);if(!saved)throw new Error('No se pudo confirmar el proveedor en almacenamiento');const shown=v||'Proveedor pendiente';const heard=document.getElementById('guidedHeard');if(heard)heard.textContent=`✓ ${shown} · avanzando…`;GuidedEditor.say?.(v?`Perfecto. Registré ${shown}. Revisemos el resumen.`:'Dejé el proveedor pendiente. Revisemos el resumen.');providerMode=false;removeProviderSearch();await WAIT(180);if(window.ONE_V6416_EDIT_FLOW?.advance)return window.ONE_V6416_EDIT_FLOW.advance(shown);GuidedEditor.index=2;return GuidedEditor.render?.();
}
function findVoiceProvider(raw){const q=N(raw);if(!q)return null;if(/NO SE VISUALIZA|NO SE VE EMPRESA|SIN EMPRESA|NO VEO EMPRESA/.test(q))return PROVIDERS.find(p=>N(p.name)==='NO SE VISUALIZA EMPRESA');const exact=[];for(const p of PROVIDERS){const names=[p.name,...p.aliases].map(N).filter(x=>x.length>=3);if(names.some(x=>q===x||q.includes(x)))exact.push(p);}if(exact.length===1)return exact[0];let best=null,score=0,second=0;for(const p of PROVIDERS){for(const v of [p.name,...p.aliases]){const s=GuidedEditor.similarity?.(q,N(v))||0;if(s>score){second=score;score=s;best=p;}else if(s>second)second=s;}}return best&&score>=.68&&score-second>.09?best:null;}
async function parseVoice(raw){
  if(!providerMode)return baseParse?.(raw);const q=N(raw);if(!q)return;if(/ATRAS|ANTERIOR|REGRESA/.test(q))return guidedBack();if(/^SALTAR$|DEJAR PENDIENTE|NO SE TODAVIA/.test(q))return chooseProvider('',{source:'voice-skip',label:'Proveedor pendiente',raw});const p=findVoiceProvider(raw);if(p)return chooseProvider(p.name,{source:'voice-auto',label:p.name,raw,showAutoRecognition:true});GuidedEditor.robot?.('alert');GuidedEditor.showRecognition?.(raw,'','Proveedor no reconocido',{error:true});GuidedEditor.say?.('No reconocí con seguridad el proveedor. Dímelo otra vez o toca una opción de la lista.');
}
async function guidedChoose(value,opts={}){
  if(providerMode)return chooseProvider(value,opts);const k=String(GuidedEditor.current?.()?.key||'');if(k==='type'){
    const v=String(value||'').toUpperCase(),r=record();if(v==='PANEL'){
      const d=draft();if(d){d.providerPending=true;d.updatedAt=new Date().toISOString();}
      GuidedEditor.clearRecognition?.();if(opts.showAutoRecognition)GuidedEditor.showRecognition?.(opts.raw||'',v,opts.label||v,{confidence:'alta',manualConfirm:false});await GuidedEditor.recordValue?.(GuidedEditor.current?.(),v,opts.source||'tap');GuidedEditor.robot?.('success');GuidedEditor.say?.('Correcto. Es un panel. Ahora necesito identificar el proveedor.');providerMode=true;return setTimeout(renderProvider,120);
    }
    if(r){clearManagedProvider(r);const d=draft();if(d){d.providerPending=false;d.answers.provider='';}}
  }
  return baseChoose?.(value,opts);
}
function guidedBack(){if(providerMode){providerMode=false;removeProviderSearch();const d=draft();if(d)d.providerPending=true;return baseRender?.();}return baseBack?.();}
function guidedSkip(){if(providerMode)return chooseProvider('',{source:'skip',label:'Proveedor pendiente'}).catch(e=>UI.toast(e.message||String(e),3600));return baseSkip?.();}
function postRender(){
  ensureManualField();syncManualField();const k=String(GuidedEditor.current?.()?.key||'');const label=document.getElementById('guidedStepLabel'),bar=document.getElementById('guidedProgressBar'),q=document.getElementById('guidedQuestion');if(k==='party'){if(label)label.textContent='Paso 1 · Organización política';if(bar)bar.style.width='25%';}if(k==='type'){if(label)label.textContent='Paso 2 · Tipo de evidencia';if(bar)bar.style.width='50%';}if(k==='summary'){const p=provider(record());if(label)label.textContent=type()==='PANEL'?'Paso 4 de 4 · Confirmación':'Paso 3 de 3 · Confirmación';if(bar)bar.style.width='100%';if(type()==='PANEL'&&q)q.textContent=`${document.getElementById('editParty')?.value||'Partido pendiente'} · PANEL · Proveedor: ${p||'PENDIENTE'}. Revisa y guarda.`;}
  if(k!=='provider')removeProviderSearch();document.getElementById('guidedSaveNextBtn')?.classList.remove('v6417ProviderHide');document.getElementById('guidedDeleteBtn')?.classList.remove('v6417ProviderHide');
}
function providerOptions(current=''){const names=PROVIDERS.map(p=>p.name),cur=String(current||'').trim();return '<option value="">Proveedor pendiente</option>'+((cur&&!names.includes(cur))?`<option value="${H(cur)}">Histórico · ${H(cur)}</option>`:'')+names.map(n=>`<option value="${H(n)}">${H(n)}</option>`).join('');}
function ensureManualField(){
  if(document.getElementById('editPanelProvider'))return;const typeEl=document.getElementById('editType');if(!typeEl)return;const anchor=typeEl.closest('.field,.formField,.editField,.formGroup,.inputGroup')||typeEl.parentElement;if(!anchor?.parentElement)return;const wrap=document.createElement('div');wrap.id='v6417ManualProviderField';wrap.className='v6417ManualProviderField';wrap.innerHTML='<label for="editPanelProvider">Proveedor del panel</label><select id="editPanelProvider"></select><small>Solo aplica cuando el tipo es PANEL.</small>';anchor.insertAdjacentElement('afterend',wrap);const sel=document.getElementById('editPanelProvider');sel.addEventListener('change',()=>{const r=record();if(r&&type()==='PANEL')setProvider(r,sel.value,'manual');Editor.scheduleAutoSave?.();});typeEl.addEventListener('change',()=>setTimeout(syncManualField,0));
}
function syncManualField(){const wrap=document.getElementById('v6417ManualProviderField'),sel=document.getElementById('editPanelProvider');if(!wrap||!sel)return;const isPanel=type()==='PANEL',cur=provider(record());wrap.hidden=!isPanel;if(sel.dataset.loaded!==cur){sel.innerHTML=providerOptions(cur);sel.value=cur;sel.dataset.loaded=cur;}}
function patchEditor(){
  if(Editor.__v6417Provider)return;Editor.__v6417Provider=true;baseOpen=Editor.open?.bind(Editor);baseSync=Editor.syncRecordFromForm?.bind(Editor);if(baseSync)Editor.syncRecordFromForm=(r=Editor.current)=>{const out=baseSync(r);if(!r)return out;if(String(r.type||'').toUpperCase()==='PANEL'){const sel=document.getElementById('editPanelProvider');if(sel)setProvider(r,sel.value,'manual');}else clearManagedProvider(r);return out;};if(baseOpen)Editor.open=id=>{const out=baseOpen(id);setTimeout(()=>{ensureManualField();syncManualField();const r=record(),d=r?.classificationDraft;if(r&&String(r.type||'').toUpperCase()==='PANEL'&&!provider(r)&&d?.providerPending===true){providerMode=true;renderProvider();}else if(r&&String(r.type||'').toUpperCase()==='PANEL'&&!provider(r)&&!r.panelProviderAskedAt&&!d?.providerAskedAt){const dd=draft();if(dd)dd.providerPending=true;providerMode=true;renderProvider();}},420);return out;};}
function patchGallery(){if(Gallery.__v6417Provider)return;Gallery.__v6417Provider=true;const old=Gallery.render?.bind(Gallery);if(old)Gallery.render=(...a)=>{const out=old(...a);setTimeout(()=>{document.querySelectorAll('#evidenceList .eCard[data-id]').forEach(card=>{const r=State.records.find(x=>String(x.id)===String(card.dataset.id)),p=provider(r);card.querySelector('.v6417ProviderMeta')?.remove();if(String(r?.type||'').toUpperCase()==='PANEL'&&p){const meta=card.querySelector('.eMeta');if(meta){const s=document.createElement('span');s.className='v6417ProviderMeta';s.textContent=`🏢 ${p}`;meta.appendChild(s);}}});},0);return out;};}
function patchEvidenceDefaults(){if(Evidence.__v6417Provider)return;Evidence.__v6417Provider=true;const old=Evidence.make?.bind(Evidence);if(old)Evidence.make=(...a)=>{const r=old(...a);if(r){r.panelProvider=r.panelProvider||'';r.panelProviderStatus=r.panelProviderStatus||'NO_APLICA';}return r;};}
function css(){if(document.getElementById('v6417ProviderCss'))return;const s=document.createElement('style');s.id='v6417ProviderCss';s.textContent=`
#v6417ProviderSearch{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin:0 0 9px;position:sticky;top:0;z-index:5;background:#091b31;padding:4px 0 8px}#v6417ProviderSearch input{width:100%;border:1px solid #315b8b;border-radius:13px;padding:12px 14px;background:#fff;color:#10223d;font:inherit}#v6417ProviderCount{font-size:10px;color:#9db6d4;white-space:nowrap}#guidedEditor[data-v6417-step="provider"] #guidedChoices{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;max-height:49vh!important;overflow:auto!important;padding:4px!important}#guidedEditor[data-v6417-step="provider"] #guidedChoices .v6417ProviderBtn{min-height:76px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:5px!important;text-align:left!important;border-radius:15px!important;padding:11px 12px!important;background:#0d294b!important;border:1px solid #315b8b!important;color:#fff!important}#guidedEditor[data-v6417-step="provider"] #guidedChoices .v6417ProviderBtn b{font-size:11px;line-height:1.25}#guidedEditor[data-v6417-step="provider"] #guidedChoices .v6417ProviderBtn small{font-size:9px;color:#9fc1e8}#guidedEditor[data-v6417-step="provider"] #guidedChoices .v6417ProviderBtn.selected{border-color:#55a2ff!important;background:#154779!important;box-shadow:0 0 0 2px rgba(65,145,255,.2)!important}.v6417ProviderHide{display:none!important}.v6417ManualProviderField{display:grid;gap:6px}.v6417ManualProviderField label{font-weight:850}.v6417ManualProviderField select{width:100%;min-height:42px;border-radius:11px;padding:8px 10px}.v6417ManualProviderField small{font-size:10px;opacity:.72}.v6417ManualProviderField[hidden]{display:none!important}@media(max-width:700px){#guidedEditor[data-v6417-step="provider"] #guidedChoices{grid-template-columns:1fr!important;max-height:46vh!important}#v6417ProviderSearch{grid-template-columns:1fr}#v6417ProviderCount{white-space:normal}}
`;document.head.appendChild(s);}
function patchGuided(){
  if(GuidedEditor.__v6417Provider)return;GuidedEditor.__v6417Provider=true;baseChoose=GuidedEditor.choose?.bind(GuidedEditor);baseParse=GuidedEditor.parseVoice?.bind(GuidedEditor);baseBack=GuidedEditor.back?.bind(GuidedEditor);baseSkip=GuidedEditor.skip?.bind(GuidedEditor);baseRender=GuidedEditor.render?.bind(GuidedEditor);GuidedEditor.choose=guidedChoose;GuidedEditor.parseVoice=parseVoice;GuidedEditor.back=guidedBack;GuidedEditor.skip=guidedSkip;if(baseRender)GuidedEditor.render=(...a)=>{if(providerMode&&type()==='PANEL')return renderProvider();const out=baseRender(...a);setTimeout(postRender,0);return out;};
}
function start(){if(window.__ONE_V6417_PANEL_PROVIDER_STARTED)return;if(typeof GuidedEditor==='undefined'||typeof Editor==='undefined'||typeof Store==='undefined'||typeof Gallery==='undefined'||typeof Evidence==='undefined'){if(tries++<190)return void setTimeout(start,80);return;}window.__ONE_V6417_PANEL_PROVIDER_STARTED=true;css();patchGuided();patchEditor();patchGallery();patchEvidenceDefaults();ensureManualField();postRender();try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}document.documentElement.dataset.oneshotProviderBuild=BUILD;}
window.ONE_PANEL_PROVIDERS_V6417=PROVIDERS.map(p=>p.name);
window.ONE_V6417_PANEL_PROVIDER={BUILD,PROVIDERS,start,provider,setProvider,renderProvider};
window.addEventListener('load',()=>setTimeout(start,3650),{once:true});if(document.readyState==='complete')setTimeout(start,3650);
})();
