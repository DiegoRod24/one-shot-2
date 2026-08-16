/* ONE SHOT v6.4.6 · EVIDENCE UX REPAIR */
(()=>{
'use strict';
if(window.ONE_V646_EVIDENCE)return;
const BUILD='oneshot-v6.4.6-stability-ux-repair-01';
let index=0,tries=0;
const escText=v=>String(v??'');
const rules=()=>window.ONE_V646_CORE?.FieldRules;
const image=r=>r?.rescuedImage||r?.stampedImage||r?.image||'';
const visible=()=>{try{return Evidence.visible?.()||[];}catch(_){return[];}};

function css(){if(document.getElementById('v646EvidenceCss'))return;const s=document.createElement('style');s.id='v646EvidenceCss';s.textContent=`
  #selectionBar.open #selectionNoneBtn{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;position:static!important;width:auto!important;height:auto!important;clip:auto!important;clip-path:none!important;overflow:visible!important;padding:8px 10px!important;border:1px solid rgba(255,255,255,.18)!important;border-radius:12px!important;background:rgba(255,255,255,.12)!important;color:#fff!important;font-weight:900!important}
  #selectionBar.open{display:grid!important;grid-template-columns:minmax(150px,1fr) auto auto auto auto!important;gap:7px!important;align-items:center!important}
  .v646QuickToggle{border:1px solid #d3deec;background:#fff;color:#173b70;border-radius:12px;padding:9px 11px;font-weight:850}
  .v646QuickReview{display:none;margin:10px 0 12px;border:1px solid #dce5f1;border-radius:19px;background:#07152e;color:#fff;overflow:hidden;box-shadow:0 12px 30px rgba(13,41,82,.14)}
  .v646QuickReview.open{display:grid;grid-template-columns:minmax(240px,.9fr) 1.1fr}
  .v646QuickMedia{position:relative;min-height:300px;background:#020916;display:grid;place-items:center}.v646QuickMedia img{width:100%;height:100%;max-height:52vh;object-fit:contain}
  .v646QuickCounter{position:absolute;left:10px;top:10px;background:rgba(4,15,36,.78);border-radius:999px;padding:6px 9px;font-size:10px;font-weight:900}
  .v646QuickBody{padding:15px;display:flex;flex-direction:column;gap:10px}.v646QuickBody h3{margin:0;font-size:20px}.v646QuickBody p{margin:0;color:#b9c9df;line-height:1.4;font-size:12px}
  .v646QuickChips{display:flex;gap:6px;flex-wrap:wrap}.v646QuickChips span{padding:6px 8px;border-radius:999px;background:#163b72;color:#eaf4ff;font-size:9px;font-weight:900}
  .v646QuickNav,.v646QuickActions{display:flex;gap:7px;flex-wrap:wrap}.v646QuickNav button,.v646QuickActions button{border:1px solid #335b91;border-radius:11px;background:#0e2b59;color:#fff;padding:9px 11px;font-weight:850}.v646QuickActions .primary{background:#1f6fe5;border-color:#1f6fe5}
  @media(max-width:720px){#selectionBar.open{grid-template-columns:1fr repeat(4,auto)!important}.v646QuickReview.open{grid-template-columns:1fr}.v646QuickMedia{min-height:260px}.v646QuickBody{padding:12px}}
  @media(max-width:480px){#selectionBar.open{grid-template-columns:1fr repeat(3,auto)!important}#selectionBar.open .selectionSummary{grid-column:1/-1}.v646QuickActions button{flex:1 1 42%}}
`;document.head.appendChild(s);}

function ensureUi(){
  const head=document.querySelector('#viewEvidence .headActions'),search=document.getElementById('searchInput');if(!head||!search)return;
  if(!document.getElementById('v646QuickToggle')){const b=document.createElement('button');b.id='v646QuickToggle';b.type='button';b.className='v646QuickToggle';b.textContent='▣ Revisión rápida';head.insertBefore(b,document.getElementById('selectVisibleBtn')||null);b.onclick=()=>{const p=document.getElementById('v646QuickReview');p?.classList.toggle('open');if(p?.classList.contains('open')){index=0;paint();}};}
  if(!document.getElementById('v646QuickReview')){const d=document.createElement('section');d.id='v646QuickReview';d.className='v646QuickReview';d.innerHTML=`<div class="v646QuickMedia"><img id="v646QuickImg" alt="Evidencia"><span id="v646QuickCounter" class="v646QuickCounter">0/0</span></div><div class="v646QuickBody"><div class="v646QuickChips" id="v646QuickChips"></div><h3 id="v646QuickTitle">Sin evidencias</h3><p id="v646QuickMeta">Usa tus filtros actuales y abre esta vista cuando quieras revisar fotografías grandes.</p><p id="v646QuickAddress"></p><div class="v646QuickNav"><button id="v646Prev" type="button">‹ Anterior</button><button id="v646Next" type="button">Siguiente ›</button></div><div class="v646QuickActions"><button id="v646View" type="button">👁 Ver detalle</button><button id="v646Edit" type="button" class="primary">✎ Editar</button><button id="v646Fer" type="button">✨ Editar con Fer</button><button id="v646Map" type="button">📍 Mapa</button></div></div>`;search.after(d);
    document.getElementById('v646Prev').onclick=()=>move(-1);document.getElementById('v646Next').onclick=()=>move(1);document.getElementById('v646View').onclick=()=>act('view');document.getElementById('v646Edit').onclick=()=>act('edit');document.getElementById('v646Fer').onclick=()=>act('fer');document.getElementById('v646Map').onclick=()=>act('map');
  }
}
function current(){const a=visible();if(!a.length)return null;index=Math.max(0,Math.min(index,a.length-1));return a[index];}
function paint(){
  ensureUi();const a=visible(),r=current(),imgEl=document.getElementById('v646QuickImg');if(!imgEl)return;
  if(!r){imgEl.removeAttribute('src');document.getElementById('v646QuickCounter').textContent='0/0';document.getElementById('v646QuickTitle').textContent='Sin evidencias en este filtro';document.getElementById('v646QuickMeta').textContent='Cambia el periodo o toma una nueva fotografía.';document.getElementById('v646QuickChips').innerHTML='';document.getElementById('v646QuickAddress').textContent='';return;}
  imgEl.src=image(r);document.getElementById('v646QuickCounter').textContent=`${index+1}/${a.length}`;document.getElementById('v646QuickTitle').textContent=escText(r.party||'Partido pendiente');document.getElementById('v646QuickMeta').textContent=`${r.photoCode||''} · ${r.fecha||''} ${r.hora||''}`;document.getElementById('v646QuickAddress').textContent=rules()?.captureAddress(r)||r.address||'Ubicación pendiente';
  const chips=[rules()?.safeType(r)||r.type||'PENDIENTE',rules()?.reviewLabel(r)||r.reviewStatus||'FALTA REVISAR',r.district||'Distrito pendiente'];document.getElementById('v646QuickChips').innerHTML=chips.map(x=>`<span>${String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</span>`).join('');
}
function move(delta){const a=visible();if(!a.length)return;index=(index+delta+a.length)%a.length;paint();}
function act(action){const r=current();if(!r)return;if(action==='view')return Viewer.open(r.id);if(action==='edit')return Editor.open(r.id);if(action==='map')return Maps.openRecord(r);if(action==='fer'){Editor.open(r.id);setTimeout(()=>{try{GuidedEditor.start(true);}catch(_){}},150);}}

function patchSelection(){
  const none=document.getElementById('selectionNoneBtn');if(none){none.classList.remove('isHidden');none.removeAttribute('aria-hidden');none.tabIndex=0;none.textContent='Ninguna';none.onclick=()=>Gallery.deselectAll();}
  const old=Gallery.updateSelectionUI?.bind(Gallery);if(old&&!Gallery.__v646Selection){Gallery.__v646Selection=true;Gallery.updateSelectionUI=()=>{const out=old();const n=document.getElementById('selectionNoneBtn');if(n){n.style.display=State.selectionMode?'':'none';n.setAttribute('aria-hidden',State.selectionMode?'false':'true');n.tabIndex=State.selectionMode?0:-1;}try{window.ONE_V646_FER?.syncFab?.();}catch(_){}return out;};}
}
function patchRender(){const old=Gallery.render?.bind(Gallery);if(old&&!Gallery.__v646Render){Gallery.__v646Render=true;Gallery.render=(...a)=>{const out=old(...a);setTimeout(()=>{ensureUi();if(document.getElementById('v646QuickReview')?.classList.contains('open'))paint();},0);return out;};}}
function start(){if(window.__ONE_V646_EVIDENCE_STARTED)return;if(typeof Gallery==='undefined'||typeof Evidence==='undefined'||typeof Viewer==='undefined'||typeof Editor==='undefined'){if(tries++<90)setTimeout(start,120);return;}window.__ONE_V646_EVIDENCE_STARTED=true;css();ensureUi();patchSelection();patchRender();paint();}
window.ONE_V646_EVIDENCE={BUILD,start,paint};window.addEventListener('load',()=>setTimeout(start,720),{once:true});if(document.readyState==='complete')setTimeout(start,720);
})();