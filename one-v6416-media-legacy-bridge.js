/* ONE SHOT v6.4.16 · NON-DESTRUCTIVE LEGACY MEDIA BRIDGE */
(()=>{
'use strict';
if(window.ONE_V6416_MEDIA_LEGACY_BRIDGE)return;
const BUILD='oneshot-v6.4.16-edit-flow-evidence-recovery-01';
let tries=0;
const LEGACY_ORIGINAL=['imageOriginal','originalImage','original','photoData','dataUrl','imageData','base64Image','snapshot','captureImage'];
const LEGACY_STAMPED=['evidenceImage','watermarkedImage','markedImage','imageMarked'];
const src=v=>{if(!v)return'';if(typeof v==='string')return v.trim();if(typeof Blob!=='undefined'&&v instanceof Blob)return v;if(typeof v==='object'){for(const k of ['dataUrl','image','src','url','base64'])if(v[k])return v[k];}return''};
function first(r,keys){for(const k of keys){const v=src(r?.[k]);if(v)return v;}return''}
function bridge(record,key,fallback){
  if(!fallback)return;
  const own=Object.prototype.hasOwnProperty.call(record,key),desc=own?Object.getOwnPropertyDescriptor(record,key):null;
  if(own&&src(record[key]))return;
  if(own&&desc?.configurable!==false){try{delete record[key];}catch(_){}}
  if(!Object.prototype.hasOwnProperty.call(record,key))Object.defineProperty(record,key,{configurable:true,enumerable:false,get(){return fallback},set(v){Object.defineProperty(this,key,{value:v,writable:true,configurable:true,enumerable:true})}});
}
function compat(record){
  if(!record||typeof record!=='object')return record;
  bridge(record,'image',first(record,LEGACY_ORIGINAL));
  bridge(record,'stampedImage',first(record,LEGACY_STAMPED)||src(record.rescuedImage)||src(record.image));
  return record;
}
function applyAll(){(State.records||[]).forEach(compat);window.ONE_V6416_EVIDENCE_RECOVERY?.repairDom?.();}
function patchMedia(){const M=window.EvidenceMedia;if(!M||M.__v6416Bridge)return;M.__v6416Bridge=true;const baseSource=M.source.bind(M),baseRaw=M.raw.bind(M);M.source=(r,opt={})=>{compat(r);if(opt?.original&&src(r?.rescuedImage))return typeof r.rescuedImage==='string'?r.rescuedImage:baseSource(r,opt);return baseSource(r,opt);};M.original=r=>{compat(r);return src(r?.rescuedImage)||src(r?.image)||first(r,LEGACY_ORIGINAL)||src(r?.stampedImage)||'';};M.raw=(r,opt={})=>{compat(r);if(opt?.original&&r?.rescuedImage)return r.rescuedImage;return baseRaw(r,opt);};}
function patchRecovery(){const R=window.ONE_V6416_EVIDENCE_RECOVERY;if(!R||R.__legacyBridge)return;R.__legacyBridge=true;const old=R.recoverAll?.bind(R);if(old)R.recoverAll=async(...a)=>{const out=await old(...a);applyAll();return out;};}
function patchStoreLoad(){if(Store.__v6416CompatLoad)return;Store.__v6416CompatLoad=true;const old=Store.load?.bind(Store);if(old)Store.load=async(...a)=>{const out=await old(...a);applyAll();return out;};}
function start(){if(window.__ONE_V6416_MEDIA_LEGACY_BRIDGE_STARTED)return;if(typeof State==='undefined'||typeof Store==='undefined'||!window.EvidenceMedia){if(tries++<180)return void setTimeout(start,70);return;}window.__ONE_V6416_MEDIA_LEGACY_BRIDGE_STARTED=true;patchMedia();patchRecovery();patchStoreLoad();applyAll();setTimeout(applyAll,1200);}
window.ONE_V6416_MEDIA_LEGACY_BRIDGE={BUILD,start,compat,applyAll};window.addEventListener('load',()=>setTimeout(start,3380),{once:true});if(document.readyState==='complete')setTimeout(start,3380);
})();
