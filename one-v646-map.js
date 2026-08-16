/* ONE SHOT v6.4.6 · COVERAGE MAP REPAIR */
(()=>{
'use strict';
if(window.ONE_V646_MAP)return;
const BUILD='oneshot-v6.4.6-stability-ux-repair-01';let tries=0;
const valid=p=>Number.isFinite(Number(p?.latitude))&&Number.isFinite(Number(p?.longitude));
const segments=points=>{const out=[],src=(points||[]).filter(valid);let cur=[];for(const p of src){if(p.segmentBreak&&cur.length){out.push(cur);cur=[];}cur.push(p);}if(cur.length)out.push(cur);return out;};

function drawRealMap(){
  const el=document.getElementById('coverageRealMap');if(!el)return;const routes=RouteCoverage.selected(),routePoints=routes.flatMap(r=>r.points||[]).filter(valid),ev=Evidence.visible().filter(r=>valid(r.gps));
  if(!window.L){document.getElementById('coverageMapFallback')?.classList.remove('isHidden');return;}
  if(!RouteCoverage.map){RouteCoverage.map=L.map(el,{zoomControl:true,attributionControl:true}).setView(State.gps?[State.gps.latitude,State.gps.longitude]:[-12.0731,-77.0365],15);RouteCoverage.mapTile=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(RouteCoverage.map);RouteCoverage.mapTile.on('tileerror',()=>document.getElementById('coverageMapFallback')?.classList.remove('isHidden'));}
  (RouteCoverage.mapLayers||[]).forEach(x=>{try{RouteCoverage.map.removeLayer(x);}catch(_){}});RouteCoverage.mapLayers=[];
  for(const route of routes){for(const seg of segments(route.points)){if(seg.length>1)RouteCoverage.mapLayers.push(L.polyline(seg.map(p=>[p.latitude,p.longitude]),{color:'#2979ff',weight:5,opacity:.9}).addTo(RouteCoverage.map));}}
  for(const r of ev){RouteCoverage.mapLayers.push(L.circleMarker([r.gps.latitude,r.gps.longitude],{radius:6,color:'#7a5600',weight:1,fillColor:'#f7c948',fillOpacity:1}).bindPopup(`<b>${String(r.party||'Sin partido').replace(/[<>]/g,'')}</b><br>${String(r.type||'PENDIENTE').replace(/[<>]/g,'')}<br>${String(r.photoCode||'').replace(/[<>]/g,'')}`).addTo(RouteCoverage.map));}
  let ssc=null;try{ssc=SmartSectorCoverage.data?.();}catch(_){}if(ssc?.polygon?.length)RouteCoverage.mapLayers.push(L.polygon(ssc.polygon.map(p=>[p.latitude,p.longitude]),{color:'#ef4444',weight:3,fillColor:'#ef4444',fillOpacity:.035,dashArray:'8 6'}).addTo(RouteCoverage.map));
  let smart=null;try{smart=SmartRoute.route?.();}catch(_){}if(smart){const cells=(smart.cellIds||[]).slice(Number(smart.index||0)).map(id=>SmartRoute.cellById(id)).filter(Boolean);if(cells.length){const start=valid(State.gps)?[State.gps.latitude,State.gps.longitude]:[cells[0].latitude,cells[0].longitude];RouteCoverage.mapLayers.push(L.polyline([start,...cells.map(c=>[c.latitude,c.longitude])],{color:'#7c3aed',weight:4,opacity:.8,dashArray:'8 7'}).addTo(RouteCoverage.map));}}
  if(valid(State.gps))RouteCoverage.mapLayers.push(L.circleMarker([State.gps.latitude,State.gps.longitude],{radius:8,color:'#2979ff',weight:4,fillColor:'#fff',fillOpacity:1}).addTo(RouteCoverage.map));
  const all=[...routePoints,...ev.map(x=>x.gps),...(ssc?.polygon||[])].filter(valid);if(all.length){RouteCoverage.map.fitBounds(L.latLngBounds(all.map(p=>[Number(p.latitude),Number(p.longitude)])),{padding:[25,25],maxZoom:18});}else if(valid(State.gps))RouteCoverage.map.setView([State.gps.latitude,State.gps.longitude],16);
  setTimeout(()=>RouteCoverage.map.invalidateSize(),80);
  const total=routes.reduce((a,r)=>a+Number(r.distanceM||0),0),gaps=routes.reduce((a,r)=>a+(r.coverageGaps?.length||0),0);const extra=[ssc?.polygon?.length?'rojo Smart Sector':'',smart?'violeta Smart Route':''].filter(Boolean).join(' · ');
  const legend=document.getElementById('coverageLegend');if(legend)legend.textContent=`${(total/1000).toFixed(2)} km recorridos · ${routePoints.length} puntos de ruta · ${ev.length} hallazgos · azul recorrido · amarillo evidencia · azul/blanco tú${extra?' · '+extra:''}${gaps?` · ${gaps} tramo${gaps===1?'':'s'} sin GPS unido`:''}`;
}

function patchPaint(){const old=RouteCoverage.paint?.bind(RouteCoverage);if(!old||RouteCoverage.__v646Paint)return;RouteCoverage.__v646Paint=true;RouteCoverage.paint=()=>{const out=old();const r=RouteCoverage.active(),status=document.getElementById('routeStatus');if(r&&status){const rejected=Number(r.gpsRejected||0),gaps=Number(r.coverageGaps?.length||0);if(rejected||gaps){let note=status.querySelector('.v646RouteQuality');if(!note){note=document.createElement('small');note.className='v646RouteQuality';note.style.cssText='display:block;margin-top:6px;color:#7a5a00;font-weight:700';status.appendChild(note);}note.textContent=`Calidad GPS: ${rejected?rejected+' punto'+(rejected===1?'':'s')+' descartado'+(rejected===1?'':'s'):''}${rejected&&gaps?' · ':''}${gaps?gaps+' interrupción'+(gaps===1?'':'es')+' sin unir':''}`;}}return out;};}
function start(){if(window.__ONE_V646_MAP_STARTED)return;if(typeof RouteCoverage==='undefined'||typeof Evidence==='undefined'||typeof State==='undefined'){if(tries++<90)setTimeout(start,120);return;}window.__ONE_V646_MAP_STARTED=true;RouteCoverage.drawRealMap=drawRealMap;patchPaint();}
window.ONE_V646_MAP={BUILD,start,drawRealMap,segments};window.addEventListener('load',()=>setTimeout(start,780),{once:true});if(document.readyState==='complete')setTimeout(start,780);
})();