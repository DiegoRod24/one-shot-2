/* ONE SHOT v6.6.26 · FAST FIELD START · SIN PRECARGAS PESADAS */
(()=>{
'use strict';
if(window.ONE_V6614_FAST_FIELD_START)return;
const BUILD='oneshot-v6.6.26-fast-field-start-slim-01';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const idle=cb=>('requestIdleCallback'in window?requestIdleCallback(cb,{timeout:4000}):setTimeout(cb,1200));

const Deps={
  promises:{},
  script(key,src){if(window[key])return Promise.resolve(window[key]);if(this.promises[src])return this.promises[src];this.promises[src]=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>resolve(window[key]||true);s.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));document.head.appendChild(s)});return this.promises[src]},
  css(href){if(document.querySelector(`link[data-one-dep="${href}"]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.oneDep=href;document.head.appendChild(l)},
  leaflet(){this.css('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');return this.script('L','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')},
  excel(){return this.script('ExcelJS','https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js')}
};
window.ONEDeps=Deps;

function paintClockNow(){
  try{
    if(typeof UI==='undefined'||typeof TimeTrust==='undefined')return;
    if(State?.time?.source!=='SERVIDOR')TimeTrust.local('');
    UI.updateClock?.();
    if(!window.__oneFastClockTimer)window.__oneFastClockTimer=setInterval(()=>UI.updateClock?.(),1000);
  }catch(_){}
}
function patchTime(){
  if(typeof TimeTrust==='undefined'||TimeTrust.__fastStart)return;
  TimeTrust.__fastStart=true;
  const baseSync=TimeTrust.sync.bind(TimeTrust);let scheduled=false;
  TimeTrust.sync=async()=>{
    paintClockNow();if(scheduled)return true;scheduled=true;
    idle(async()=>{for(let i=0;i<24;i++){if(State?.cameraStatus==='active')break;await wait(180)}await wait(900);try{await baseSync()}catch(_){} });
    return true;
  };
  paintClockNow();
}

function patchGps(){
  if(typeof GPS==='undefined'||GPS.__fastStart)return;
  GPS.__fastStart=true;
  const baseStart=GPS.start.bind(GPS),baseResolve=GPS.resolveLive.bind(GPS);
  let reverseTimer=null,reverseBusy=false;
  GPS.start=function(){if(State.gpsWatchId!=null)return;return baseStart()};
  const scheduleReverse=(delay=700)=>{
    clearTimeout(reverseTimer);
    reverseTimer=setTimeout(async()=>{
      if(reverseBusy||!State.__onePendingReverseGps)return;
      if(State.cameraStatus!=='active'){scheduleReverse(450);return}
      reverseBusy=true;const g=State.__onePendingReverseGps;State.__onePendingReverseGps=null;
      try{await baseResolve(g,false)}catch(_){}finally{reverseBusy=false;if(State.__onePendingReverseGps)scheduleReverse(500)}
    },delay);
  };
  GPS.resolveLive=async function(g,force=false){
    if(force)return baseResolve(g,true);if(!g)return;
    State.__onePendingReverseGps=g;
    const a=document.getElementById('wmAddr');if(a)a.textContent=State.cameraStatus==='active'?'Ubicación detectada · obteniendo dirección…':'GPS detectado · cámara primero…';
    scheduleReverse(State.cameraStatus==='active'?650:350);
  };
  try{
    navigator.permissions?.query?.({name:'geolocation'}).then(p=>{
      if(p?.state!=='granted')return;
      const a=document.getElementById('wmAddr');if(a)a.textContent='Buscando ubicación…';
      navigator.geolocation?.getCurrentPosition?.(pos=>{
        try{State.gps=GPS.norm(pos);GPS.setChip(`GPS ±${Math.round(State.gps.accuracy||0)}m`);GPS.water();GPS.paintHealth();if(a)a.textContent='Ubicación detectada · afinando dirección…';State.__onePendingReverseGps=State.gps;scheduleReverse(500)}catch(_){}
      },()=>{}, {enableHighAccuracy:false,maximumAge:120000,timeout:900});
      GPS.start();
    }).catch(()=>{});
  }catch(_){}
}

function patchDependencies(){
  if(typeof UI!=='undefined'&&!UI.__oneDepsPatched){
    UI.__oneDepsPatched=true;const baseSetView=UI.setView.bind(UI);
    UI.setView=function(name){if(name==='Places')Deps.leaflet().catch(()=>{});if(name==='Reports')Deps.excel().catch(()=>{});return baseSetView(name)};
  }
  if(typeof Reports!=='undefined'&&!Reports.__oneDepsPatched){
    Reports.__oneDepsPatched=true;
    for(const k of ['prepare','download','share','preview'])if(typeof Reports[k]==='function'){const base=Reports[k].bind(Reports);Reports[k]=async(...args)=>{await Deps.excel();return base(...args)}}
  }
  if(typeof FieldBases!=='undefined'&&typeof FieldBases.importExcel==='function'&&!FieldBases.__oneDepsPatched){const base=FieldBases.importExcel.bind(FieldBases);FieldBases.importExcel=async(...args)=>{await Deps.excel();return base(...args)};FieldBases.__oneDepsPatched=true}
  if(typeof SmartSectorCoverage!=='undefined'&&typeof SmartSectorCoverage.render==='function'&&!SmartSectorCoverage.__oneDepsPatched){const base=SmartSectorCoverage.render.bind(SmartSectorCoverage);SmartSectorCoverage.render=function(...args){if(!window.L){Deps.leaflet().then(()=>base(...args)).catch(()=>{});return;}return base(...args)};SmartSectorCoverage.__oneDepsPatched=true}
}

let tries=0;const boot=setInterval(()=>{
  tries++;
  try{
    if(typeof State==='undefined'||typeof UI==='undefined'||typeof TimeTrust==='undefined'||typeof GPS==='undefined'){if(tries<220)return;clearInterval(boot);return}
    clearInterval(boot);patchTime();patchGps();patchDependencies();setTimeout(patchDependencies,1400);
  }catch(_){if(tries>=220)clearInterval(boot)}
},15);
window.ONE_V6614_FAST_FIELD_START={BUILD,Deps,paintClockNow};
})();
