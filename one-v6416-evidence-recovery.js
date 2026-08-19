/* ONE SHOT v6.4.16 · EVIDENCE MEDIA COMPAT + DURABLE STORAGE */
(()=>{
'use strict';
if(window.ONE_V6416_EVIDENCE_RECOVERY)return;
const BUILD='oneshot-v6.4.16-edit-flow-evidence-recovery-01';
let tries=0;
const objectUrls=new WeakMap(),saveResult=new Map(),emergencyDone=new Set();
const MEDIA_FIELDS=['rescuedImage','stampedImage','evidenceImage','watermarkedImage','markedImage','imageMarked','image','imageOriginal','originalImage','original','photo','photoData','dataUrl','imageData','base64Image','snapshot','captureImage'];
const ORIGINAL_FIELDS=['image','imageOriginal','originalImage','original','photo','photoData','dataUrl','imageData','base64Image','snapshot','captureImage','rescuedImage','stampedImage'];
function nested(r){return [r?.media?.image,r?.media?.original,r?.media?.stamped,r?.photo?.dataUrl,r?.photo?.image,r?.file?.dataUrl].filter(Boolean)}
function valueSource(v){
  if(!v)return'';
  if(typeof v==='string')return v.trim();
  if(typeof Blob!=='undefined'&&v instanceof Blob){if(!objectUrls.has(v))objectUrls.set(v,URL.createObjectURL(v));return objectUrls.get(v)||'';}
  if(typeof v==='object'){for(const k of ['dataUrl','image','src','url','base64']){const x=v[k];if(typeof x==='string'&&x.trim())return x.trim();}}
  return'';
}
function candidateValue(r,fields=MEDIA_FIELDS){if(!r)return null;for(const f of fields){const v=r[f];if(valueSource(v))return v;}for(const v of nested(r))if(valueSource(v))return v;return null}
const Media={
  fields:MEDIA_FIELDS,
  source(r,{original=false}={}){return valueSource(candidateValue(r,original?ORIGINAL_FIELDS:MEDIA_FIELDS));},
  original(r){return valueSource(candidateValue(r,ORIGINAL_FIELDS));},
  stamped(r){return valueSource(candidateValue(r,['rescuedImage','stampedImage','evidenceImage','watermarkedImage','markedImage','imageMarked','image','imageOriginal','originalImage','original','photo','photoData','dataUrl','imageData']));},
  has(r){return !!this.source(r);},
  raw(r,{original=false}={}){return candidateValue(r,original?ORIGINAL_FIELDS:MEDIA_FIELDS);},
  async file(r,name){const raw=this.raw(r),src=valueSource(raw);if(typeof Blob!=='undefined'&&raw instanceof Blob)return new File([raw],name,{type:raw.type||'image/jpeg'});if(/^data:/i.test(src))return Share.dataUrlToFile(src,name);throw new Error('La imagen existe, pero este formato anterior no puede exportarse directamente. Usa el respaldo maestro.');},
  stats(){const total=State.records?.length||0,withMedia=(State.records||[]).filter(r=>this.has(r)).length;return{total,withMedia,withoutMedia:Math.max(0,total-withMedia)};}
};
function setImage(img,src,parent){if(!img)return;if(src){if(img.src!==src)img.src=src;img.classList.remove('v6416NoMedia');parent?.removeAttribute('data-no-media');}else{img.removeAttribute('src');img.classList.add('v6416NoMedia');parent?.setAttribute('data-no-media','1');img.alt='Registro encontrado · fotografía no disponible en este almacenamiento';}}
function repairDom(){
  document.querySelectorAll('#evidenceList .eCard[data-id]').forEach(card=>{const r=State.records.find(x=>String(x.id)===String(card.dataset.id));setImage(card.querySelector('.eMedia img'),Media.stamped(r),card.querySelector('.eMedia'));});
  const vr=typeof Viewer!=='undefined'?Viewer.current?.():null;setImage(document.getElementById('viewerImg'),Media.stamped(vr),document.getElementById('viewerImg')?.parentElement);
  setImage(document.getElementById('editEvidenceImg'),Media.source(Editor?.current,{original:true}),document.getElementById('editImageStage'));
  const qr=window.ONE_V646_EVIDENCE&&typeof Evidence!=='undefined'?(Evidence.visible?.()||[])[0]:null;const quick=document.getElementById('v646QuickImg');if(quick&&!quick.getAttribute('src')&&qr)setImage(quick,Media.stamped(qr),quick.parentElement);
  document.querySelectorAll('#placeTimeline [data-evidence-id]').forEach(row=>{const r=State.records.find(x=>String(x.id)===String(row.dataset.evidenceId));setImage(row.querySelector('img'),Media.stamped(r),row);});
  const last=State.records.find(x=>x.id===State.lastShotId)||State.records[0],lastBtn=document.getElementById('lastShotBtn'),lastSrc=Media.stamped(last);if(lastBtn&&lastSrc){lastBtn.style.backgroundImage=`url("${lastSrc}")`;lastBtn.style.backgroundSize='cover';lastBtn.style.backgroundPosition='center';}
}
function patchLegacy(){
  if(typeof LegacyVault==='undefined'||LegacyVault.__v6416Media)return;LegacyVault.__v6416Media=true;
  const old=LegacyVault.normalize?.bind(LegacyVault);if(old)LegacyVault.normalize=(raw,source='legacy')=>{const n=old(raw,source);if(!n)return n;if(!valueSource(n.image)){const v=candidateValue(raw,ORIGINAL_FIELDS);if(v)n.image=v;}if(!valueSource(n.stampedImage)){const v=candidateValue(raw,['stampedImage','evidenceImage','watermarkedImage','markedImage','imageMarked','rescuedImage']);if(v)n.stampedImage=v;}return n;};
}
function dbGet(id){return new Promise(resolve=>{try{if(!State.db)return resolve(null);const q=State.db.transaction('records','readonly').objectStore('records').get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>resolve(null);}catch(_){resolve(null)}})}
function ensureDb(){if(State.db)return Promise.resolve(true);return new Promise(resolve=>{let q;try{q=indexedDB.open('oneshotEvidenceDB_v2',1);}catch(_){return resolve(false)}q.onupgradeneeded=()=>{try{if(!q.result.objectStoreNames.contains('records'))q.result.createObjectStore('records',{keyPath:'id'});}catch(_){}};q.onsuccess=()=>{State.db=q.result;resolve(true)};q.onerror=()=>resolve(false);});}
function incomingHasMedia(r){return !!Media.source(r)}
function storedMediaOkay(input,saved){if(!incomingHasMedia(input))return !!saved;return !!saved&&!!Media.source(saved)}
async function durablePut(record){
  if(!record?.id)throw new Error('Registro sin ID');if(!(await ensureDb()))throw new Error('IndexedDB no disponible');record.updatedAt=new Date().toISOString();
  await new Promise((resolve,reject)=>{let tx;try{tx=State.db.transaction('records','readwrite');tx.objectStore('records').put(record);}catch(e){return reject(e)}tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error('Error de almacenamiento'));tx.onabort=()=>reject(tx.error||new Error('Almacenamiento cancelado'));});
  const saved=await dbGet(record.id);if(!storedMediaOkay(record,saved))throw new Error('La evidencia no pudo verificarse después de guardarla');return saved;
}
async function emergency(record,err){
  const id=String(record?.id||record?.photoCode||'unknown');if(emergencyDone.has(id))return;emergencyDone.add(id);
  try{const payload={format:'ONE_SHOT_EMERGENCY_EVIDENCE',schema:1,createdAt:new Date().toISOString(),reason:String(err?.name||err?.message||err||'storage'),record};const file=new File([JSON.stringify(payload)],`ONE_SHOT_RECUPERACION_${String(record?.photoCode||'FOTO').replace(/[^A-Z0-9_-]/gi,'_')}.json`,{type:'application/json'});await Share.downloadFile(file);UI.toast('⚠ No pude confirmar el almacenamiento. Generé un respaldo de recuperación de esta foto. No cierres la app hasta verificarlo.',6500);}catch(e){console.error('Emergency evidence backup',e);UI.toast('⚠ La foto sigue abierta, pero no pude confirmar su almacenamiento. No cierres ONE SHOT y exporta un respaldo desde Herramientas.',6500);}
}
async function storageFailure(record,e){console.error('ONE SHOT durable storage',e);saveResult.set(String(record?.id||''),{ok:false,at:Date.now(),error:e});await emergency(record,e);}
function patchStore(){
  if(Store.__v6416Durable)return;Store.__v6416Durable=true;
  Store.get=dbGet;
  Store.save=async record=>{
    try{const saved=await durablePut(record);saveResult.set(String(record.id),{ok:true,at:Date.now()});Store.saveLite();Reports.invalidate();return saved;}
    catch(e){await storageFailure(record,e);return null;}
  };
  Store.saveBatch=async(records=State.records)=>{
    const list=Array.from(records||[]);if(!list.length){Store.saveLite();Reports.invalidate();return true;}if(!(await ensureDb())){UI.toast('No pude abrir el almacenamiento de evidencias.',4200);return false;}
    try{await new Promise((resolve,reject)=>{let tx;try{tx=State.db.transaction('records','readwrite');const os=tx.objectStore('records'),now=new Date().toISOString();for(const r of list){r.updatedAt=now;os.put(r);}}catch(e){return reject(e)}tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Error de guardado masivo'));tx.onabort=()=>reject(tx.error||new Error('Guardado masivo cancelado'));});Store.saveLite();Reports.invalidate();return true;}catch(e){console.error('ONE SHOT saveBatch',e);UI.toast('⚠ No se pudo confirmar el guardado masivo. No se borró ningún registro en memoria.',4800);return false;}
  };
}
async function verifyCapture(id){
  if(!id)return;let saved=null;for(const ms of [220,420,750,1200]){await new Promise(r=>setTimeout(r,ms));saved=await dbGet(id);if(saved&&Media.has(saved))break;}
  const live=State.records.find(x=>x.id===id);if(saved&&Media.has(saved)){saveResult.set(String(id),{ok:true,at:Date.now()});UI.toast(`✓ Evidencia guardada y verificada · ${live?.photoCode||''}`.trim(),1900,{placement:'top',tone:'soft'});}
  else if(live){await storageFailure(live,new Error('La captura no apareció en IndexedDB después de varios intentos'));}
}
function patchCamera(){if(Camera.__v6416StorageCheck)return;Camera.__v6416StorageCheck=true;const old=Camera.shoot?.bind(Camera);if(!old)return;Camera.shoot=async(...a)=>{const before=State.lastShotId,out=await old(...a),id=State.lastShotId;if(id&&id!==before){UI.toast('📸 Captura realizada · verificando guardado…',1300,{placement:'top',tone:'soft'});verifyCapture(id).catch(()=>{});}return out;};}
function patchEditor(){if(Editor.__v6416DurablePersist)return;Editor.__v6416DurablePersist=true;const old=Editor.persist?.bind(Editor);if(old)Editor.persist=async opts=>{const out=await old(opts);if(out?.id){const saved=await dbGet(out.id);if(!saved){Editor.paintSaveStatus?.('error','No se pudo confirmar el guardado');throw new Error('No se pudo confirmar el guardado de esta evidencia');}}return out;};const open=Editor.open?.bind(Editor);if(open&&!Editor.__v6416MediaOpen){Editor.__v6416MediaOpen=true;Editor.open=(...a)=>{const out=open(...a);setTimeout(()=>setImage(document.getElementById('editEvidenceImg'),Media.source(Editor.current,{original:true}),document.getElementById('editImageStage')),40);return out;};}}
function patchViews(){
  if(Gallery.__v6416Media)return;Gallery.__v6416Media=true;
  const gr=Gallery.render?.bind(Gallery);if(gr)Gallery.render=(...a)=>{const out=gr(...a);setTimeout(repairDom,0);return out;};
  const gl=Gallery.updateLastShot?.bind(Gallery);if(gl)Gallery.updateLastShot=r=>{const out=gl(r);setTimeout(repairDom,0);return out;};
  const vr=Viewer.render?.bind(Viewer);if(vr)Viewer.render=(...a)=>{const out=vr(...a);setTimeout(repairDom,0);return out;};
  const po=Places.open?.bind(Places);if(po)Places.open=(...a)=>{const out=po(...a);setTimeout(repairDom,0);return out;};
  const qp=window.ONE_V646_EVIDENCE?.paint;if(qp&&typeof qp==='function'&&!window.ONE_V646_EVIDENCE.__v6416Media){window.ONE_V646_EVIDENCE.__v6416Media=true;window.ONE_V646_EVIDENCE.paint=(...a)=>{const out=qp(...a);setTimeout(repairDom,0);return out;};}
  Viewer.download=async()=>{const r=Viewer.current?.();if(!r)return;try{await Share.downloadFile(await Media.file(r,`${r.photoCode||'EVIDENCIA'}.jpg`));UI.toast('Foto guardada');}catch(e){UI.toast(e.message||String(e),3600);}};
  Viewer.share=async()=>{const r=Viewer.current?.();if(!r)return;try{await Share.shareFile(await Media.file(r,`${r.photoCode||'EVIDENCIA'}.jpg`),`ONE SHOT · ${r.photoCode||''}\n${r.address||''}`);}catch(e){UI.toast(e.message||String(e),3600);}};
}
function patchReports(){
  if(Reports.__v6416Media)return;Reports.__v6416Media=true;
  const make=Reports.makeExcel?.bind(Reports);if(make)Reports.makeExcel=async(...a)=>{const data=Evidence.selectedForReport?.()||[],bak=[];for(const r of data){const b={r,hasImage:Object.prototype.hasOwnProperty.call(r,'image'),image:r.image,hasStamped:Object.prototype.hasOwnProperty.call(r,'stampedImage'),stamped:r.stampedImage};let src=Media.original(r),st=Media.stamped(r);if(!valueSource(r.image)&&/^data:/i.test(src))r.image=src;if(!valueSource(r.stampedImage)&&/^data:/i.test(st))r.stampedImage=st;bak.push(b);}try{return await make(...a);}finally{for(const b of bak){if(b.hasImage)b.r.image=b.image;else delete b.r.image;if(b.hasStamped)b.r.stampedImage=b.stamped;else delete b.r.stampedImage;}}};
  const preview=Reports.preview?.bind(Reports);if(preview)Reports.preview=(...a)=>{const out=preview(...a);setTimeout(()=>{const data=Evidence.selectedForReport?.()||[];document.querySelectorAll('#reportPreviewList .previewItem').forEach((row,i)=>setImage(row.querySelector('img'),Media.stamped(data[i]),row));},0);return out;};
}
async function storageInfo(){let persisted=null,usage=0,quota=0;try{persisted=await navigator.storage?.persisted?.();if(persisted===false)persisted=await navigator.storage?.persist?.();const e=await navigator.storage?.estimate?.();usage=Number(e?.usage||0);quota=Number(e?.quota||0);}catch(_){}return{persisted,usage,quota,pct:quota?Math.round(usage/quota*100):0};}
async function recoverAll(auto=false){
  try{patchLegacy();const res=await LegacyVault.recover?.(auto);repairDom();Gallery.render?.();Reports.renderSummary?.();const st=Media.stats();if(!auto){const tail=st.withoutMedia?` · ${st.withoutMedia} registro(s) existen pero no contienen bytes de foto accesibles aquí`:'';UI.toast(`Revisión lista · ${st.withMedia}/${st.total} evidencias con imagen${tail}`,5200);}return{...res,...st};}catch(e){console.error('Legacy recovery v6416',e);if(!auto)UI.toast('No pude completar la búsqueda de evidencias anteriores.',3600);return null;}
}
function ensureButton(){const head=document.querySelector('#viewEvidence .headActions');if(!head||document.getElementById('v6416RecoverPhotosBtn'))return;const b=document.createElement('button');b.id='v6416RecoverPhotosBtn';b.type='button';b.className='btn light small';b.textContent='↺ Fotos anteriores';b.title='Buscar evidencias de versiones anteriores guardadas en este dispositivo';b.onclick=async()=>{b.disabled=true;b.textContent='Buscando…';await recoverAll(false);b.disabled=false;b.textContent='↺ Fotos anteriores';};head.appendChild(b);}
function css(){if(document.getElementById('v6416EvidenceRecoveryCss'))return;const s=document.createElement('style');s.id='v6416EvidenceRecoveryCss';s.textContent=`
.eMedia[data-no-media="1"],.v646QuickMedia[data-no-media="1"],#editImageStage[data-no-media="1"]{position:relative;background:linear-gradient(135deg,#0b1d35,#132d50)!important}
.eMedia[data-no-media="1"]:after,.v646QuickMedia[data-no-media="1"]:after,#editImageStage[data-no-media="1"]:after{content:'📷 Registro encontrado · foto no disponible en este almacenamiento';position:absolute;inset:0;display:grid;place-items:center;padding:18px;text-align:center;color:#d5e3f5;font-weight:800;font-size:12px}
.v6416NoMedia{visibility:hidden!important}
#v6416RecoverPhotosBtn{white-space:nowrap}
`;document.head.appendChild(s);}
function start(){if(window.__ONE_V6416_EVIDENCE_RECOVERY_STARTED)return;if(typeof Store==='undefined'||typeof State==='undefined'||typeof Gallery==='undefined'||typeof LegacyVault==='undefined'||typeof Camera==='undefined'){if(tries++<180)return void setTimeout(start,80);return;}window.__ONE_V6416_EVIDENCE_RECOVERY_STARTED=true;css();patchLegacy();patchStore();patchCamera();patchEditor();patchViews();patchReports();ensureButton();storageInfo().then(i=>{if(i.pct>=85)UI.toast(`⚠ Almacenamiento al ${i.pct}%. Conviene exportar un respaldo maestro antes de seguir tomando fotos.`,5200);const b=document.getElementById('v6416RecoverPhotosBtn');if(b)b.title=`Buscar fotos anteriores · almacenamiento ${i.persisted===true?'persistente':i.persisted===false?'no persistente':'sin dato'}${i.pct?` · ${i.pct}% usado`:''}`;});setTimeout(()=>recoverAll(true),650);setTimeout(repairDom,1200);}
window.EvidenceMedia=Media;
window.ONE_V6416_EVIDENCE_RECOVERY={BUILD,start,Media,recoverAll,repairDom,dbGet,verifyCapture,saveResult};
window.addEventListener('load',()=>setTimeout(start,3250),{once:true});if(document.readyState==='complete')setTimeout(start,3250);
})();
