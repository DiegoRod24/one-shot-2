/* ONE SHOT v6.6.17 · TRAMOS DE CARTELES / POSTES */
(()=>{
'use strict';
if(window.ONE_V6617_TRAMO_POSTES)return;
const BUILD='oneshot-v6.6.17-tramo-postes-01';
const now=()=>new Date().toISOString();
const num=v=>Math.max(0,Number(v||0));
const text=v=>String(v??'').trim();
const validPoint=p=>!!p&&Number.isFinite(Number(p.latitude))&&Number.isFinite(Number(p.longitude));
const TYPES={
  CARTEL_POSTE:'Cartel en poste',
  BANDEROLA_POSTE:'Banderola en poste',
  BANNER_REPETITIVO:'Banner repetitivo',
  OTRO_REPETITIVO:'Otro repetitivo'
};
const QUALITY={EXACTO:'Exacto',APROXIMADO:'Aproximado',NO_CONTADO:'No contabilizado'};
let tries=0;
function distanceBetween(a,b){try{return validPoint(a)&&validPoint(b)&&window.RouteCoverage?.distance?Number(RouteCoverage.distance(a,b)||0):0}catch(_){return 0}}
function routeDistance(c){const pts=(c?.points||[]).filter(validPoint);let d=0;for(let i=1;i<pts.length;i++){const x=distanceBetween(pts[i-1],pts[i]);if(x>0&&x<300)d+=x;}if(d<=0&&validPoint(c?.startPoint)&&validPoint(c?.endPoint))d=distanceBetween(c.startPoint,c.endPoint);return d}
function point(){const g=window.State?.gps;return validPoint(g)?{latitude:Number(g.latitude),longitude:Number(g.longitude),accuracy:Number(g.accuracy||0),timestamp:Number(g.timestamp||Date.now())}:null}
function toast(msg,ms=2300){try{UI.toast?.(msg,ms,{placement:'top',tone:'soft'})}catch(_){}}
function saveLite(){try{Store.saveLite?.()}catch(_){}}
function catalog(){return Array.isArray(window.ONE_PARTY_CATALOG_V6410)?window.ONE_PARTY_CATALOG_V6410:[]}
function normalizeLegacy(c){if(!c)return c;if(!Number.isFinite(Number(c.posterCount)))c.posterCount=Number(c.countMode==='ESTIMADO'?c.estimatedCount:c.observedCount)||0;if(!Number.isFinite(Number(c.poleCount)))c.poleCount=0;if(!c.countQuality)c.countQuality=c.countMode==='ESTIMADO'?'APROXIMADO':c.countMode==='NO_CONTADO'?'NO_CONTADO':'EXACTO';if(!c.repetitiveSubtype)c.repetitiveSubtype=c.type||'CARTEL_POSTE';return c}
function enhance(C){
  if(C.__v6617TramoPostes)return;
  C.__v6617TramoPostes=true;
  const baseAddEvidence=C.addEvidence?.bind(C);
  C.posterCount=c=>num(normalizeLegacy(c||C.current())?.posterCount);
  C.poleCount=c=>num(normalizeLegacy(c||C.current())?.poleCount);
  C.count=c=>C.posterCount(c);
  C.addEvidence=(r,opts)=>{const out=baseAddEvidence?baseAddEvidence(r,opts):false;const c=C.current();if(c&&r){r.entityType='PROPAGANDA_CORRIDOR_SAMPLE';r.repetitiveSubtype=c.repetitiveSubtype||c.type;r.corridorParty=c.party||'PENDIENTE';try{Store.save?.(r)}catch(_){}}return out};
  C.start=async()=>{
    if(C.current())return toast('Ya existe un tramo activo');
    let p=point();
    if(!p){try{await GPS.refresh?.()}catch(_){}p=point();}
    if(!p)return toast('📍 Necesito GPS para marcar el inicio del tramo. Actualiza ubicación y vuelve a intentar.',3200);
    const party=text(document.getElementById('v6413Party')?.value)||'PENDIENTE';
    const type=text(document.getElementById('v6413Type')?.value)||'CARTEL_POSTE';
    const road=text(document.getElementById('v6413Road')?.value)||text(State.captureAddress||State.address)||`Tramo ${new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}`;
    const pattern=text(document.getElementById('v6413Pattern')?.value)||'CADA_POSTE';
    const quality=text(document.getElementById('v6413CountMode')?.value)||'EXACTO';
    const hadRoute=!!RouteCoverage.active?.();
    if(!hadRoute){const input=document.getElementById('routeNameInput'),old=input?.value||'';if(input)input.value=`Tramo · ${road}`;try{RouteCoverage.start?.()}catch(_){}if(input)input.value=old;}
    const route=RouteCoverage.active?.();
    const c={id:`TRM-${Date.now()}`,entityType:'PROPAGANDA_CORRIDOR',repetitiveSubtype:type,status:'ACTIVE',party,type,road,pattern,countMode:quality,countQuality:quality,poleCount:0,posterCount:0,observedCount:0,estimatedCount:0,countHistory:[],startedAt:now(),endedAt:'',startPoint:p,endPoint:null,points:[p],routeId:route?.id||'',ownsRoute:!hadRoute&&!!route,evidenceIds:[],segments:[],notes:'',normativeReference:'',createdAt:now(),updatedAt:now()};
    State.settings.currentPropagandaCorridor=c;saveLite();C.paint();toast(`🛣️ Tramo iniciado · ${road}`);
  };
  C.addMetric=(target,delta)=>{const c=normalizeLegacy(C.current());if(!c)return;const key=target==='pole'?'poleCount':'posterCount';c[key]=Math.max(0,num(c[key])+Number(delta||0));c.observedCount=C.posterCount(c);c.estimatedCount=C.posterCount(c);c.countHistory=Array.isArray(c.countHistory)?c.countHistory:[];c.countHistory.push({at:now(),target:key,delta:Number(delta||0)});c.updatedAt=now();saveLite();C.paint()};
  C.setMetric=(target,value)=>{const c=normalizeLegacy(C.current());if(!c)return;const key=target==='pole'?'poleCount':'posterCount';c[key]=num(value);c.observedCount=C.posterCount(c);c.estimatedCount=C.posterCount(c);c.updatedAt=now();saveLite();C.paint()};
  C.undoCount=()=>{const c=normalizeLegacy(C.current());if(!c)return;const h=Array.isArray(c.countHistory)?c.countHistory:[],last=h.pop();if(last){const key=last.target||'posterCount';c[key]=Math.max(0,num(c[key])-Number(last.delta||0));c.observedCount=C.posterCount(c);c.estimatedCount=C.posterCount(c);saveLite();C.paint()}};
  C.finish=async({continueNew=false}={})=>{
    const c=normalizeLegacy(C.current());if(!c){toast('No hay tramo activo');return false;}
    if(!(c.evidenceIds||[]).length){toast('📸 Registra al menos una foto muestra antes de finalizar',3000);return false;}
    if(c.countQuality!=='NO_CONTADO'&&C.posterCount(c)<=0){toast('Indica cuántos carteles observaste o cambia el conteo a “No contabilizado”',3200);return false;}
    let end=point();if(!end){try{await GPS.refresh?.()}catch(_){}end=point();}end=end||(c.points||[]).filter(validPoint).at(-1)||c.startPoint;
    c.status='FINISHED';c.endedAt=now();c.endPoint=end;c.distanceM=routeDistance(c);c.updatedAt=now();c.sampleCount=(c.evidenceIds||[]).length;c.observedCount=C.posterCount(c);c.estimatedCount=C.posterCount(c);
    const keep={road:c.road,pattern:c.pattern,type:c.repetitiveSubtype||c.type,countQuality:c.countQuality};
    State.settings.propagandaCorridors=[c,...(Array.isArray(State.settings.propagandaCorridors)?State.settings.propagandaCorridors:[])].slice(0,250);State.settings.lastPropagandaCorridor=c;State.settings.currentPropagandaCorridor=null;saveLite();
    if(c.ownsRoute&&RouteCoverage.active?.()?.id===c.routeId){try{RouteCoverage.stop?.()}catch(_){}}
    C.paint();C.renderHistory();try{Reports.invalidate?.()}catch(_){}
    toast(`✓ Tramo cerrado · ${Math.round(c.distanceM||0)} m · ${C.poleCount(c)} postes · ${C.posterCount(c)} carteles`,3200);
    if(continueNew){setTimeout(()=>{const road=document.getElementById('v6413Road'),type=document.getElementById('v6413Type'),pattern=document.getElementById('v6413Pattern'),quality=document.getElementById('v6413CountMode'),party=document.getElementById('v6413Party');if(road)road.value=keep.road;if(type)type.value=keep.type;if(pattern)pattern.value=keep.pattern;if(quality)quality.value=keep.countQuality;if(party){party.value='';party.focus()}toast('↔ Cambió la propaganda: selecciona el nuevo partido y comienza otro tramo',3200)},80)}
    return true;
  };
  C.renderHistory=()=>{const box=document.getElementById('v6413History');if(!box)return;const h=(Array.isArray(State.settings.propagandaCorridors)?State.settings.propagandaCorridors:[]).slice(0,10);box.innerHTML=h.map(raw=>{const c=normalizeLegacy(raw);return `<div class="v6413HistoryItem"><div><b>${escapeHtml(c.road||'Tramo')} · ${escapeHtml(c.party||'PENDIENTE')}</b><small>${escapeHtml(TYPES[c.repetitiveSubtype]||c.type||'Repetitivo')} · ${Math.round(Number(c.distanceM||0))} m · ${C.poleCount(c)} postes · ${C.posterCount(c)} carteles · ${(c.evidenceIds||[]).length} fotos</small></div><span>${escapeHtml(String(c.startedAt||'').slice(0,10))}</span></div>`}).join('')||'<div class="hint">Aún no hay tramos finalizados.</div>'};
  C.paint=()=>{
    const c=normalizeLegacy(C.current()),idle=document.getElementById('v6413Idle'),active=document.getElementById('v6413Active');if(idle)idle.hidden=!!c;if(active)active.hidden=!c;
    if(!c){C.renderHistory();return;}
    const set=(id,v)=>{const x=document.getElementById(id);if(x)x.textContent=String(v)};
    set('v6413ActiveTitle',`${c.road} · ${c.party||'PENDIENTE'}`);set('v6413ActiveMeta',`${TYPES[c.repetitiveSubtype]||c.type} · A → B · GPS activo`);set('v6617Distance',`${Math.round(routeDistance(c))} m`);set('v6617Poles',C.poleCount(c));set('v6413Count',C.posterCount(c));set('v6413Samples',(c.evidenceIds||[]).length);
    const pi=document.getElementById('v6617PoleInput'),ci=document.getElementById('v6617PosterInput');if(pi&&document.activeElement!==pi)pi.value=String(C.poleCount(c));if(ci&&document.activeElement!==ci)ci.value=String(C.posterCount(c));
    const controls=document.getElementById('v6617CountControls');if(controls)controls.hidden=c.countQuality==='NO_CONTADO';
    const q=document.getElementById('v6617QualityLabel');if(q)q.textContent=QUALITY[c.countQuality]||c.countQuality;
  };
  C.injectV6617=()=>{
    const card=document.getElementById('v6413CorridorCard');if(!card)return false;if(card.dataset.v6617==='1')return true;card.dataset.v6617='1';
    const title=card.querySelector('.sectionTitle');if(title)title.innerHTML='<div><b>🪧 Tramo de carteles / postes</b><small>Un solo hallazgo lineal: marca inicio A, toma fotos muestra y finaliza en B. No necesitas fotografiar cada poste.</small></div><span class="v6413Badge">CAMPO</span>';
    const idle=document.getElementById('v6413Idle');if(idle)idle.innerHTML=`<div class="v6413Grid"><label>Organización<input id="v6413Party" list="v6413PartyList" placeholder="Partido / movimiento · puede quedar pendiente"><datalist id="v6413PartyList"></datalist></label><label>Elemento repetitivo<select id="v6413Type"><option value="CARTEL_POSTE">Cartel en poste</option><option value="BANDEROLA_POSTE">Banderola en poste</option><option value="BANNER_REPETITIVO">Banner repetitivo</option><option value="OTRO_REPETITIVO">Otro repetitivo</option></select></label><label class="wide">Vía / tramo<input id="v6413Road" placeholder="Ej. Av. Brasil · cuadra 1 a 12"></label><label>Patrón<select id="v6413Pattern"><option value="CADA_POSTE">Cada poste</option><option value="POSTES_ALTERNOS">Postes alternos</option><option value="AMBOS_LADOS">Ambos lados</option><option value="UN_LADO">Un lado de la vía</option><option value="IRREGULAR">Irregular</option></select></label><label>Conteo<select id="v6413CountMode"><option value="EXACTO">Exacto</option><option value="APROXIMADO">Aproximado</option><option value="NO_CONTADO">No contabilizado</option></select></label></div><div class="v6617StartHint">📍 El GPS actual será el punto <b>A · Inicio</b>.</div><button id="v6413Start" class="primary v6413Big">📍 Iniciar tramo aquí</button>`;
    const active=document.getElementById('v6413Active');if(active)active.innerHTML=`<div class="v6413ActiveHead"><div><b id="v6413ActiveTitle"></b><small id="v6413ActiveMeta"></small></div><span class="v6413Live">● ACTIVO</span></div><div class="v6617AB"><span>📍 A · Inicio guardado</span><b id="v6617QualityLabel">Exacto</b><span>🏁 B · al finalizar</span></div><div class="v6413Metrics v6617Metrics"><div><b id="v6617Distance">0 m</b><span>recorrido</span></div><div><b id="v6617Poles">0</b><span>postes</span></div><div><b id="v6413Count">0</b><span>carteles</span></div><div><b id="v6413Samples">0</b><span>fotos muestra</span></div></div><div id="v6617CountControls"><div class="v6617CountInputs"><label>Postes<input id="v6617PoleInput" type="number" min="0" inputmode="numeric" value="0"></label><label>Carteles<input id="v6617PosterInput" type="number" min="0" inputmode="numeric" value="0"></label></div><div class="v6413Counter"><button id="v6617Pole1">+1 poste</button><button id="v6617Poster1">+1 cartel</button><button id="v6617Poster5">+5 carteles</button><button id="v6413Undo">↶ Deshacer</button></div></div><div class="v6413Actions"><button id="v6413Camera" class="primary">📸 Foto muestra</button><button id="v6413UseLast">Usar última foto</button><button id="v6617Change">↔ Cambió propaganda</button><button id="v6413Finish" class="v6617Finish">🏁 Finalizar tramo aquí</button></div>`;
    const dl=document.getElementById('v6413PartyList');if(dl)dl.innerHTML=catalog().map(x=>`<option value="${escapeAttr(x.name)}"></option>`).join('');
    document.getElementById('v6413Start')?.addEventListener('click',()=>C.start());document.getElementById('v6617Pole1')?.addEventListener('click',()=>C.addMetric('pole',1));document.getElementById('v6617Poster1')?.addEventListener('click',()=>C.addMetric('poster',1));document.getElementById('v6617Poster5')?.addEventListener('click',()=>C.addMetric('poster',5));document.getElementById('v6413Undo')?.addEventListener('click',()=>C.undoCount());document.getElementById('v6617PoleInput')?.addEventListener('change',e=>C.setMetric('pole',e.target.value));document.getElementById('v6617PosterInput')?.addEventListener('change',e=>C.setMetric('poster',e.target.value));document.getElementById('v6413Camera')?.addEventListener('click',()=>C.goCamera?.());document.getElementById('v6413UseLast')?.addEventListener('click',()=>C.useLastEvidence?.());document.getElementById('v6617Change')?.addEventListener('click',()=>C.finish({continueNew:true}));document.getElementById('v6413Finish')?.addEventListener('click',()=>C.finish());
    C.paint();return true;
  };
  C.cssV6617=()=>{if(document.getElementById('v6617TramoCss'))return;const s=document.createElement('style');s.id='v6617TramoCss';s.textContent=`.v6617StartHint{margin-top:10px;padding:10px 12px;border-radius:12px;background:#eef6ff;color:#174a86;font-size:12px}.v6617AB{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:10px 0;font-size:11px;color:#55708f}.v6617AB b{color:#0c5db5}.v6617Metrics{grid-template-columns:repeat(4,1fr)!important}.v6617CountInputs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.v6617CountInputs label{display:grid;gap:4px;font-size:11px;font-weight:900;color:#526984}.v6617CountInputs input{width:100%;padding:11px;border:1px solid #cbd9e8;border-radius:11px;background:#fff;font-size:16px}.v6617Finish{background:#0c2b55!important;color:#fff!important}.v6413Actions #v6617Change{background:#fff7ed;color:#9a4b00}@media(max-width:650px){.v6617Metrics{grid-template-columns:repeat(2,1fr)!important}.v6617CountInputs{grid-template-columns:1fr 1fr}.v6413CorridorCard{scroll-margin-top:92px}}`;document.head.appendChild(s)};
  C.cssV6617();C.injectV6617();
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(v){return escapeHtml(v).replace(/`/g,'&#96;')}
function start(){if(window.ONE_V6617_TRAMO_POSTES?.started)return;const C=window.PropagandaCorridor;if(!C||!window.State||!window.RouteCoverage){if(tries++<220)return void setTimeout(start,100);return;}window.ONE_V6617_TRAMO_POSTES.started=true;enhance(C);setTimeout(()=>{C.injectV6617?.();C.paint?.()},80)}
window.ONE_V6617_TRAMO_POSTES={BUILD,start,started:false,TYPES,QUALITY};window.addEventListener('load',()=>setTimeout(start,3400),{once:true});if(document.readyState==='complete')setTimeout(start,120);
})();
