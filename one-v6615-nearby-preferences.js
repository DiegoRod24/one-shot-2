/* ONE SHOT v6.6.28 · HISTORIAL CERCANO EN EDITOR · SIN BLOQUEO POST-CAPTURA */
(()=>{
'use strict';
if(window.ONE_V6615_NEARBY_PREFS)return;
const BUILD='oneshot-v6.6.28-nearby-editor-only-01';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let originalPrompt=null;

function S(){try{return typeof State!=='undefined'?State:window.State}catch(_){return window.State}}
function P(){try{return typeof Places!=='undefined'?Places:window.Places}catch(_){return window.Places}}
function St(){try{return typeof Store!=='undefined'?Store:window.Store}catch(_){return window.Store}}
function U(){try{return typeof UI!=='undefined'?UI:window.UI}catch(_){return window.UI}}
function enabled(){return S()?.settings?.nearbyHistoryEnabled!==false}
function record(){
  try{
    const ed=typeof Editor!=='undefined'?Editor:window.Editor;
    if(ed?.current)return ed.current;
    const id=$('editId')?.value||'';
    return (S()?.records||[]).find(r=>String(r.id)===String(id))||null;
  }catch(_){return null}
}
function closeNearbyUi(){
  try{P()?.closeRelation?.()}catch(_){}
  $('relationModal')?.classList.remove('open');
  try{S().pendingRelationId='';S().pendingPreviousId='';S().pendingBaseItem=null}catch(_){}
}
function persistNearby(value,{notify=true}={}){
  const s=S();if(!s?.settings)return false;
  s.settings.nearbyHistoryEnabled=!!value;
  try{St()?.saveLite?.()}catch(_){}
  const input=$('nearbyHistoryInput');if(input)input.checked=!!value;
  if(!value)closeNearbyUi();
  renderEditorNearby();
  if(notify)try{U()?.toast?.(value?'✓ Historial cercano activado · se revisa en Editar':'✓ Historial cercano desactivado',2200,{placement:'top',tone:'soft'})}catch(_){}
  return true;
}
function mediaOf(row){return row?.rescuedImage||row?.correctedImage||row?.stampedImage||row?.image||''}
function nearestRows(r){
  if(!enabled()||!r?.gps)return [];
  try{return (P()?.nearbyAll?.(r.gps,Number(S()?.settings?.nearbyRadiusM||20),r.id)||[]).slice(0,3)}catch(_){return []}
}
function relationData(x){
  const row=x?.source==='local'?x.record:x?.item;
  return {row,source:x?.source||'',distance:Math.round(Number(x?.distance||0))};
}
function renderEditorNearby(){
  const form=$('editForm');if(!form)return;
  form.querySelector('#oneV6628NearbyEditor')?.remove();
  if(!enabled())return;
  const r=record();if(!r?.gps)return;
  const rows=nearestRows(r);if(!rows.length)return;
  const section=document.createElement('section');section.id='oneV6628NearbyEditor';section.className='one-v6628-nearby';
  const cards=rows.map((x,i)=>{const d=relationData(x),p=d.row||{},img=mediaOf(p);return `<article class="one-v6628-near-card"><div class="one-v6628-thumb">${img?`<img src="${esc(img)}" alt="Foto cercana" loading="lazy">`:'<span>📍</span>'}</div><div class="one-v6628-meta"><b>${esc(p.party||p.type||'Evidencia cercana')}</b><span>${d.distance} m · ${esc(p.fecha||p.date||'sin fecha')}</span><small>${esc(p.address||p.district||'Ubicación registrada')}</small></div>${i===0?'<span class="one-v6628-nearest">MÁS CERCANA</span>':''}</article>`}).join('');
  section.innerHTML=`<div class="one-v6628-head"><div><h3>📍 Historial cercano</h3><p>Revisa después de capturar; nunca interrumpe la cámara.</p></div><span>${rows.length}</span></div>${cards}<div class="one-v6628-actions"><button type="button" data-nearby-rel="Permanece">✓ Permanece</button><button type="button" data-nearby-rel="Modificada">↻ Modificada</button><button type="button" data-nearby-rel="Retirada">× Retirada</button><button type="button" data-nearby-rel="Nueva">＋ Nueva</button></div>`;
  const quick=form.querySelector('#oneV664QuickEditor');
  if(quick?.nextSibling)form.insertBefore(section,quick.nextSibling);else if(quick)quick.insertAdjacentElement('afterend',section);else form.appendChild(section);
}
async function relate(kind){
  const r=record(),rows=nearestRows(r),near=rows[0];if(!r||!near)return U()?.toast?.('No hay evidencia cercana para relacionar');
  const p=P(),s=S();if(!p||!s)return;
  try{
    s.pendingRelationId=r.id;
    s.pendingPreviousId=near.source==='local'?(near.record?.id||''):'';
    s.pendingBaseItem=near.source==='base'?(near.item||null):null;
    await p.relate?.(kind);
    renderEditorNearby();
  }catch(err){U()?.toast?.(`No se pudo relacionar · ${err?.message||err}`,3000)}
}
function patchPlaces(){
  const p=P();if(!p||p.__one6628NearbyEditorOnly)return false;
  originalPrompt=p.promptRelation?.bind(p)||null;
  // El historial deja de abrir modales automáticamente después de una foto.
  // La relación se revisa explícitamente dentro de Editar evidencia.
  if(typeof p.promptRelation==='function')p.promptRelation=function(){
    if(!enabled())closeNearbyUi();
    return null;
  };
  p.__one6628NearbyEditorOnly=true;
  return true;
}
function patchEditor(){
  const ed=(()=>{try{return typeof Editor!=='undefined'?Editor:window.Editor}catch(_){return window.Editor}})();
  if(!ed||ed.__one6628NearbyEditor)return false;
  ed.__one6628NearbyEditor=true;
  const open=ed.open?.bind(ed),close=ed.close?.bind(ed);
  if(open)ed.open=(id,...rest)=>{const out=open(id,...rest);requestAnimationFrame(()=>setTimeout(renderEditorNearby,0));return out};
  if(close)ed.close=(...a)=>{$('oneV6628NearbyEditor')?.remove();return close?.(...a)};
  return true;
}
function styles(){
  if($('oneV6628NearbyCss'))return;
  const s=document.createElement('style');s.id='oneV6628NearbyCss';s.textContent=`
.one-v6628-nearby{margin:12px 16px;padding:14px;border:1px solid #b9c9df;border-radius:20px;background:#f7fbff;color:#0a2c58;display:grid;gap:10px}.one-v6628-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.one-v6628-head h3{margin:0;font-size:20px}.one-v6628-head p{margin:3px 0 0;color:#61748b;font-size:12px}.one-v6628-head>span{min-width:30px;height:30px;display:grid;place-items:center;border-radius:999px;background:#e4efff;font-weight:900}.one-v6628-near-card{position:relative;display:grid;grid-template-columns:64px 1fr;gap:10px;align-items:center;padding:9px;border:1px solid #d7e1ed;border-radius:16px;background:#fff}.one-v6628-thumb{width:64px;height:64px;border-radius:12px;overflow:hidden;background:#e9eff7;display:grid;place-items:center}.one-v6628-thumb img{width:100%;height:100%;object-fit:cover}.one-v6628-meta{min-width:0;display:grid;gap:2px}.one-v6628-meta b{font-size:13px}.one-v6628-meta span{font-size:11px;color:#2766c4;font-weight:800}.one-v6628-meta small{font-size:10px;color:#718095;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.one-v6628-nearest{position:absolute;right:8px;top:7px;font-size:8px;font-weight:950;color:#2766c4}.one-v6628-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.one-v6628-actions button{min-height:46px;border:1px solid #b8c9df;border-radius:14px;background:#fff;color:#0a2c58;font-weight:900;font-size:12px}
@media(max-width:520px){.one-v6628-nearby{margin:10px 14px;padding:12px}.one-v6628-head h3{font-size:18px}}
`;
  document.head.appendChild(s);
}
function bindSettings(){
  const input=$('nearbyHistoryInput');
  if(input&&!input.dataset.one6628Nearby){input.dataset.one6628Nearby='1';input.checked=enabled();input.addEventListener('change',()=>persistNearby(input.checked,{notify:true}))}
  const form=$('editForm');
  if(form&&!form.dataset.one6628NearbyActions){form.dataset.one6628NearbyActions='1';form.addEventListener('click',e=>{const b=e.target.closest('[data-nearby-rel]');if(!b)return;e.preventDefault();e.stopPropagation();relate(b.dataset.nearbyRel)},true)}
}
function boot(){
  styles();patchPlaces();patchEditor();bindSettings();closeNearbyUi();
  // Un único reintento corto por si los objetos base terminan de inicializar después del DOM.
  setTimeout(()=>{patchPlaces();patchEditor();bindSettings();if($('editModal')?.classList.contains('open'))renderEditorNearby()},350);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.ONE_V6615_NEARBY_PREFS={BUILD,persistNearby,closeNearbyUi,renderEditorNearby,relate};
})();
