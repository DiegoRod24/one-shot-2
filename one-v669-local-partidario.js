/* ONE SHOT v6.6.10 · LOCAL PARTIDARIO · EDITOR FREEZE HOTFIX */
(()=>{
'use strict';
if(window.ONE_V669_LOCAL_PARTIDARIO)return;
const BUILD='oneshot-v6.6.10-editor-freeze-hotfix-01';
const q=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const slug=v=>norm(v).replace(/ /g,'_');
function state(){try{return typeof State!=='undefined'?State:window.State}catch(_){return window.State}}
function store(){try{return typeof Store!=='undefined'?Store:window.Store}catch(_){return window.Store}}
function places(){try{return typeof Places!=='undefined'?Places:window.Places}catch(_){return window.Places}}
function reports(){try{return typeof Reports!=='undefined'?Reports:window.Reports}catch(_){return window.Reports}}
function media(){try{return typeof EvidenceMedia!=='undefined'?EvidenceMedia:window.EvidenceMedia}catch(_){return window.EvidenceMedia}}
function catalog(){return Array.isArray(window.ONE_PARTY_CATALOG_V6410)?window.ONE_PARTY_CATALOG_V6410:[]}
function toast(t,ms=2500){try{return typeof UI!=='undefined'&&UI.toast?UI.toast(t,ms,{placement:'top',tone:'soft'}):void 0}catch(_){console.log('[ONE SHOT v6.6.10]',t)}}
function logo(name){return name?`/assets/parties/${encodeURIComponent(slug(name))}.png`:''}
function imageFor(r){try{return media()?.display?.(r)||r?.rescuedImage||r?.correctedImage||r?.stampedImage||r?.image||''}catch(_){return r?.rescuedImage||r?.stampedImage||r?.image||''}}
function record(id=''){
  const st=state();if(!Array.isArray(st?.records))return null;
  const editId=q('#editId')?.value?.trim()||'';
  const quickId=(()=>{try{return typeof QuickCapture!=='undefined'?QuickCapture.currentId||'':''}catch(_){return''}})();
  const wanted=id||editId||quickId||st.lastShotId||'';
  return st.records.find(x=>String(x.id)===String(wanted))||st.records[0]||null;
}
function isLocal(r){return norm(r?.findingSubtype)==='LOCAL PARTIDARIO'||norm(r?.entityType)==='POLITICAL LOCATION'}
function css(){
  if(q('#oneV669Css'))return;
  const s=document.createElement('style');s.id='oneV669Css';s.textContent=`
.one-v669-quick-local{border:1px solid rgba(25,177,125,.45);background:rgba(14,117,82,.16);color:#0b684b;border-radius:14px;padding:9px 12px;font-weight:900;white-space:nowrap}
#quickCaptureBar .one-v669-quick-local{min-height:38px;padding:7px 9px;font-size:12px;color:#fff;background:rgba(13,119,83,.92);border-color:rgba(255,255,255,.2)}
#oneV664QuickEditor .one-v669-quick-local{width:100%;margin-top:10px;color:#dffcf2;background:rgba(15,130,90,.22);border-color:rgba(55,211,151,.35);font-size:14px}
#oneV669Modal{position:fixed;inset:0;z-index:2147483200;display:none;align-items:flex-end;justify-content:center;background:rgba(1,8,20,.72);backdrop-filter:blur(6px);padding:12px}
#oneV669Modal.open{display:flex}
.one-v669-sheet{width:min(680px,100%);max-height:min(88dvh,880px);overflow:auto;background:#f7f9fc;border-radius:28px 28px 18px 18px;box-shadow:0 -20px 60px rgba(0,0,0,.35);padding:18px;color:#11223b}
.one-v669-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;position:sticky;top:-18px;background:#f7f9fc;padding:18px 0 12px;z-index:3}
.one-v669-head h3{margin:0;font-size:25px}.one-v669-head p{margin:4px 0 0;color:#64748b}.one-v669-close{width:46px;height:46px;border:0;border-radius:50%;background:#eaf0f8;color:#0d3265;font-size:24px;font-weight:900}
.one-v669-preview{display:grid;grid-template-columns:150px 1fr;gap:14px;align-items:center;background:#071b37;border-radius:22px;padding:12px;color:#fff}.one-v669-preview img{width:150px;height:170px;object-fit:contain;background:#020b18;border-radius:15px}.one-v669-preview b{display:block;font-size:16px}.one-v669-preview span,.one-v669-preview small{display:block;color:#b9c8dc;margin-top:5px;line-height:1.35}
.one-v669-form{display:grid;gap:13px;margin-top:16px}.one-v669-field{display:grid;gap:7px;font-weight:800}.one-v669-field input,.one-v669-field textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:16px;background:#fff;padding:13px 14px;font:inherit;color:#10213b}.one-v669-field textarea{resize:vertical;min-height:72px}.one-v669-results{display:grid;gap:6px;max-height:220px;overflow:auto;border-radius:15px}.one-v669-results[hidden]{display:none}.one-v669-results button{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid #d6e0ee;background:#fff;padding:9px;border-radius:13px;font-weight:800;color:#15345e}.one-v669-results img{width:35px;height:35px;object-fit:contain;border-radius:9px;background:#fff}.one-v669-selected{display:flex;align-items:center;gap:10px;background:#e9f8f2;border:1px solid #b7e6d4;border-radius:15px;padding:10px}.one-v669-selected[hidden]{display:none}.one-v669-selected img{width:42px;height:42px;object-fit:contain;border-radius:10px;background:#fff}.one-v669-selected small{display:block;color:#52726a}.one-v669-location{background:#eef4fb;border-radius:16px;padding:12px 14px;color:#40536d;font-size:13px}.one-v669-location strong{color:#143968}.one-v669-warn{background:#fff3d7;color:#805c08;border:1px solid #f5d586;border-radius:14px;padding:10px 12px;font-weight:800}.one-v669-actions{display:grid;grid-template-columns:1fr 1.6fr;gap:10px;margin-top:4px}.one-v669-actions button{min-height:50px;border-radius:16px;border:1px solid #d6deea;background:#fff;font-weight:900;color:#173c6d}.one-v669-actions .save{border:0;color:#fff;background:linear-gradient(135deg,#0c8c63,#1fb980)}.one-v669-actions .save:disabled{opacity:.45}
@media(max-width:540px){#oneV669Modal{padding:0}.one-v669-sheet{border-radius:24px 24px 0 0;padding:16px;max-height:92dvh}.one-v669-head{top:-16px;padding-top:16px}.one-v669-preview{grid-template-columns:105px 1fr}.one-v669-preview img{width:105px;height:132px}.one-v669-head h3{font-size:22px}.one-v669-actions{grid-template-columns:1fr 1.45fr}}
@media(max-width:380px){#quickCaptureBar .one-v669-quick-local{font-size:0;width:38px;padding:5px}#quickCaptureBar .one-v669-quick-local::after{content:'🏢';font-size:16px}}
`;
  document.head.appendChild(s);
}
const LocalFlow={
  currentId:'',
  current(){return record(this.currentId)},
  ensureModal(){
    if(q('#oneV669Modal'))return;
    const m=document.createElement('div');m.id='oneV669Modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.innerHTML=`<div class="one-v669-sheet"><div class="one-v669-head"><div><h3>🏢 Local partidario</h3><p>Registra el lugar sin mezclarlo con PANEL/BANNER/PINTA.</p></div><button class="one-v669-close" id="oneV669Close" aria-label="Cerrar">×</button></div><div class="one-v669-preview"><img id="oneV669Img" alt="Evidencia del local"><div><b id="oneV669Code">Evidencia</b><span id="oneV669Address">Ubicación</span><small id="oneV669Gps">GPS</small></div></div><div class="one-v669-form"><label class="one-v669-field"><span>Organización política</span><input id="oneV669Party" autocomplete="off" placeholder="Escribe 2 letras para buscar"></label><div id="oneV669Selected" class="one-v669-selected" hidden></div><div id="oneV669Results" class="one-v669-results" hidden></div><label class="one-v669-field"><span>Nombre del local <small style="font-weight:500;color:#64748b">(opcional)</small></span><input id="oneV669Name" placeholder="Ej. Local partidario · APP"></label><label class="one-v669-field"><span>Observación <small style="font-weight:500;color:#64748b">(opcional)</small></span><textarea id="oneV669Note" placeholder="Ej. fachada con propaganda, local abierto, referencia visual..."></textarea></label><div id="oneV669Location" class="one-v669-location"></div><div id="oneV669Warn" class="one-v669-warn" hidden>Esta evidencia no tiene GPS. Actualiza su GPS desde Editar evidencia antes de registrarla como local.</div><div class="one-v669-actions"><button id="oneV669Cancel">Cancelar</button><button id="oneV669Save" class="save">✓ Guardar local</button></div></div></div>`;document.body.appendChild(m);
    q('#oneV669Close').onclick=()=>this.close();q('#oneV669Cancel').onclick=()=>this.close();q('#oneV669Save').onclick=()=>this.save();m.addEventListener('click',e=>{if(e.target===m)this.close()});
    const party=q('#oneV669Party'),res=q('#oneV669Results');party.addEventListener('input',()=>this.search());res.addEventListener('click',e=>{const b=e.target.closest('[data-party]');if(!b)return;party.value=b.dataset.party;this.paintSelected(b.dataset.party);res.hidden=true;const name=q('#oneV669Name');if(name&&!name.value.trim())name.value=`Local partidario · ${b.dataset.party}`});
  },
  search(){const input=q('#oneV669Party'),host=q('#oneV669Results');if(!input||!host)return;const term=norm(input.value);if(term.length<2){host.hidden=true;host.innerHTML='';return}const rows=catalog().filter(x=>norm(x.name).includes(term)).slice(0,8);host.hidden=false;host.innerHTML=rows.length?rows.map(x=>`<button type="button" data-party="${esc(x.name)}"><img src="${logo(x.name)}" alt="" onerror="this.style.display='none'"><span>${esc(x.name)}</span></button>`).join(''):'<div style="padding:10px;color:#64748b">Sin coincidencias.</div>'},
  paintSelected(name){const box=q('#oneV669Selected');if(!box)return;if(!name){box.hidden=true;box.innerHTML='';return}box.hidden=false;box.innerHTML=`<img src="${logo(name)}" alt="" onerror="this.style.display='none'"><div><small>Organización seleccionada</small><b>${esc(name)}</b></div>`},
  open(id=''){
    this.ensureModal();const r=record(id);if(!r)return toast('No hay una evidencia disponible para registrar el local');this.currentId=r.id;
    q('#oneV669Img').src=imageFor(r);q('#oneV669Code').textContent=r.photoCode||r.id||'Evidencia';q('#oneV669Address').textContent=r.captureAddress||r.address||'Dirección pendiente';
    const g=r.gps;q('#oneV669Gps').textContent=g?`GPS ±${Math.round(Number(g.accuracy||0))} m · ${Number(g.latitude).toFixed(6)}, ${Number(g.longitude).toFixed(6)}`:'Sin GPS';
    const p=(r.placeId&&places()?.get?.(r.placeId))||null,party=r.party||p?.party||'',name=r.localName||((p?.type==='Local partidario'&&p?.name)||''),note=r.localObservation||p?.note||'';
    q('#oneV669Party').value=party;q('#oneV669Name').value=name||(party?`Local partidario · ${party}`:'');q('#oneV669Note').value=note;this.paintSelected(party);
    q('#oneV669Location').innerHTML=`<strong>${esc(r.department||r.region||'')}</strong>${r.province?` · ${esc(r.province)}`:''}${r.district?` · ${esc(r.district)}`:''}<br>${esc(r.captureAddress||r.address||'Dirección pendiente')}`;
    q('#oneV669Warn').hidden=!!g;q('#oneV669Save').disabled=!g;q('#oneV669Modal').classList.add('open');
  },
  close(){q('#oneV669Modal')?.classList.remove('open');this.currentId=''},
  async save(){
    const btn=q('#oneV669Save');try{
      const r=this.current();if(!r)throw Error('No se encontró la evidencia');if(!r.gps)throw Error('Esta evidencia necesita GPS antes de crear el local');
      const party=q('#oneV669Party')?.value?.trim()||'';if(!party)throw Error('Selecciona la organización política');
      if(btn){btn.disabled=true;btn.textContent='Guardando…'}
      const exact=catalog().find(x=>norm(x.name)===norm(party)),partyName=exact?.name||party,name=q('#oneV669Name')?.value?.trim()||`Local partidario · ${partyName}`,note=q('#oneV669Note')?.value?.trim()||'',now=new Date().toISOString();
      r.party=partyName;r.findingSubtype='LOCAL_PARTIDARIO';r.entityType='POLITICAL_LOCATION';r.localName=name;r.localObservation=note;r.localRegisteredAt=r.localRegisteredAt||now;r.localUpdatedAt=now;r.reviewTouched=true;
      const P=places();let p=r.placeId&&P?.get?.(r.placeId);if(!p)p=P?.createFromRecord?.(r,{name,type:'Local partidario'});if(!p)throw Error('No se pudo crear el punto del local');
      p.type='Local partidario';p.entityType='POLITICAL_LOCATION';p.name=name;p.party=partyName;p.note=note;p.address=r.captureAddress||r.address||p.address||'';p.department=r.department||r.region||p.department||'';p.province=r.province||p.province||'';p.district=r.district||p.district||'';p.latitude=Number(r.gps.latitude);p.longitude=Number(r.gps.longitude);p.lastSeen=r.createdAt||now;p.updatedAt=now;r.localPlaceId=p.id;
      await store()?.save?.(r);store()?.saveLite?.();try{P?.render?.()}catch(_){ }try{reports()?.invalidate?.()}catch(_){ }
      this.close();toast('✓ Local partidario guardado');setTimeout(refreshEditorButton,0);
    }catch(err){toast(`No se pudo guardar local · ${err.message||err}`,3500)}finally{if(btn){btn.textContent='✓ Guardar local';btn.disabled=!this.current()?.gps}}
  }
};
function ensureCaptureButton(){
  const bar=q('#quickCaptureBar');if(!bar||q('#oneV669QuickLocalCapture',bar))return;
  const b=document.createElement('button');b.id='oneV669QuickLocalCapture';b.className='one-v669-quick-local';b.type='button';b.textContent='🏢 Local';const edit=q('#quickCaptureEdit',bar),close=q('#quickCaptureClose',bar);if(edit)edit.insertAdjacentElement('afterend',b);else if(close)bar.insertBefore(b,close);else bar.appendChild(b);b.onclick=()=>LocalFlow.open();
}
function refreshEditorButton(id=''){
  const quick=q('#oneV664QuickEditor');if(!quick)return;
  let b=q('#oneV669QuickLocalEditor',quick);if(!b){b=document.createElement('button');b.id='oneV669QuickLocalEditor';b.className='one-v669-quick-local';b.type='button';const st=q('#oneV664EditStatus',quick);if(st)quick.insertBefore(b,st);else quick.appendChild(b);b.onclick=()=>LocalFlow.open(q('#editId')?.value||id||'')}
  const r=record(q('#editId')?.value||id||'');b.textContent=isLocal(r)?'🏢 Local partidario ✓':'🏢 Registrar como local partidario';
}
function hookEditor(){
  let tries=0;const attempt=()=>{tries++;let ed=null;try{ed=typeof Editor!=='undefined'?Editor:window.Editor}catch(_){ed=window.Editor}
    if(!ed?.open){if(tries<120)setTimeout(attempt,50);return}
    if(ed.__v6610LocalHook){if(q('#editModal')?.classList.contains('open'))setTimeout(refreshEditorButton,0);return}
    ed.__v6610LocalHook=true;const oldOpen=ed.open.bind(ed);ed.open=(id,...rest)=>{const out=oldOpen(id,...rest);requestAnimationFrame(()=>setTimeout(()=>refreshEditorButton(id),60));return out};
    if(q('#editModal')?.classList.contains('open'))requestAnimationFrame(()=>setTimeout(refreshEditorButton,60));
  };attempt();
}
function boot(){css();LocalFlow.ensureModal();ensureCaptureButton();hookEditor()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.ONE_V669_LOCAL_PARTIDARIO={BUILD,open:id=>LocalFlow.open(id),close:()=>LocalFlow.close(),isLocal,refreshButtons:()=>{ensureCaptureButton();refreshEditorButton()}};
})();
