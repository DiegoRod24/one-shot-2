/* ONE SHOT v6.6 · POLITICAL ACTIVITY FIELD CAPTURE */
(()=>{
'use strict';
if(window.ONE_V660_POLITICAL_ACTIVITY)return;

const BUILD='oneshot-v6.6.0-field-foundation-01';
const DB_NAME='oneshotPoliticalActivityDB_v1';
const STORE='activities';
const SYNC_CONFIG='oneshotCloudSyncConfig_v1';
const IDENTITY_KEY='oneshotFieldIdentity_v1';
const MAX_BYTES=80*1024*1024;
const MAX_VIDEO_SECONDS=90;
const TYPES=[
  ['ACTIVACION_ORQUESTA','Activación / orquesta / espectáculo'],
  ['MITIN_REUNION','Mitin / reunión pública'],
  ['MARCHA','Marcha / caminata'],
  ['CARAVANA','Caravana / recorrido vehicular'],
  ['ENTREGA_REGALOS','Entrega de regalos / bienes observada'],
  ['VENTA_ENTREGA_MATERIAL','Venta o entrega de material'],
  ['VOLANTEO','Volanteo / distribución de propaganda'],
  ['PUERTA_A_PUERTA','Actividad puerta a puerta'],
  ['BANDERAZO','Banderazo / concentración'],
  ['OTRA_ACTIVIDAD','Otra actividad política']
];
let dbPromise=null,currentFile=null,currentDuration=0,currentGeo=null,previewUrl='';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const parse=(raw,fallback={})=>{try{return JSON.parse(raw||'')||fallback}catch(_){return fallback}};
const uid=()=>crypto?.randomUUID?.()||`act-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function db(){
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE)){const s=d.createObjectStore(STORE,{keyPath:'id'});s.createIndex('syncStatus','syncStatus',{unique:false});s.createIndex('createdAt','createdAt',{unique:false});}};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  return dbPromise;
}
async function put(row){const d=await db();return new Promise((res,rej)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(row);tx.oncomplete=()=>res(row);tx.onerror=()=>rej(tx.error);});}
async function all(){const d=await db();return new Promise((res,rej)=>{const r=d.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});}
function syncConfig(){return parse(localStorage.getItem(SYNC_CONFIG),{});}
function identity(){return parse(localStorage.getItem(IDENTITY_KEY),{});}
function maps(g){return g&&Number.isFinite(Number(g.latitude))&&Number.isFinite(Number(g.longitude))?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${g.latitude},${g.longitude}`)}`:''}
function routeContext(){
  const a=(State?.settings?.teamAssignments||[]).find(x=>x.id===State?.settings?.activeTeamAssignmentId)||{};
  return {
    captureMode:State?.settings?.currentMission?'MISION':State?.settings?.currentRoute?'RECORRIDO':'LIBRE',
    missionId:State?.settings?.currentMission?.id||'',missionName:State?.settings?.currentMission?.name||'',
    routeId:State?.settings?.currentRoute?.id||'',teamAssignmentId:State?.settings?.activeTeamAssignmentId||'',
    teamMemberId:a.memberId||'',teamSector:a.sector||''
  };
}
function code(){const d=new Date(),day=d.toISOString().slice(0,10).replaceAll('-',''),tail=Math.random().toString(16).slice(2,8).toUpperCase();return `ACT-${day}-${tail}`;}
function geoText(g){if(!g)return 'Ubicación pendiente';return [g.address,g.district,g.province,g.department].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).join(' · ')||'Ubicación pendiente';}

async function getGeo(){
  const status=$('v660ActivityGps');if(status)status.textContent='📍 Obteniendo GPS y dirección…';
  try{
    let g=State?.gps&&Date.now()-(State.gps.receivedAt||State.gps.timestamp||0)<30000?{...State.gps}:null;
    if(!g&&typeof GPS!=='undefined')g=await GPS.current(7000,true);
    let loc={address:'Ubicación pendiente',district:'',province:'',department:'',ubigeo:'UBIGEO pendiente'};
    if(g&&typeof GPS!=='undefined')loc=await GPS.reverse(g);
    currentGeo={gps:g?{...g}:null,...loc};
    if(status)status.textContent=`📍 ${geoText(currentGeo)}${g?.accuracy?` · ±${Math.round(g.accuracy)} m`:''}`;
  }catch(e){currentGeo={gps:null,address:'Ubicación pendiente',district:'',province:'',department:'',ubigeo:'UBIGEO pendiente'};if(status)status.textContent='⚠ No pude obtener ubicación. Puedes guardar y quedará pendiente de revisión.';}
  return currentGeo;
}
function parties(){return Array.isArray(window.ONE_PARTY_CATALOG_V6410)?window.ONE_PARTY_CATALOG_V6410.map(x=>x.name).filter(Boolean):[];}
function reset(){currentFile=null;currentDuration=0;currentGeo=null;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}const media=$('v660ActivityPreview');if(media)media.innerHTML='<div class="v660ActivityEmpty">📷 Foto o 🎥 video de la actividad</div>';if($('v660ActivityNote'))$('v660ActivityNote').value='';if($('v660ActivityFileMeta'))$('v660ActivityFileMeta').textContent='Sin archivo seleccionado';getGeo();stats();}
function close(){const m=$('v660ActivityModal');if(m)m.classList.remove('open');if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}}
function open(){ensureUi();$('v660ActivityModal')?.classList.add('open');reset();}

async function inspectFile(file){
  if(!file)return;
  if(file.size>MAX_BYTES){currentFile=null;return UI?.toast?.('El archivo supera 80 MB. Graba un clip más corto.',3000);}
  if(!/^image\//.test(file.type)&&!/^video\//.test(file.type)){currentFile=null;return UI?.toast?.('Selecciona una foto o video.',2500);}
  currentDuration=0;
  if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(file);
  const box=$('v660ActivityPreview');
  if(/^video\//.test(file.type)){
    const v=document.createElement('video');v.src=previewUrl;v.controls=true;v.playsInline=true;v.preload='metadata';
    v.onloadedmetadata=()=>{currentDuration=Number(v.duration||0);if(currentDuration>MAX_VIDEO_SECONDS){currentFile=null;$('v660ActivityFileMeta').textContent=`⚠ ${Math.round(currentDuration)} s · supera máximo de ${MAX_VIDEO_SECONDS} s`;UI?.toast?.(`Video demasiado largo. Máximo ${MAX_VIDEO_SECONDS} segundos.`,3200);}else fileMeta(file);};
    box.innerHTML='';box.appendChild(v);
  }else{box.innerHTML=`<img src="${previewUrl}" alt="Actividad política">`;fileMeta(file);}
  currentFile=file;
}
function fileMeta(file){const size=(file.size/1024/1024).toFixed(1),dur=currentDuration?` · ${Math.round(currentDuration)} s`:'';$('v660ActivityFileMeta').textContent=`${file.type.startsWith('video/')?'Video':'Foto'} · ${size} MB${dur}`;}

function metadata(){
  const party=$('v660ActivityParty')?.value.trim()||'',activityType=$('v660ActivityType')?.value||'',note=$('v660ActivityNote')?.value.trim()||'',id=uid(),activityCode=code(),d=new Date(),who=identity(),geo=currentGeo||{};
  return {
    id,activityCode,entity:'political_activity',schemaVersion:'PoliticalActivityV1',sourceApp:'one-shot-2',sourceVersion:BUILD,
    createdAt:d.toISOString(),fecha:typeof Dates!=='undefined'?Dates.date(d):d.toISOString().slice(0,10),hora:typeof Dates!=='undefined'?Dates.time(d):d.toTimeString().slice(0,8),
    party,activityType,note,mediaKind:currentFile?.type?.startsWith('video/')?'VIDEO':'PHOTO',mediaType:currentFile?.type||'',mediaSize:currentFile?.size||0,durationSeconds:currentDuration||0,
    gps:geo.gps||null,gpsStatus:geo.gps?'GPS_CAPTURA':'SIN_GPS',accuracy:geo.gps?.accuracy??'',address:geo.address||'',addressStructured:geo.addressStructured||'',department:geo.department||'',province:geo.province||'',district:geo.district||'',ubigeo:geo.ubigeo||'UBIGEO pendiente',googleMapsUrl:maps(geo.gps),
    electionProcess:State?.settings?.activeProcess||'ERM',reviewStatus:'PENDIENTE',reviewSource:'FIELD_FIRST_FILTER',
    teamId:who.teamId||'',reviewer:who.reviewer||State?.settings?.reviewer||'',deviceId:who.deviceId||'',...routeContext(),
    syncStatus:'PENDING',syncError:'',cloud:null,updatedAt:d.toISOString()
  };
}
async function save(){
  if(!currentFile)return UI?.toast?.('Primero toma una foto o graba un video.',2500);
  const party=$('v660ActivityParty')?.value.trim();if(!party)return UI?.toast?.('Selecciona la organización política.',2200);
  const activityType=$('v660ActivityType')?.value;if(!activityType)return UI?.toast?.('Selecciona el tipo de actividad.',2200);
  const row=metadata();row.mediaBlob=currentFile;await put(row);UI?.toast?.('✓ Actividad guardada en el teléfono',1800,{placement:'top',tone:'soft'});await syncOne(row).catch(()=>{});reset();await stats();
}
async function syncOne(row){
  const cfg=syncConfig();if(!cfg.syncKey||!navigator.onLine){row.syncStatus='PENDING';await put(row);return false;}
  row.syncStatus='SYNCING';row.syncError='';await put(row);
  try{
    const form=new FormData(),meta={...row};delete meta.mediaBlob;form.set('metadata',JSON.stringify(meta));form.set('media',new File([row.mediaBlob],row.mediaKind==='VIDEO'?'actividad-video':'actividad-foto',{type:row.mediaType||row.mediaBlob.type||'application/octet-stream'}));
    const headers=new Headers();headers.set('authorization',`Bearer ${cfg.syncKey}`);
    const res=await fetch('/api/dropbox/activity-upload',{method:'POST',headers,body:form,cache:'no-store'});const data=await res.json().catch(()=>({}));if(!res.ok||data.ok===false)throw new Error(data.message||`HTTP ${res.status}`);
    row.syncStatus='SYNCED';row.syncError='';row.cloud={provider:'dropbox',root:data.root,mediaPath:data.mediaPath,metadataPath:data.metadataPath,syncedAt:data.syncedAt};row.updatedAt=new Date().toISOString();await put(row);return true;
  }catch(e){row.syncStatus='ERROR';row.syncError=e.message||String(e);await put(row);throw e;}
}
async function syncPending(){const rows=(await all()).filter(x=>x.syncStatus!=='SYNCED');if(!rows.length)return UI?.toast?.('No hay actividades pendientes.');let ok=0,fail=0;for(const r of rows){try{if(await syncOne(r))ok++;}catch(_){fail++;}await stats();}UI?.toast?.(`Actividades · ${ok} sincronizadas · ${fail} error`,2600);}
async function stats(){try{const rows=await all(),s={total:rows.length,synced:0,pending:0,error:0};rows.forEach(r=>{if(r.syncStatus==='SYNCED')s.synced++;else if(r.syncStatus==='ERROR')s.error++;else s.pending++;});const el=$('v660ActivityStats');if(el)el.innerHTML=`<span>🎬 <b>${s.total}</b> actividades</span><span>☁ <b>${s.synced}</b> sincronizadas</span><span>🟡 <b>${s.pending}</b> pendientes</span><span>🔴 <b>${s.error}</b> error</span>`;return s;}catch(_){return null;}}

function ensureUi(){
  if($('v660ActivityModal'))return;
  const tools=$('cameraTopTools');if(tools&&!$('v660ActivityBtn')){const b=document.createElement('button');b.id='v660ActivityBtn';b.className='cameraIconBtn glass3d v660ActivityBtn';b.type='button';b.title='Registrar actividad política';b.innerHTML='<span>🎥</span>';tools.appendChild(b);b.onclick=open;}
  const m=document.createElement('div');m.id='v660ActivityModal';m.className='v660ActivityModal';
  m.innerHTML=`<div class="v660ActivityCard"><header><div><b>🎬 Actividad política</b><small>Foto o video geolocalizado · separado de PANEL / BANNER / PINTA</small></div><button id="v660ActivityClose">×</button></header>
    <div id="v660ActivityStats" class="v660ActivityStats"></div>
    <div id="v660ActivityPreview" class="v660ActivityPreview"><div class="v660ActivityEmpty">📷 Foto o 🎥 video de la actividad</div></div>
    <small id="v660ActivityFileMeta" class="v660ActivityFileMeta">Sin archivo seleccionado</small>
    <div class="v660ActivityCapture"><button id="v660ActivityPhoto">📷 Tomar foto</button><button id="v660ActivityVideo">🎥 Grabar video</button></div>
    <input id="v660ActivityPhotoInput" type="file" accept="image/*" capture="environment" hidden><input id="v660ActivityVideoInput" type="file" accept="video/*" capture="environment" hidden>
    <label>Organización política<input id="v660ActivityParty" list="v660PartyList" placeholder="Selecciona o escribe el partido"><datalist id="v660PartyList">${parties().map(p=>`<option value="${esc(p)}"></option>`).join('')}</datalist></label>
    <label>Tipo de actividad<select id="v660ActivityType"><option value="">Seleccionar…</option>${TYPES.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('')}</select></label>
    <label>Observación opcional<textarea id="v660ActivityNote" rows="2" placeholder="Ej. escenario con orquesta, entrega observada, marcha por avenida…"></textarea></label>
    <div id="v660ActivityGps" class="v660ActivityGps">📍 Ubicación pendiente</div>
    <div class="v660ActivityActions"><button id="v660ActivityRefreshGps">⌖ Actualizar ubicación</button><button id="v660ActivitySync">☁ Reintentar pendientes</button><button id="v660ActivitySave" class="primary">✓ Guardar actividad</button></div>
    <p class="v660ActivityNote">ONE SHOT registra lo observado; la validación normativa o calificación final corresponde al segundo filtro en Operaciones. Video máximo ${MAX_VIDEO_SECONDS} s / 80 MB.</p></div>`;
  document.body.appendChild(m);
  $('v660ActivityClose').onclick=close;m.addEventListener('click',e=>{if(e.target===m)close();});
  $('v660ActivityPhoto').onclick=()=>$('v660ActivityPhotoInput').click();$('v660ActivityVideo').onclick=()=>$('v660ActivityVideoInput').click();
  $('v660ActivityPhotoInput').onchange=e=>inspectFile(e.target.files?.[0]);$('v660ActivityVideoInput').onchange=e=>inspectFile(e.target.files?.[0]);
  $('v660ActivityRefreshGps').onclick=getGeo;$('v660ActivitySync').onclick=syncPending;$('v660ActivitySave').onclick=save;stats();
}

function fieldFoundation(){
  try{
    if(typeof State!=='undefined'&&State.settings){State.settings.assistantVoice=false;State.settings.assistantAuto=false;Store?.saveLite?.();}
    document.documentElement.dataset.oneShotVoice='off';
  }catch(_){}
}
function start(){ensureUi();fieldFoundation();window.addEventListener('online',()=>syncPending().catch(()=>{}));setTimeout(()=>syncPending().catch(()=>{}),1800);}
window.ONE_V660_POLITICAL_ACTIVITY={BUILD,open,syncPending,stats,TYPES};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,500),{once:true});else setTimeout(start,500);
})();
