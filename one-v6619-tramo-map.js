/* ONE SHOT v6.6.19 · TRAMO MAP DRAW */
(()=>{
'use strict';
if(window.ONE_V6619_TRAMO_MAP)return;
const BUILD='oneshot-v6.6.19-tramo-map-startup-01';
const $=id=>document.getElementById(id);
const valid=p=>!!p&&Number.isFinite(Number(p.latitude))&&Number.isFinite(Number(p.longitude));
const num=v=>Number(v||0);
let map=null,tile=null,layers=[],draft=[],drawing=false,tries=0,observer=null,paintTimer=0;
const getState=()=>{try{return typeof State!=='undefined'?State:window.State}catch(_){return window.State}};
const getStore=()=>{try{return typeof Store!=='undefined'?Store:window.Store}catch(_){return window.Store}};
const C=()=>{try{return typeof PropagandaCorridor!=='undefined'?PropagandaCorridor:window.PropagandaCorridor}catch(_){return window.PropagandaCorridor}};
const route=()=>{try{return typeof RouteCoverage!=='undefined'?RouteCoverage:window.RouteCoverage}catch(_){return window.RouteCoverage}};
const toast=(m,ms=2600)=>{try{UI?.toast?.(m,ms,{placement:'top',tone:'soft'})}catch(_){}};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dist(a,b){
  try{const R=route();if(R?.distance)return Number(R.distance(a,b)||0)}catch(_){}
  const r=6371000,p1=num(a.latitude)*Math.PI/180,p2=num(b.latitude)*Math.PI/180,dp=(num(b.latitude)-num(a.latitude))*Math.PI/180,dl=(num(b.longitude)-num(a.longitude))*Math.PI/180;
  const x=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return r*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function length(points=draft){let d=0;const p=(points||[]).filter(valid);for(let i=1;i<p.length;i++)d+=dist(p[i-1],p[i]);return d}
function seed(){const s=window.ONE_V6619_TRAMO_SEED;if(s?.gps&&valid(s.gps))return s;const st=getState(),id=st?.lastShotId||'',r=(st?.records||[]).find(x=>String(x.id)===String(id));return r&&valid(r.gps)?{evidenceId:r.id,photoCode:r.photoCode||r.id,gps:{latitude:num(r.gps.latitude),longitude:num(r.gps.longitude),accuracy:num(r.gps.accuracy),timestamp:num(r.gps.timestamp)||Date.parse(r.createdAt)||Date.now()},address:r.captureAddress||r.address||'',department:r.department||r.region||'',province:r.province||'',district:r.district||'',ubigeo:r.ubigeo||''}:null}
function current(){return C()?.current?.()||null}
function css(){if($('one6619TramoCss'))return;const s=document.createElement('style');s.id='one6619TramoCss';s.textContent=`
.one6619FixedType{border:1px solid #c7d8ee;background:#eef5ff;color:#123d72;border-radius:14px;padding:12px 13px;font-weight:900;line-height:1.3}.one6619FixedType small{display:block;color:#66809e;font-weight:600;margin-top:3px}
#one6619TramoMapCard{margin:12px 0;border:1px solid #ccd9e9;border-radius:20px;background:#f7faff;padding:12px;display:grid;gap:10px;color:#16345f}#one6619TramoMapCard h4{margin:0;font-size:17px}#one6619TramoMapCard p{margin:0;color:#66768c;font-size:12px;line-height:1.4}.one6619MapStatus{display:flex;gap:7px;flex-wrap:wrap}.one6619MapStatus span{padding:6px 8px;border-radius:999px;background:#e7effb;font-size:10px;font-weight:900}.one6619MapCanvas{height:310px;border-radius:17px;overflow:hidden;background:#dfe7f0;position:relative}.one6619MapLoading{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:20px;color:#36506d;font-weight:850;background:linear-gradient(135deg,#eaf1f8,#dce8f5);z-index:1}.one6619MapLoading[hidden]{display:none}.one6619MapActions{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:8px}.one6619MapActions button{border:1px solid #ccd8e8;background:#fff;color:#173e70;border-radius:13px;padding:10px 8px;font-weight:900}.one6619MapActions .primary{background:#1766e8;color:#fff;border-color:#1766e8}.one6619MapActions .apply{grid-column:1/-1;background:#082c5d;color:#fff;border-color:#082c5d}.one6619MapHint{background:#e8f7ef;color:#17613f;border-radius:13px;padding:9px 11px;font-size:11px;font-weight:750;line-height:1.4}.one6619MapHint.warn{background:#fff4d7;color:#785709}
@media(max-width:520px){.one6619MapCanvas{height:280px}.one6619MapActions{grid-template-columns:1fr 1fr}.one6619MapActions .primary{grid-column:1/-1}.one6619MapActions .apply{grid-column:1/-1}}
`;document.head.appendChild(s)}
function fixType(){
  const sel=$('v6413Type');if(!sel||sel.dataset.one6619==='1')return;
  sel.dataset.one6619='1';const label=sel.closest('label');if(!label)return;
  label.innerHTML='<span>Tipo de tramo</span><input id="v6413Type" type="hidden" value="CARTEL_POSTE"><div class="one6619FixedType">🪧 Pancartas / carteles repetitivos en postes<small>Para avenidas, jirones o pasajes donde tomar uno por uno no es operativo.</small></div>';
}
function ensureCard(){
  css();const base=$('v6413CorridorCard');if(!base||$('one6619TramoMapCard'))return false;
  const card=document.createElement('section');card.id='one6619TramoMapCard';card.innerHTML=`<div><h4>🗺️ Dibujar tramo sobre mapa</h4><p>La foto inicial fija el punto A. Luego toca el mapa siguiendo la avenida/pasaje; ONE SHOT calcula distancia y coordenadas.</p></div><div class="one6619MapStatus"><span id="one6619A">A · pendiente</span><span id="one6619B">B · pendiente</span><span id="one6619Dist">0 m</span><span id="one6619Pts">0 puntos</span></div><div id="one6619Map" class="one6619MapCanvas"><div id="one6619MapLoading" class="one6619MapLoading">Cargando mapa…<br><small>Si el mapa base demora, el GPS y el trazo siguen siendo utilizables.</small></div></div><div class="one6619MapActions"><button id="one6619Draw" class="primary">✏️ Dibujar tramo</button><button id="one6619Undo">↶ Deshacer</button><button id="one6619GpsB">📍 B en mi GPS</button><button id="one6619Apply" class="apply">✓ Aplicar trazo y coordenadas</button></div><div id="one6619MapHint" class="one6619MapHint">Toma una foto y toca 🪧 Tramo. Esa evidencia será el punto A.</div>`;
  const active=$('v6413Active');if(active)active.insertAdjacentElement('afterend',card);else base.appendChild(card);
  $('one6619Draw').onclick=toggleDraw;$('one6619Undo').onclick=undo;$('one6619GpsB').onclick=addGpsB;$('one6619Apply').onclick=apply;
  initMap();paint();return true;
}
async function initMap(){
  const el=$('one6619Map');if(!el||map)return;
  try{if(!window.L){if(window.ONEDeps?.leaflet)await ONEDeps.leaflet();else throw new Error('Mapa aún no disponible')}
    map=L.map(el,{zoomControl:true,attributionControl:true});
    tile=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(map);
    tile.on('tileerror',()=>{const h=$('one6619MapHint');if(h){h.className='one6619MapHint warn';h.textContent='El mapa base está lento o sin conexión. Puedes seguir dibujando el tramo; las coordenadas se guardan igual.'}});
    map.on('click',e=>{if(!drawing)return;addPoint({latitude:e.latlng.lat,longitude:e.latlng.lng,accuracy:0,timestamp:Date.now(),source:'MAP_DRAW'})});
    $('one6619MapLoading').hidden=true;setTimeout(()=>{map.invalidateSize();fit()},80);
  }catch(err){const l=$('one6619MapLoading');if(l)l.innerHTML=`Mapa pendiente<br><small>${esc(err.message||err)} · toca Dibujar cuando termine de cargar.</small>`;setTimeout(initMap,1200)}
}
function seedPoint(){const c=current();if(valid(c?.startPoint))return c.startPoint;const s=seed();if(valid(s?.gps))return s.gps;const st=getState();return valid(st?.gps)?st.gps:null}
function resetDraft(){const c=current();const manual=c?.manualGeometry?.points;if(Array.isArray(manual)&&manual.length){draft=manual.map(p=>({...p}));return}const a=seedPoint();draft=a?[{...a,source:a.source||'POINT_A'}]:[]}
function clearLayers(){if(!map)return;for(const l of layers){try{map.removeLayer(l)}catch(_){}}layers=[]}
function render(){
  if(!map)return;clearLayers();const c=current(),pts=draft.length?draft:(Array.isArray(c?.manualGeometry?.points)?c.manualGeometry.points:[]),a=pts[0]||seedPoint(),b=pts.length>1?pts.at(-1):null;
  if(valid(a))layers.push(L.marker([a.latitude,a.longitude],{title:'A · Inicio'}).bindPopup('<b>A · Inicio</b><br>Punto tomado desde la evidencia').addTo(map));
  if(pts.length>1){layers.push(L.polyline(pts.map(p=>[p.latitude,p.longitude]),{color:'#1766e8',weight:6,opacity:.92}).addTo(map));layers.push(L.marker([b.latitude,b.longitude],{title:'B · Fin'}).bindPopup('<b>B · Fin</b>').addTo(map))}
  if(drawing&&pts.length){for(const p of pts.slice(1,-1))layers.push(L.circleMarker([p.latitude,p.longitude],{radius:4,color:'#0b4eae',weight:2,fillOpacity:1}).addTo(map))}
  paint();
}
function fit(){if(!map)return;const pts=draft.length?draft:[seedPoint()].filter(valid);if(pts.length>1)map.fitBounds(L.latLngBounds(pts.map(p=>[p.latitude,p.longitude])),{padding:[28,28],maxZoom:18});else if(pts.length===1)map.setView([pts[0].latitude,pts[0].longitude],17);else {const st=getState();if(valid(st?.gps))map.setView([st.gps.latitude,st.gps.longitude],17);else map.setView([-12.0464,-77.0428],13)}}
function paint(){
  const a=draft[0]||seedPoint(),b=draft.length>1?draft.at(-1):null,d=length(draft);if($('one6619A'))$('one6619A').textContent=a?'A · listo':'A · pendiente';if($('one6619B'))$('one6619B').textContent=b?'B · listo':'B · pendiente';if($('one6619Dist'))$('one6619Dist').textContent=`${Math.round(d)} m`;if($('one6619Pts'))$('one6619Pts').textContent=`${draft.length} puntos`;
  const btn=$('one6619Draw');if(btn)btn.textContent=drawing?'⏸ Pausar dibujo':'✏️ Dibujar tramo';const h=$('one6619MapHint');if(h&&!h.classList.contains('warn')){const s=seed(),c=current();h.textContent=c?drawing?'Toca el mapa siguiendo el recorrido de las pancartas. Puedes poner varios puntos y corregir con Deshacer.':'Activa Dibujar tramo o usa B en mi GPS. Después pulsa Aplicar trazo.':s?.gps?`📍 Punto A listo desde ${s.photoCode||'la evidencia'}. Selecciona organización, inicia el tramo y dibuja.`:'Toma una foto con GPS y toca 🪧 Tramo para fijar el punto A.'}
}
function toggleDraw(){if(!current())return toast('Primero selecciona organización e inicia el tramo.');if(!draft.length)resetDraft();drawing=!drawing;render();if(drawing){map?.invalidateSize();fit();toast('✏️ Toca el mapa para seguir la avenida o pasaje')}}
function addPoint(p){if(!valid(p))return;if(!draft.length){const a=seedPoint();if(a)draft.push({...a,source:'POINT_A'})}const last=draft.at(-1);if(last&&dist(last,p)<2)return;draft.push({...p});render()}
function undo(){if(draft.length<=1)return toast('El punto A no se elimina.');draft.pop();render()}
function addGpsB(){const st=getState();if(!current())return toast('Primero inicia el tramo.');if(!valid(st?.gps))return toast('GPS pendiente. Espera unos segundos o actualiza ubicación.');if(!draft.length)resetDraft();addPoint({latitude:num(st.gps.latitude),longitude:num(st.gps.longitude),accuracy:num(st.gps.accuracy),timestamp:Date.now(),source:'LIVE_GPS_B'});fit()}
function geometry(){const pts=draft.filter(valid);return {source:'MANUAL_MAP',points:pts.map(p=>({latitude:num(p.latitude),longitude:num(p.longitude),accuracy:num(p.accuracy),timestamp:num(p.timestamp)||Date.now(),source:p.source||'MAP_DRAW'})),distanceM:length(pts),geojson:{type:'LineString',coordinates:pts.map(p=>[num(p.longitude),num(p.latitude)])},updatedAt:new Date().toISOString()}}
function apply(){
  const c=current();if(!c)return toast('Primero inicia el tramo.');if(draft.length<2)return toast('Dibuja al menos el punto B del tramo.');const g=geometry();c.manualGeometry=g;c.geometrySource='MANUAL_MAP';c.geometryGeoJSON=g.geojson;c.points=g.points;c.startPoint=g.points[0];c.endPoint=g.points.at(-1);c.distanceM=g.distanceM;c.manualGeometryLocked=true;c.updatedAt=new Date().toISOString();
  const s=seed();if(s){c.seedEvidenceId=s.evidenceId||c.seedEvidenceId;c.seedPhotoCode=s.photoCode||c.seedPhotoCode;c.seedAddress=s.address||c.seedAddress;c.seedUbigeo=s.ubigeo||c.seedUbigeo}
  try{getStore()?.saveLite?.()}catch(_){}try{C()?.paint?.()}catch(_){}drawing=false;render();toast(`✓ Tramo aplicado · ${Math.round(g.distanceM)} m · coordenadas A/B guardadas`,3200)
}
function patchCorridor(){
  const c=C();if(!c||c.__one6619MapPatch)return false;c.__one6619MapPatch=true;
  const oldStart=c.start?.bind(c);if(oldStart)c.start=async(...args)=>{
    const party=String($('v6413Party')?.value||'').trim();if(!party)return toast('Selecciona la organización política antes de iniciar el tramo.');
    const type=$('v6413Type');if(type)type.value='CARTEL_POSTE';const s=seed();const out=await oldStart(...args);const cur=c.current?.();if(cur&&s?.gps){cur.repetitiveSubtype='CARTEL_POSTE';cur.type='CARTEL_POSTE';cur.startPoint={...s.gps,source:'EVIDENCE_A'};cur.points=[{...cur.startPoint}];cur.seedEvidenceId=s.evidenceId||'';cur.seedPhotoCode=s.photoCode||'';cur.seedAddress=s.address||'';cur.seedUbigeo=s.ubigeo||'';cur.geometrySource='EVIDENCE_A';const r=(getState()?.records||[]).find(x=>String(x.id)===String(s.evidenceId));if(r)try{c.addEvidence?.(r,{source:'tramo-point-a'})}catch(_){}try{getStore()?.saveLite?.()}catch(_){} }
    resetDraft();drawing=true;render();fit();return out};
  const oldCapture=c.capturePoint?.bind(c);if(oldCapture)c.capturePoint=(g,...a)=>{if(c.current?.()?.manualGeometryLocked)return;return oldCapture(g,...a)};
  const oldFinish=c.finish?.bind(c);if(oldFinish)c.finish=async(...args)=>{const cur=c.current?.(),manual=cur?.manualGeometry?.points;if(Array.isArray(manual)&&manual.length>1){const st=getState(),saved=st?.gps;try{if(st)st.gps={...manual.at(-1)};return await oldFinish(...args)}finally{if(st)st.gps=saved}}return oldFinish(...args)};
  return true;
}
function prepare(){
  try{C()?.injectV6617?.()}catch(_){}fixType();ensureCard();patchCorridor();
  const s=seed();if(s?.address&&$('v6413Road')&&!$('v6413Road').value.trim())$('v6413Road').value=s.address;
  if(!draft.length)resetDraft();initMap().then(()=>{render();fit()}).catch(()=>{});paint();
}
function watch(){if(observer)return;observer=new MutationObserver(()=>{clearTimeout(paintTimer);paintTimer=setTimeout(prepare,70)});observer.observe(document.body,{childList:true,subtree:true})}
function start(){let ok=false;try{ok=!!C()&&!!getState()}catch(_){}if(!ok){if(tries++<160)return setTimeout(start,60);return}patchCorridor();prepare();watch()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,40),{once:true});else setTimeout(start,40);
window.ONE_V6619_TRAMO_MAP={BUILD,prepare,apply,render,resetDraft,get draft(){return draft.slice()}};
})();
