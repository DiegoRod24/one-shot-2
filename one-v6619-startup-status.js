/* ONE SHOT v6.6.19 · STARTUP STATUS + FAST TRAMO INTENT */
(()=>{
'use strict';
if(window.ONE_V6619_STARTUP_STATUS)return;
const BUILD='oneshot-v6.6.19-tramo-map-startup-01';
const $=id=>document.getElementById(id);
const getState=()=>{try{return typeof State!=='undefined'?State:window.State}catch(_){return window.State}};
const getUI=()=>{try{return typeof UI!=='undefined'?UI:window.UI}catch(_){return window.UI}};
const started=performance.now();
let lastText='',readySince=0,busyDepth=0;

function css(){
  if($('one6619StartupCss'))return;
  const s=document.createElement('style');s.id='one6619StartupCss';s.textContent=`
#one6619Startup{position:absolute;left:50%;top:max(112px,calc(env(safe-area-inset-top) + 92px));transform:translateX(-50%);z-index:920;width:min(92%,430px);pointer-events:none;transition:opacity .25s,transform .25s;display:none}
#one6619Startup.show{display:block}#one6619Startup.done{opacity:0;transform:translate(-50%,-8px)}
.one6619StartupCard{display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid rgba(255,255,255,.25);border-radius:16px;background:rgba(4,14,34,.84);backdrop-filter:blur(12px);color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.2)}
.one6619Spin{width:20px;height:20px;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:one6619spin .8s linear infinite;flex:0 0 auto}.one6619Spin.ok{animation:none;border:0;width:22px;height:22px;display:grid;place-items:center;background:#17865f}.one6619Spin.ok:after{content:'✓';font-weight:950}.one6619StartupText{min-width:0;display:grid;gap:1px}.one6619StartupText b{font-size:12px;line-height:1.2}.one6619StartupText small{font-size:10px;color:#c7d4e7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.one6619Progress{height:3px;background:rgba(255,255,255,.18);border-radius:99px;overflow:hidden;margin-top:4px}.one6619Progress i{display:block;height:100%;background:#55a0ff;width:14%;transition:width .35s}
#one6619Busy{position:fixed;inset:0;z-index:2147482500;background:rgba(2,8,23,.55);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:20px}#one6619Busy.open{display:flex}.one6619BusyCard{width:min(92vw,390px);background:#071b37;color:#fff;border:1px solid #315781;border-radius:20px;padding:18px;display:grid;gap:10px;text-align:center;box-shadow:0 22px 60px rgba(0,0,0,.4)}.one6619BusyCard .one6619Spin{margin:auto;width:32px;height:32px}.one6619BusyCard b{font-size:17px}.one6619BusyCard small{color:#b9c9df;line-height:1.4}
@keyframes one6619spin{to{transform:rotate(360deg)}}
@media(max-width:520px){#one6619Startup{top:max(100px,calc(env(safe-area-inset-top) + 82px));width:88%}.one6619StartupCard{padding:8px 10px}.one6619StartupText b{font-size:11px}}
`;
  document.head.appendChild(s);
}
function ensure(){
  css();
  if(!$('one6619Startup')){const d=document.createElement('div');d.id='one6619Startup';d.innerHTML='<div class="one6619StartupCard"><span id="one6619StartupSpin" class="one6619Spin"></span><div class="one6619StartupText"><b id="one6619StartupTitle">Preparando ONE SHOT…</b><small id="one6619StartupSub">Cámara primero · GPS y ubicación en paralelo</small><div class="one6619Progress"><i id="one6619StartupBar"></i></div></div></div>';($('cameraStage')||document.body).appendChild(d)}
  if(!$('one6619Busy')){const b=document.createElement('div');b.id='one6619Busy';b.innerHTML='<div class="one6619BusyCard"><span class="one6619Spin"></span><b id="one6619BusyTitle">Preparando…</b><small id="one6619BusySub">Un momento, ONE SHOT está cargando solo lo necesario.</small></div>';document.body.appendChild(b)}
}
function validGps(g){return !!g&&Number.isFinite(Number(g.latitude))&&Number.isFinite(Number(g.longitude))}
function addressReady(){const t=String($('wmAddr')?.textContent||'').trim();return !!t&&!/pendiente|buscando|detectad|resolviendo|afinando|gps/i.test(t)}
function cameraReady(){const st=getState();return !!(st?.cameraStatus==='active'&&st.currentTrack?.readyState==='live')}
function paint(){
  ensure();const host=$('one6619Startup'),st=getState();if(!host)return;
  const camera=cameraReady(),gps=validGps(st?.gps),addr=addressReady(),elapsed=Math.max(0,Math.floor((performance.now()-started)/1000));
  let title,sub,pct=12,done=false;
  if(!camera){title=`Preparando cámara… ${elapsed}s`;sub=elapsed>=6?'Está tardando un poco; seguimos intentando sin bloquear la app.':'Cámara trasera primero · GPS se prepara en paralelo';pct=Math.min(38,12+elapsed*4)}
  else if(!gps){title=`Cámara lista · buscando GPS… ${elapsed}s`;sub='Ya puedes encuadrar. Esperando coordenadas para georreferenciar.';pct=52}
  else if(!addr){title=`GPS ±${Math.round(Number(st.gps.accuracy||0))} m · resolviendo ubicación…`;sub=elapsed>=8?'Puedes capturar; dirección/ubigeo seguirá completándose sobre esas coordenadas.':'Calculando dirección y ubigeo sin detener la cámara.';pct=78}
  else{title='✓ ONE SHOT listo para evidencia';sub=`GPS ±${Math.round(Number(st.gps.accuracy||0))} m · ubicación preparada`;pct=100;done=true}
  const sig=`${title}|${sub}`;if(sig!==lastText){lastText=sig;$('one6619StartupTitle').textContent=title;$('one6619StartupSub').textContent=sub;$('one6619StartupBar').style.width=`${pct}%`}
  host.classList.toggle('show',!done||!readySince);$('one6619StartupSpin').classList.toggle('ok',done);
  if(done){if(!readySince)readySince=Date.now();if(Date.now()-readySince>1800){host.classList.add('done');setTimeout(()=>host.classList.remove('show'),260)}}else{readySince=0;host.classList.remove('done')}
}
function busy(title,sub=''){ensure();busyDepth++;$('one6619BusyTitle').textContent=title||'Preparando…';$('one6619BusySub').textContent=sub||'Un momento, ONE SHOT está cargando solo lo necesario.';$('one6619Busy').classList.add('open')}
function unbusy(){busyDepth=Math.max(0,busyDepth-1);if(!busyDepth)$('one6619Busy')?.classList.remove('open')}
function seedFromLast(){const st=getState(),id=st?.lastShotId||'',r=(st?.records||[]).find(x=>String(x.id)===String(id));if(!r)return null;const g=r.gps;return {evidenceId:r.id,photoCode:r.photoCode||r.id,gps:validGps(g)?{latitude:Number(g.latitude),longitude:Number(g.longitude),accuracy:Number(g.accuracy||0),timestamp:Number(g.timestamp||Date.parse(r.createdAt)||Date.now())}:null,address:r.captureAddress||r.address||'',department:r.department||r.region||'',province:r.province||'',district:r.district||'',ubigeo:r.ubigeo||''}}
async function fastTramo(){
  const seed=seedFromLast(),ui=getUI();if(!seed?.gps){ui?.toast?.('La foto necesita GPS para usarla como punto A del tramo',3000);return}
  window.ONE_V6619_TRAMO_SEED=seed;busy('Preparando mapa del tramo…','Usaré la foto recién tomada como punto A. Cargando solo Tramo + mapa.');
  try{
    const loader=window.ONE_V661_IDLE_LOADER;if(!loader?.ensure)throw new Error('El cargador de campo aún no está listo');
    await Promise.all([loader.ensure('tramo'),window.ONEDeps?.leaflet?.()||Promise.resolve()]);
    try{ui?.setView?.('Places')}catch(_){}
    await new Promise(r=>setTimeout(r,80));
    try{const c=typeof PropagandaCorridor!=='undefined'?PropagandaCorridor:window.PropagandaCorridor;c?.injectV6617?.();c?.paint?.();window.ONE_V6619_TRAMO_MAP?.prepare?.()}catch(_){}
    const card=$('v6413CorridorCard');card?.scrollIntoView?.({behavior:'smooth',block:'start'});
    ui?.toast?.('📍 Punto A cargado desde tu evidencia. Elige partido e inicia para dibujar el tramo.',3600)
  }catch(err){console.error('[ONE SHOT v6.6.19 tramo]',err);ui?.toast?.(`No pude abrir Tramo · ${err.message||err}`,3800)}
  finally{unbusy()}
}
function interceptTramo(){document.addEventListener('click',e=>{const b=e.target?.closest?.('#one6618QuickTramo');if(!b)return;e.preventDefault();e.stopImmediatePropagation();fastTramo()},true)}
function boot(){ensure();interceptTramo();paint();setInterval(paint,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.ONE_V6619_STARTUP_STATUS={BUILD,busy,unbusy,fastTramo,paint};
})();
