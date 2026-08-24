/* ONE SHOT v6.6.18 · FIELD FLOW HOTFIX */
(()=>{
'use strict';
if(window.ONE_V6618_FIELD_FLOW)return;
const BUILD='oneshot-v6.6.18-field-flow-01';
const ACT_DB='oneshotPoliticalActivityDB_v1',ACT_STORE='activities';
const $=id=>document.getElementById(id);
const parse=(raw,f={})=>{try{return JSON.parse(raw||'')||f}catch(_){return f}};
const uuid=()=>crypto?.randomUUID?.()||`act-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const code=()=>`ACT-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(16).slice(2,8).toUpperCase()}`;
const validGps=g=>!!g&&Number.isFinite(Number(g.latitude))&&Number.isFinite(Number(g.longitude));
function state(){try{return typeof State!=='undefined'?State:window.State}catch(_){return window.State}}
function gallery(){try{return typeof Gallery!=='undefined'?Gallery:window.Gallery}catch(_){return window.Gallery}}
function toast(m,ms=2600){try{if(typeof UI!=='undefined'&&UI.toast)UI.toast(m,ms,{placement:'top',tone:'soft'})}catch(_){}}
let pendingTramoEvidenceId='',activityDbPromise=null;

function db(){
  if(activityDbPromise)return activityDbPromise;
  activityDbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(ACT_DB,1);
    req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(ACT_STORE)){const s=d.createObjectStore(ACT_STORE,{keyPath:'id'});s.createIndex('syncStatus','syncStatus',{unique:false});s.createIndex('createdAt','createdAt',{unique:false});}};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('No se pudo abrir actividades'));
  });
  return activityDbPromise;
}
async function putActivity(row){
  const d=await db();
  await new Promise((resolve,reject)=>{
    const tx=d.transaction(ACT_STORE,'readwrite'),req=tx.objectStore(ACT_STORE).put(row);
    req.onerror=()=>reject(req.error||new Error('No se pudo escribir actividad'));
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Error de IndexedDB'));tx.onabort=()=>reject(tx.error||new Error('Guardado cancelado'));
  });
  return await new Promise((resolve,reject)=>{const req=d.transaction(ACT_STORE,'readonly').objectStore(ACT_STORE).get(row.id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});
}
async function geoSnapshot(){
  const S=state(),g=validGps(S?.gps)?{...S.gps}:null;
  let loc={address:'',district:'',province:'',department:'',ubigeo:'UBIGEO pendiente'};
  try{if(g&&typeof GPS!=='undefined'&&GPS.reverse)loc=await Promise.race([GPS.reverse(g),new Promise((_,rej)=>setTimeout(()=>rej(new Error('geo timeout')),3500))])||loc}catch(_){ }
  const wm=String($('wmAddr')?.textContent||'').trim();
  return {gps:g,address:loc.address||wm||'',district:loc.district||'',province:loc.province||'',department:loc.department||'',ubigeo:loc.ubigeo||'UBIGEO pendiente',addressStructured:loc.addressStructured||''};
}
function activityFile(){return $('v660ActivityVideoInput')?.files?.[0]||$('v660ActivityPhotoInput')?.files?.[0]||null}
function fieldIdentity(){return parse(localStorage.getItem('oneshotFieldIdentity_v1'),{})}
function routeContext(){
  const st=state()?.settings||{},a=(st.teamAssignments||[]).find(x=>x.id===st.activeTeamAssignmentId)||{};
  return {captureMode:st.currentMission?'MISION':st.currentRoute?'RECORRIDO':'LIBRE',missionId:st.currentMission?.id||'',missionName:st.currentMission?.name||'',routeId:st.currentRoute?.id||'',teamAssignmentId:st.activeTeamAssignmentId||'',teamMemberId:a.memberId||'',teamSector:a.sector||''};
}
function setActivityStatus(text,tone='info'){
  let el=$('v6618ActivitySaveStatus');
  if(!el){el=document.createElement('div');el.id='v6618ActivitySaveStatus';el.style.cssText='border-radius:12px;padding:9px 11px;font-size:11px;font-weight:850;line-height:1.35;margin-top:-2px';$('v660ActivitySave')?.closest('.v660ActivityActions')?.insertAdjacentElement('afterend',el)}
  if(!el)return;el.textContent=text;el.style.background=tone==='ok'?'#0f5132':tone==='bad'?'#7f1d1d':'#102d57';el.style.color='#fff';
}
async function saveActivityLocal(){
  const btn=$('v660ActivitySave');if(!btn||btn.dataset.one6618Busy==='1')return;
  const file=activityFile(),party=$('v660ActivityParty')?.value?.trim()||'',activityType=$('v660ActivityType')?.value||'',note=$('v660ActivityNote')?.value?.trim()||'';
  if(!file)return toast('Primero toma una foto o graba un video.');
  if(!party)return toast('Selecciona la organización política.');
  if(!activityType)return toast('Selecciona el tipo de actividad.');
  btn.dataset.one6618Busy='1';btn.disabled=true;const old=btn.textContent;btn.textContent='Guardando en el teléfono…';setActivityStatus('Guardando primero en este dispositivo…');
  try{
    const d=new Date(),geo=await geoSnapshot(),who=fieldIdentity(),bytes=new Uint8Array(await file.arrayBuffer()),S=state();
    const duration=Number($('v660ActivityPreview')?.querySelector('video')?.duration||0)||0;
    const fecha=typeof Dates!=='undefined'&&Dates.date?Dates.date(d):d.toISOString().slice(0,10),hora=typeof Dates!=='undefined'&&Dates.time?Dates.time(d):d.toTimeString().slice(0,8);
    const row={id:uuid(),activityCode:code(),entity:'political_activity',schemaVersion:'PoliticalActivityV1',sourceApp:'one-shot-2',sourceVersion:BUILD,createdAt:d.toISOString(),fecha,hora,party,activityType,note,mediaKind:file.type.startsWith('video/')?'VIDEO':'PHOTO',mediaType:file.type||'application/octet-stream',mediaSize:file.size||bytes.byteLength,durationSeconds:duration,gps:geo.gps||null,gpsStatus:geo.gps?'GPS_CAPTURA':'SIN_GPS',accuracy:geo.gps?.accuracy??'',address:geo.address||'',addressStructured:geo.addressStructured||'',department:geo.department||'',province:geo.province||'',district:geo.district||'',ubigeo:geo.ubigeo||'UBIGEO pendiente',googleMapsUrl:geo.gps?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${geo.gps.latitude},${geo.gps.longitude}`)}`:'',electionProcess:S?.settings?.activeProcess||'ERM',reviewStatus:'PENDIENTE',reviewSource:'FIELD_FIRST_FILTER',teamId:who.teamId||'',reviewer:who.reviewer||S?.settings?.reviewer||'',deviceId:who.deviceId||'',...routeContext(),syncStatus:'PENDING',syncError:'',cloud:null,updatedAt:d.toISOString(),mediaBlob:bytes};
    const verify=await putActivity(row);if(!verify?.id)throw new Error('No se pudo verificar el guardado local');
    setActivityStatus(`✓ Actividad guardada · ${row.activityCode} · sincronización en segundo plano`,'ok');toast('✓ Actividad guardada en el teléfono',2200);
    const photo=$('v660ActivityPhotoInput'),video=$('v660ActivityVideoInput');if(photo)photo.value='';if(video)video.value='';
    const preview=$('v660ActivityPreview');if(preview)preview.innerHTML='<div class="v660ActivityEmpty">✓ Guardada · lista para otra foto o video</div>';
    const meta=$('v660ActivityFileMeta');if(meta)meta.textContent=`Guardada · ${row.activityCode}`;if($('v660ActivityNote'))$('v660ActivityNote').value='';
    window.ONE_V660_POLITICAL_ACTIVITY?.stats?.();
    setTimeout(async()=>{try{await window.ONE_V660_POLITICAL_ACTIVITY?.syncPending?.();const d=await db(),r=await new Promise(res=>{const q=d.transaction(ACT_STORE,'readonly').objectStore(ACT_STORE).get(row.id);q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)});if(r?.syncStatus==='SYNCED')setActivityStatus(`☁ Sincronizada · ${row.activityCode}`,'ok');else if(r?.syncStatus==='ERROR')setActivityStatus(`✓ Guardada local · nube pendiente: ${r.syncError||'reintentar'}`,'bad')}catch(_){setActivityStatus('✓ Guardada local · sincronización pendiente','info')}},250);
  }catch(err){console.error('[ONE SHOT v6.6.18 activity]',err);setActivityStatus(`No se pudo guardar · ${err.message||err}`,'bad');toast(`No se pudo guardar actividad · ${err.message||err}`,4200)}finally{btn.dataset.one6618Busy='';btn.disabled=false;btn.textContent=old||'✓ Guardar actividad'}
}
function patchActivity(){const btn=$('v660ActivitySave');if(!btn||btn.dataset.one6618Bound==='1')return false;btn.dataset.one6618Bound='1';btn.onclick=null;btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();saveActivityLocal()},true);setActivityStatus('Primero se guarda localmente; la nube nunca bloquea el guardado.');return true}

async function ensureMobile(){try{await window.ONE_V661_IDLE_LOADER?.ensure?.('mobile')}catch(_){}}
async function openLocal(id){await ensureMobile();const api=window.ONE_V669_LOCAL_PARTIDARIO;if(!api?.open)return toast('Cargando Local partidario… vuelve a tocar en un segundo.');api.open(id)}
function decorateEvidence(){const S=state();document.querySelectorAll('#evidenceList .eCard').forEach(card=>{const actions=card.querySelector('.eActions');if(!actions||actions.querySelector('[data-one-local]'))return;const id=card.dataset.id||'',r=S?.records?.find?.(x=>String(x.id)===String(id)),b=document.createElement('button');b.type='button';b.dataset.oneLocal=id;b.textContent=r?.entityType==='POLITICAL_LOCATION'?'🏢 Local ✓':'🏢 Local';b.title='Registrar esta misma evidencia como local partidario';actions.insertBefore(b,actions.querySelector('[data-act="delete"]')||null)})}
function patchGallery(){const G=gallery();if(!G?.render||G.__one6618Local)return;G.__one6618Local=true;const old=G.render.bind(G);G.render=(...a)=>{const out=old(...a);setTimeout(decorateEvidence,0);return out};decorateEvidence();const list=$('evidenceList');if(list&&!list.dataset.one6618Local){list.dataset.one6618Local='1';list.addEventListener('click',e=>{const b=e.target.closest('[data-one-local]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openLocal(b.dataset.oneLocal)},true)}}

function currentRecord(id=''){return state()?.records?.find?.(r=>String(r.id)===String(id))||null}
async function openTramoFromLast(){const id=state()?.lastShotId||'';if(!id)return toast('Primero toma una foto representativa del tramo.');pendingTramoEvidenceId=id;try{await window.ONE_V661_IDLE_LOADER?.ensure?.('territory')}catch(_){}try{if(typeof UI!=='undefined')UI.setView?.('Places')}catch(_){}setTimeout(()=>{patchTramoStart();$('v6413CorridorCard')?.scrollIntoView?.({behavior:'smooth',block:'start'});toast('🪧 Completa el tramo. Al iniciar, esta foto quedará como primera muestra.',3600)},120)}
function ensureQuickTramo(){const bar=$('quickCaptureBar');if(!bar||$('one6618QuickTramo'))return;const b=document.createElement('button');b.id='one6618QuickTramo';b.type='button';b.textContent='🪧 Tramo';b.title='Usar esta foto como muestra de un tramo repetitivo';bar.insertBefore(b,$('quickCaptureClose')||null);b.onclick=openTramoFromLast}
function patchTramoStart(){const C=window.PropagandaCorridor;if(!C?.start||C.__one6618PendingSample)return false;C.__one6618PendingSample=true;const old=C.start.bind(C);C.start=async(...args)=>{const out=await old(...args);if(C.current?.()&&pendingTramoEvidenceId){const r=currentRecord(pendingTramoEvidenceId);if(r){try{C.addEvidence?.(r,{source:'quick-tramo'});toast('📸 Primera foto vinculada al tramo')}catch(_){}}pendingTramoEvidenceId=''}return out};return true}

function patchSync(){
  const Cloud=window.OneShotCloud,modal=$('cloudSyncModal');if(!Cloud||!modal)return false;
  const test=$('cloudTest');if(test&&!test.dataset.one6618){test.dataset.one6618='1';test.textContent='🧪 Probar escritura';test.onclick=async()=>{const p=$('cloudSyncProgress'),key=$('cloudSyncKey')?.value?.trim()||'';Cloud.saveConfig?.({apiBase:location.origin,syncKey:key});if(!key){if(p)p.textContent='Falta guardar la clave de sincronización.';return}if(p)p.textContent='Probando autorización + escritura real en Dropbox…';try{const data=await Cloud.json('/api/dropbox/write-test',{method:'POST'});if(p)p.textContent=`✓ Escritura Dropbox OK · ${data.path||'/diagnostico/one-shot-write-test.txt'}`;toast('✓ Sincronización autorizada y Dropbox escribe',2800)}catch(err){if(p)p.textContent=`✗ Prueba falló · ${err.message||err}`;toast(`Prueba de sincronización falló · ${err.message||err}`,4000)}}}
  if(!$('cloudSyncOneLatest')){const allBtn=$('cloudSyncAll');if(allBtn){const b=document.createElement('button');b.id='cloudSyncOneLatest';b.type='button';b.textContent='☁ Probar última evidencia';allBtn.insertAdjacentElement('beforebegin',b);b.onclick=async()=>{const p=$('cloudSyncProgress'),key=$('cloudSyncKey')?.value?.trim()||'';Cloud.saveConfig?.({apiBase:location.origin,syncKey:key});const r=(state()?.records||[]).find(x=>x?.image);if(!r){if(p)p.textContent='No hay una evidencia local para probar.';return}if(!key){if(p)p.textContent='Guarda la clave primero.';return}b.disabled=true;const old=b.textContent;b.textContent='Sincronizando 1…';try{await Cloud.syncRecord(r,true);if(p)p.textContent=`✓ 1 evidencia sincronizada · ${r.photoCode||r.id}`;toast('✓ Prueba de una evidencia sincronizada',2600)}catch(err){if(p)p.textContent=`✗ ${err.message||err}`;toast(`No se pudo sincronizar · ${err.message||err}`,4000)}finally{b.disabled=false;b.textContent=old}}}}
  return true;
}
function migrationArrival(){const params=new URLSearchParams(location.search);if(params.get('from')!=='one-shop'||$('one6618Arrival'))return;const d=document.createElement('div');d.id='one6618Arrival';d.style.cssText='position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147483000;background:#071b37;color:#fff;border:1px solid #315781;border-radius:18px;padding:13px;box-shadow:0 18px 50px rgba(0,0,0,.4);display:grid;gap:9px';d.innerHTML='<b>✓ Ya estás en ONE SHOT 2</b><span style="font-size:12px;color:#c8d6e8">ONE SHOP y ONE SHOT 2 no comparten almacenamiento local. Si llegaste mediante el asistente, primero se respaldaron las evidencias recuperables. Configura el acceso de sincronización una sola vez aquí.</span><div style="display:flex;gap:8px"><button id="one6618ArrivalSync" style="flex:1;padding:10px;border:0;border-radius:12px;font-weight:900">☁ Configurar sincronización</button><button id="one6618ArrivalClose" style="padding:10px;border:0;border-radius:12px">Cerrar</button></div>';document.body.appendChild(d);$('one6618ArrivalSync').onclick=()=>window.OneShotCloud?.open?.('Configura la clave y usa “Probar escritura”.');$('one6618ArrivalClose').onclick=()=>d.remove()}
function css(){if($('one6618Css'))return;const s=document.createElement('style');s.id='one6618Css';s.textContent='#quickCaptureBar #one6618QuickTramo{min-height:38px;padding:7px 9px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(173,93,0,.9);color:#fff;font-weight:900}#evidenceList [data-one-local]{background:#ecfdf5;color:#066b4a;border-color:#a7e6cf}@media(max-width:390px){#quickCaptureBar #one6618QuickTramo{font-size:0;width:40px}#quickCaptureBar #one6618QuickTramo::after{content:"🪧";font-size:17px}}';document.head.appendChild(s)}
function bind(){css();patchActivity();patchGallery();ensureQuickTramo();patchTramoStart();patchSync();migrationArrival()}
let tries=0;const timer=setInterval(()=>{tries++;bind();if(tries>300)clearInterval(timer)},120);
document.addEventListener('click',e=>{if(e.target?.closest?.('#cloudSyncChip,[data-nav="sync"],#syncOpenBtn,#cloudTest'))setTimeout(patchSync,80)},true);
window.ONE_V6618_FIELD_FLOW={BUILD,bind,saveActivityLocal,openLocal,openTramoFromLast,get pendingTramoEvidenceId(){return pendingTramoEvidenceId}};
})();
