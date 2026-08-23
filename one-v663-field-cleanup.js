/* ONE SHOT v6.6.3 · FIELD FLOW CLEANUP */
(()=>{
'use strict';
if(window.ONE_V663_FIELD_CLEANUP)return;
const BUILD='oneshot-v6.6.3-field-flow-cleanup-01';
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rec=()=>window.Editor?.current||null;
const catalog=()=>Array.isArray(window.ONE_PARTY_CATALOG_V6410)?window.ONE_PARTY_CATALOG_V6410:[];
const providers=()=>Array.isArray(window.ONE_V653_EDIT_CORE?.PROVIDERS)?window.ONE_V653_EDIT_CORE.PROVIDERS:[
'JCDECAUX PERU S.A.C.','PANELES NAPSA S.R.L.','PUBLICA PUBLICIDAD Y TECNOLOGIA S.A.C. (PUBLICA / PUBLICA OUTDOOR)','MUNDO EXPRESS S.A.C. (CITYMEDIA / CITYMEDIA OUTDOOR)','ILUMINITY S.A.C. (LEDEX)','NO SE VISUALIZA EMPRESA'
];
function hideLegacyEditorNoise(modal){
  const selectors=['[id*="guided" i]','[class*="guided" i]','[id*="fer" i]','[class*="fer" i]','[id*="voice" i]','[class*="voice" i]','[id*="ocr" i]','[class*="ocr" i]'];
  selectors.forEach(s=>qsa(s,modal).forEach(el=>{if(!el.closest('#oneV663QuickEditor'))el.classList.add('one-v663-hidden')}));
  qsa('button,div,section,article',modal).forEach(el=>{
    if(el.closest('#oneV663QuickEditor'))return;
    const t=(el.textContent||'').trim().toLowerCase();
    if(!t)return;
    if(/(^|\s)(hablar|fer · lectura sugerida|ocr de la foto|aplicar sugerencias|analizar)(\s|$)/i.test(t)){
      const card=el.closest('section,article,.card,.panel,.assistant-card')||el;
      card.classList.add('one-v663-hidden');
    }
  });
  qsa('h1,h2,h3',modal).forEach(h=>{if(/editar con fer/i.test(h.textContent||''))h.textContent='Editar evidencia'});
}
function syncDom(r){
  const p=qs('#editParty'),t=qs('#editType');
  if(p){if(r.party&&![...p.options].some(o=>o.value===r.party))p.add(new Option(r.party,r.party));p.value=r.party||'';p.dispatchEvent(new Event('change',{bubbles:true}));}
  if(t){t.value=r.type||'';t.dispatchEvent(new Event('change',{bubbles:true}));}
}
async function saveClassify(values){
  const r=rec();if(!r)throw Error('No hay evidencia activa');
  r.party=values.party||'';r.type=(values.type||'').toUpperCase();
  if(r.type==='PANEL'){
    const p=values.provider||'';r.panelProvider=r.provider=r.company=r.empresa=p;r.panelProviderStatus=p?(p==='NO SE VISUALIZA EMPRESA'?'NO_VISIBLE':'IDENTIFICADO'):'PENDIENTE';
  }else if(r.panelProviderManaged){r.panelProvider=r.provider=r.company=r.empresa='';}
  r.updatedAt=new Date().toISOString();r.reviewTouched=true;
  try{window.ReviewState?.apply?.(r,{reason:'V663_MANUAL_EDIT'});}catch(_){ }
  const ok=await window.Store?.save?.(r);if(ok===false)throw Error('No se pudo guardar');
  try{window.Reports?.invalidate?.();}catch(_){ }
  syncDom(r);return r;
}
function quickEditor(modal){
  if(qs('#oneV663QuickEditor',modal))return;
  const host=qs('.modal-content,.modal-card,.edit-modal-content',modal)||modal.firstElementChild||modal;
  const r=rec()||{};const parties=catalog();
  const box=document.createElement('section');box.id='oneV663QuickEditor';
  box.innerHTML=`<h3>Clasificación rápida</h3><p class="one-v663-help">Manual y táctil. Elige organización, tipo y proveedor solo si corresponde.</p>
  <div class="one-v663-field"><label>Organización política</label><input id="oneV663PartySearch" list="oneV663PartyList" autocomplete="off" placeholder="Buscar partido o movimiento" value="${E(r.party||'')}"><datalist id="oneV663PartyList">${parties.map(x=>`<option value="${E(x.name)}"></option>`).join('')}</datalist></div>
  <div class="one-v663-field"><label>Tipo de evidencia</label><div class="one-v663-type-grid">${['PANEL','BANNER','PINTA'].map(x=>`<button type="button" class="one-v663-type ${r.type===x?'is-active':''}" data-one-type="${x}">${x}</button>`).join('')}</div></div>
  <div class="one-v663-field" id="oneV663ProviderWrap" ${r.type==='PANEL'?'':'hidden'}><label>Empresa del panel</label><input id="oneV663Provider" list="oneV663ProviderList" placeholder="Empresa o No se visualiza" value="${E(r.panelProvider||r.provider||r.company||r.empresa||'')}"><datalist id="oneV663ProviderList">${providers().map(x=>`<option value="${E(x)}"></option>`).join('')}</datalist></div>
  <div class="one-v663-status" id="oneV663EditStatus">Toca una opción y guarda. La foto original no se modifica.</div>`;
  const firstBody=qs('.edit-body,.modal-body',host);if(firstBody)firstBody.prepend(box);else host.insertBefore(box,host.children[1]||null);
  let selectedType=(r.type||'').toUpperCase();
  box.addEventListener('click',e=>{const b=e.target.closest('[data-one-type]');if(!b)return;selectedType=b.dataset.oneType;qsa('[data-one-type]',box).forEach(x=>x.classList.toggle('is-active',x===b));qs('#oneV663ProviderWrap',box).hidden=selectedType!=='PANEL';});
  const commit=async()=>{const status=qs('#oneV663EditStatus',box);try{status.className='one-v663-status';status.textContent='Guardando…';await saveClassify({party:qs('#oneV663PartySearch',box).value.trim(),type:selectedType,provider:qs('#oneV663Provider',box)?.value.trim()||''});status.className='one-v663-status ok';status.textContent='✓ Clasificación guardada';}catch(err){status.className='one-v663-status err';status.textContent='No se pudo guardar: '+(err.message||err);}};
  qs('#oneV663PartySearch',box).addEventListener('change',commit);qs('#oneV663Provider',box)?.addEventListener('change',commit);box.addEventListener('click',e=>{if(e.target.closest('[data-one-type]'))setTimeout(commit,0)});
}
function cleanEditor(){const m=qs('#editModal');if(!m||!m.classList.contains('open'))return;hideLegacyEditorNoise(m);quickEditor(m);}
function findCardByText(root,re){return qsa('section,article,div',root).find(el=>{const t=(el.querySelector('h1,h2,h3,h4')?.textContent||'').trim();return re.test(t)})||null;}
function cleanTerritory(){
  const root=qs('#viewPlaces,.places-view,[data-view="places"]')||document;
  const heading=qsa('h1,h2',root).find(x=>/territorio/i.test(x.textContent||''));if(!heading)return;
  if(!qs('#oneV663TerritoryIntro',root)){
    const intro=document.createElement('section');intro.id='oneV663TerritoryIntro';intro.innerHTML='<strong>Territorio · herramientas de campo</strong><div style="margin-top:4px;font-size:13px;opacity:.88">Usa solo lo que necesites. Tomar evidencia siempre funciona sin zona asignada.</div><div class="one-v663-territory-actions"><button class="one-v663-territory-btn" data-go="route">▶ Recorrido libre<small>Registra por dónde ya inspeccionaste.</small></button><button class="one-v663-territory-btn" data-go="corridor">🛣 Tramo repetitivo<small>Pancartas/carteles repetidos en postes de una vía.</small></button><button class="one-v663-territory-btn" data-go="plan">🎯 Zona planificada<small>Solo para una zona o misión asignada.</small></button></div>';
    heading.closest('header,section,div')?.insertAdjacentElement('afterend',intro);
    intro.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;const map={route:/cobertura de ruta/i,corridor:/tramo de propaganda repetitiva/i,plan:/planificaci[oó]n territorial/i};const card=findCardByText(root,map[b.dataset.go]);card?.scrollIntoView({behavior:'smooth',block:'start'});if(b.dataset.go==='plan')qsa('[data-one-v663-plan]',root).forEach(x=>x.classList.remove('one-v663-hidden'));});
  }
  // Quita duplicados explicativos del camino principal.
  qsa('section,article,div',root).forEach(el=>{const h=(el.querySelector('h1,h2,h3,h4')?.textContent||'').trim();if(/^(Lugares sincronizados|Flujo territorial)$/i.test(h))el.classList.add('one-v663-hidden')});
  const plan=findCardByText(root,/planificaci[oó]n territorial/i);const smart=findCardByText(root,/smart sector coverage/i);
  [plan,smart].filter(Boolean).forEach(el=>{el.dataset.oneV663Plan='1';el.classList.add('one-v663-hidden')});
  if(plan&&!qs('#oneV663PlanToggle',root)){
    const wrap=document.createElement('div');wrap.className='one-v663-optional-wrap';wrap.innerHTML='<button id="oneV663PlanToggle" class="one-v663-optional-toggle">🎯 Mostrar zona planificada (opcional)</button><div class="one-v663-optional-note">Úsalo cuando coordinación te haya asignado o cargado una zona.</div>';
    plan.parentElement?.insertBefore(wrap,plan);qs('#oneV663PlanToggle',wrap).onclick=()=>{[plan,smart].filter(Boolean).forEach(x=>x.classList.toggle('one-v663-hidden'));qs('#oneV663PlanToggle',wrap).textContent=plan.classList.contains('one-v663-hidden')?'🎯 Mostrar zona planificada (opcional)':'Ocultar zona planificada';};
  }
}
let pending=false;const run=()=>{pending=false;cleanEditor();cleanTerritory();};const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(run)};
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});document.addEventListener('click',()=>setTimeout(schedule,0),true);window.addEventListener('load',schedule,{once:true});schedule();
window.ONE_V663_FIELD_CLEANUP={BUILD,run};
})();
