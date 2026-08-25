/* ONE SHOT v6.6.23 · TRAMO STATE HOTFIX */
(()=>{
'use strict';
if(window.ONE_V6623_TRAMO_STATE_HOTFIX)return;
const BUILD='oneshot-v6.6.23-tramo-state-hotfix-01';
const $=id=>document.getElementById(id);
const num=v=>Number(v||0);
const valid=p=>!!p&&Number.isFinite(Number(p.latitude))&&Number.isFinite(Number(p.longitude));
const ST=()=>{try{return typeof State!=='undefined'?State:window.State}catch(_){return window.State}};
const SV=()=>{try{return typeof Store!=='undefined'?Store:window.Store}catch(_){return window.Store}};
const PC=()=>{try{return typeof PropagandaCorridor!=='undefined'?PropagandaCorridor:window.PropagandaCorridor}catch(_){return window.PropagandaCorridor}};
const RC=()=>{try{return typeof RouteCoverage!=='undefined'?RouteCoverage:window.RouteCoverage}catch(_){return window.RouteCoverage}};
let patched=false,tries=0;
function toast(m,ms=2800){try{const u=typeof UI!=='undefined'?UI:window.UI;u?.toast?.(m,ms,{placement:'top',tone:'soft'})}catch(_){}}
function now(){return new Date().toISOString()}
function current(){const c=PC();try{return c?.current?.()||ST()?.settings?.currentPropagandaCorridor||null}catch(_){return ST()?.settings?.currentPropagandaCorridor||null}}
function seed(){const s=window.ONE_V6619_TRAMO_SEED;if(s?.gps&&valid(s.gps))return s;const st=ST(),r=(st?.records||[]).find(x=>String(x.id)===String(st?.lastShotId||''));return r&&valid(r.gps)?{evidenceId:r.id,photoCode:r.photoCode||r.id,gps:{latitude:num(r.gps.latitude),longitude:num(r.gps.longitude),accuracy:num(r.gps.accuracy),timestamp:num(r.gps.timestamp)||Date.parse(r.createdAt)||Date.now()},address:r.captureAddress||r.address||'',ubigeo:r.ubigeo||''}:null}
function pointA(){const s=seed();if(s?.gps&&valid(s.gps))return {...s.gps,source:'EVIDENCE_A'};const g=ST()?.gps;return valid(g)?{latitude:num(g.latitude),longitude:num(g.longitude),accuracy:num(g.accuracy),timestamp:num(g.timestamp)||Date.now(),source:'LIVE_GPS_A'}:null}
function save(){try{SV()?.saveLite?.()}catch(_){}}
function countQuality(v){v=String(v||'').toUpperCase();if(v==='ESTIMADO'||v==='APROXIMADO')return'APROXIMADO';if(v==='NO_CONTADO')return'NO_CONTADO';return'EXACTO'}
function ensureSettings(){const st=ST();if(!st)return null;st.settings=st.settings||{};st.settings.propagandaCorridors=Array.isArray(st.settings.propagandaCorridors)?st.settings.propagandaCorridors:[];return st}
function repairUi(){const C=PC(),card=$('v6413CorridorCard');if(!C||!card)return false;try{if(C.injectV6617&&!$('v6617PoleInput')){delete card.dataset.v6617;C.injectV6617()}}catch(e){console.warn('[ONE SHOT TRAMO] reparación UI',e)}try{window.ONE_V6620_TRAMO_MAP?.prepare?.()}catch(_){}try{window.ONE_V6622_TRAMO_CALLE?.prepare?.()}catch(_){}const type=$('v6413Type');if(type)type.value='CARTEL_POSTE';return true}
async function startTramo(){
  const C=PC(),st=ensureSettings();if(!C||!st)return toast('El módulo Tramo aún está cargando. Intenta nuevamente.');
  if(current()){C.paint?.();toast('Este tramo ya está activo. Continúa dibujando o finalízalo.');return current()}
  const party=String($('v6413Party')?.value||'').trim();
  const road=String($('v6413Road')?.value||seed()?.address||'').trim();
  const pattern=String($('v6413Pattern')?.value||'CADA_POSTE');
  const mode=String($('v6413CountMode')?.value||'EXACTO');
  const distribution=String($('v6622RoadDistribution')?.value||'NO_PRECISADO');
  if(!party)return toast('Selecciona la organización política');
  if(!road)return toast('Indica la vía o tramo');
  let a=pointA();
  if(!a){try{await GPS?.refresh?.()}catch(_){}a=pointA()}
  if(!a)return toast('📍 Falta GPS para fijar el punto A. Actualiza ubicación y vuelve a iniciar.',3400);
  let route=null,ownsRoute=false;
  try{route=RC()?.active?.()||null;if(!route){const input=$('routeNameInput'),old=input?.value||'';if(input)input.value=`Tramo · ${road}`;RC()?.start?.();if(input)input.value=old;route=RC()?.active?.()||null;ownsRoute=!!route}}catch(_){route=null;ownsRoute=false}
  const s=seed(),created=now();
  const c={
    id:`TRM-${Date.now()}`,entityType:'PROPAGANDA_CORRIDOR',findingSubtype:'CARTEL_POSTE_REPETITIVO',repetitiveSubtype:'CARTEL_POSTE',
    status:'ACTIVE',party,type:'CARTEL_POSTE',road,pattern,countMode:mode,countQuality:countQuality(mode),roadDistribution:distribution,
    poleCount:0,posterCount:0,observedCount:0,estimatedCount:0,countHistory:[],startedAt:created,endedAt:'',
    startPoint:{...a},endPoint:null,points:[{...a}],distanceM:0,geometrySource:'',geometryGeoJSON:null,manualGeometry:null,manualGeometryLocked:false,
    routeId:route?.id||'',ownsRoute,evidenceIds:[],sampleMediaIds:[],segments:[],notes:'',normativeReference:'',
    seedEvidenceId:s?.evidenceId||'',seedPhotoCode:s?.photoCode||'',seedAddress:s?.address||road,seedUbigeo:s?.ubigeo||'',
    syncStatus:'PENDING',syncError:'',createdAt:created,updatedAt:created
  };
  st.settings.currentPropagandaCorridor=c;save();
  if(s?.evidenceId){const r=(st.records||[]).find(x=>String(x.id)===String(s.evidenceId));if(r){try{C.addEvidence?.(r,{source:'tramo-point-a'})}catch(e){console.warn('[ONE SHOT TRAMO] muestra A',e)}}}
  save();
  try{C.paint?.()}catch(_){}
  try{window.ONE_V6620_TRAMO_MAP?.reset?.();window.ONE_V6620_TRAMO_MAP?.render?.()}catch(_){}
  setTimeout(()=>{
    try{const b=$('one6620Draw');if(b&&!/Pausar/i.test(b.textContent||''))b.click()}catch(_){}
    try{$('one6620MapCard')?.scrollIntoView?.({behavior:'smooth',block:'start'})}catch(_){}
  },100);
  toast('✓ Tramo iniciado · A guardado. Ahora dibuja hasta B.',3000);
  return c;
}
function patch(){const C=PC();if(!C||patched)return false;patched=true;C.start=startTramo;C.__v6623StartAuthoritative=true;repairUi();return true}
function guardMap(){const mapCard=$('one6620MapCard');if(!mapCard||mapCard.dataset.v6623==='1')return;mapCard.dataset.v6623='1';const apply=$('one6620Apply');if(apply){apply.addEventListener('click',()=>{setTimeout(()=>{const c=current(),h=$('one6620Hint');if(c?.manualGeometry&&h){h.classList.remove('warn');h.textContent='✓ Trazo guardado. Ahora registra conteo/muestras y pulsa Finalizar tramo para cerrar el hallazgo.'}},80)},true)}
}
function prepare(){repairUi();patch();guardMap();const c=current();if(c){try{PC()?.paint?.()}catch(_){}}}
function boot(){if(!PC()||!ST()){if(tries++<160)return setTimeout(boot,60);return}prepare();let n=0;const t=setInterval(()=>{prepare();if(++n>28)clearInterval(t)},220)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,30),{once:true});else setTimeout(boot,30);
window.ONE_V6623_TRAMO_STATE_HOTFIX={BUILD,prepare,start:startTramo,current};
})();
