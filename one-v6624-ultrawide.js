/* ONE SHOT v6.6.25 · 0.5x ULTRA WIDE · iPhone + Android */
(()=>{
'use strict';
if(window.ONE_V6625_ULTRAWIDE)return;

const BUILD='oneshot-v6.6.25-ultrawide-ios-android-01';
const WIDE_KEY='oneshotUltraWideDeviceId';
const WIDE_LABEL_KEY='oneshotUltraWideLabel';
const WIDE_GROUP_KEY='oneshotUltraWideGroupId';
const MAIN_KEY='oneshotMainCameraDeviceId';
const COMPOSITE_KEY='oneshotCompositeCameraDeviceId';

const ua=navigator.userAgent||'';
const PLATFORM={
  ios:/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
  android:/Android/i.test(ua)
};
PLATFORM.name=PLATFORM.ios?'iOS':PLATFORM.android?'Android':'Web';

const ultraRx=/(ultra[\s-]?wide|ultrawide|ultra[\s-]?gran angular|0[.,]5|super wide|superwide|gran angular)/i;
const compositeRx=/(triple camera|dual wide|dual camera|back dual|back triple|c[aá]mara doble|c[aá]mara triple)/i;
const rearRx=/(back|rear|environment|trasera|posterior|world|facing back|c[aá]mara trasera)/i;
const frontRx=/(front|frontal|selfie|user facing|facing front|c[aá]mara frontal)/i;
const rejectRx=/(tele|telephoto|teleobjetivo|periscope|macro|depth|tof|monochrome|profundidad)/i;

let patched=false;
let refreshing=false;
let baseZoom=null;

function D(id){return document.getElementById(id)}
function toast(msg,ms=2600){try{UI?.toast?.(msg,ms,{placement:'top',tone:'soft'})}catch(_){}}
function readLocal(k){try{return localStorage.getItem(k)||''}catch(_){return''}}
function writeLocal(k,v){try{if(v)localStorage.setItem(k,String(v));else localStorage.removeItem(k)}catch(_){}}
function currentTrack(){try{return State.currentTrack||null}catch(_){return null}}
function currentSettings(){try{return currentTrack()?.getSettings?.()||{}}catch(_){return{}}}
function currentCaps(){try{return currentTrack()?.getCapabilities?.()||{}}catch(_){return{}}}
function currentId(){return String(currentSettings().deviceId||'')}
function currentLabel(){try{return String(currentTrack()?.label||'')}catch(_){return''}}
function isRearLabel(label=''){return rearRx.test(label)&&!frontRx.test(label)}
function isFrontLabel(label=''){return frontRx.test(label)}

function zoomRange(){
  const c=currentCaps();
  if(!c.zoom)return null;
  const min=Number(c.zoom.min),max=Number(c.zoom.max),step=Number(c.zoom.step||.1);
  if(!Number.isFinite(min)||!Number.isFinite(max))return null;
  return{min,max,step:Number.isFinite(step)&&step>0?step:.1};
}
function nativeHalf(){
  const r=zoomRange();
  return !!r&&r.min<=.55;
}
function settingsZoom(){
  const z=Number(currentSettings().zoom);
  return Number.isFinite(z)?z:null;
}
function sameDevice(d,id){return !!id&&String(d?.deviceId||'')===String(id)}

function rearDevices(){
  const arr=Array.isArray(State.devices)?State.devices:[];
  const mapped=arr.map((d,i)=>({d,i,label:String(d.label||''),groupId:String(d.groupId||'')}));
  const clearlyRear=mapped.filter(x=>isRearLabel(x.label));
  if(clearlyRear.length)return clearlyRear;
  // Safari y algunos WebViews entregan etiquetas genéricas después del permiso.
  // Nunca usamos una cámara que explícitamente diga front/selfie.
  return mapped.filter(x=>!isFrontLabel(x.label));
}

function resolveStoredDevice(idKey,labelKey='',groupKey=''){
  const arr=Array.isArray(State.devices)?State.devices:[];
  const savedId=readLocal(idKey);
  if(savedId){
    const byId=arr.findIndex(d=>sameDevice(d,savedId));
    if(byId>=0)return byId;
  }
  const savedLabel=labelKey?readLocal(labelKey):'';
  const savedGroup=groupKey?readLocal(groupKey):'';
  if(savedLabel){
    const matches=arr.map((d,i)=>({d,i}))
      .filter(x=>String(x.d.label||'')===savedLabel&&!isFrontLabel(savedLabel));
    if(savedGroup){
      const exact=matches.find(x=>String(x.d.groupId||'')===savedGroup);
      if(exact)return exact.i;
    }
    // Solo re-asociamos por etiqueta si es inequívoca.
    if(matches.length===1)return matches[0].i;
  }
  return-1;
}

function saveWideDevice(d){
  if(!d?.deviceId)return;
  writeLocal(WIDE_KEY,d.deviceId);
  writeLocal(WIDE_LABEL_KEY,d.label||'');
  writeLocal(WIDE_GROUP_KEY,d.groupId||'');
}
function clearWideDevice(){
  writeLocal(WIDE_KEY,'');
  writeLocal(WIDE_LABEL_KEY,'');
  writeLocal(WIDE_GROUP_KEY,'');
  try{State.wideDeviceId=null;State.wideActive=false}catch(_){}
}

function savedWideIndex(){
  return resolveStoredDevice(WIDE_KEY,WIDE_LABEL_KEY,WIDE_GROUP_KEY);
}
function compositeIndex(){
  return resolveStoredDevice(COMPOSITE_KEY);
}

function candidate(){
  const current=currentId();
  const rear=rearDevices();
  if(!rear.length)return null;

  const saved=savedWideIndex();
  if(saved>=0){
    const x=rear.find(r=>r.i===saved)||{d:State.devices[saved],i:saved,label:String(State.devices[saved]?.label||'')};
    if(x?.d&&!sameDevice(x.d,current))return{...x,mode:'saved'};
  }

  // Apple suele exponer una cámara virtual "Back Triple Camera" / "Back Dual Wide Camera".
  // Si ofrece zoom nativo desde 0.5, esa es la vía preferida porque cambia de sensor sin
  // inventar zoom digital.
  const storedComposite=compositeIndex();
  if(storedComposite>=0){
    const x=rear.find(r=>r.i===storedComposite);
    if(x&&!sameDevice(x.d,current))return{...x,mode:'composite'};
  }

  const explicitUltra=rear.find(x=>!sameDevice(x.d,current)&&ultraRx.test(x.label)&&!rejectRx.test(x.label));
  if(explicitUltra)return{...explicitUltra,mode:'physical'};

  const composite=rear.find(x=>!sameDevice(x.d,current)&&compositeRx.test(x.label)&&!rejectRx.test(x.label));
  if(composite)return{...composite,mode:'composite'};

  // Heurística solo Android. No la aplicamos en iPhone porque "Back Camera 2" puede
  // representar una cámara virtual o teleobjetivo y no queremos etiquetarla como 0.5x.
  if(PLATFORM.android){
    let best=null;
    for(const x of rear){
      if(sameDevice(x.d,current)||rejectRx.test(x.label))continue;
      let score=0;
      if(isRearLabel(x.label))score+=80;
      if(/camera2?\s*2\b|camera\s*2\b|cam\s*2\b/i.test(x.label))score+=360;
      if(/wide|angular/i.test(x.label))score+=240;
      if(/camera2?\s*3\b|camera\s*3\b|cam\s*3\b/i.test(x.label))score+=70;
      if(!best||score>best.score)best={...x,score,mode:'android-heuristic'};
    }
    if(best&&best.score>=300)return best;

    // En Android con exactamente dos entradas traseras genéricas permitimos la otra
    // como candidato temporal. No se memoriza hasta que el usuario la confirme.
    if(rear.length===2){
      const other=rear.find(x=>!sameDevice(x.d,current)&&!rejectRx.test(x.label));
      if(other)return{...other,mode:'android-ambiguous'};
    }
  }
  return null;
}

function rememberMain(){
  const id=currentId(),label=currentLabel();
  const wideIdx=savedWideIndex();
  const wideId=wideIdx>=0?String(State.devices?.[wideIdx]?.deviceId||''):readLocal(WIDE_KEY);
  if(!id||id===wideId||isFrontLabel(label)||State.wideActive)return;
  State.mainDeviceId=id;
  writeLocal(MAIN_KEY,id);
}
function restoreMainReference(){
  const stored=readLocal(MAIN_KEY);
  if(stored&&(State.devices||[]).some(d=>sameDevice(d,stored)))State.mainDeviceId=stored;
}

function paintZoom(z){
  if(!Number.isFinite(Number(z)))return;
  z=Number(z);
  State.zoom=z;
  const slider=D('zoomSlider'),label=D('zoomLabel');
  if(slider){
    slider.min=String(Math.min(.5,Number(State.zoomMin||1)));
    slider.max=String(Math.max(10,Number(State.zoomMax||10)));
    slider.value=String(z);
  }
  if(label)label.textContent=`${z.toFixed(1)}x`;
  document.querySelectorAll('.zoomPresets button').forEach(b=>{
    b.classList.toggle('active',Math.abs(Number(b.dataset.zoom)-z)<.12);
  });
}

function refreshButton(){
  const b=D('zoomPresets')?.querySelector?.('[data-zoom="0.5"]');
  if(!b)return;
  const c=candidate();
  const available=nativeHalf()||!!c||State.wideActive||savedWideIndex()>=0;
  b.classList.remove('isHidden');
  b.classList.toggle('disabled',!available);
  b.textContent='0.5x';
  b.setAttribute('aria-label','Ultra gran angular 0.5x');
  b.dataset.platform=PLATFORM.name;
  if(nativeHalf())b.title=`0.5x real · zoom óptico/multicámara (${PLATFORM.name})`;
  else if(available)b.title=`0.5x real · lente ultra gran angular (${PLATFORM.name})`;
  else b.title=`0.5x · ${PLATFORM.name} no expone aún el ultra gran angular`;
}

function lensOptionLabel(d,i){
  let label=String(d.label||`Cámara ${i+1}`);
  const saved=savedWideIndex();
  const comp=compositeIndex();
  if(i===saved&&!/0\.5x/i.test(label))label+= ' · 0.5x guardado';
  else if(i===comp&&!/multicámara/i.test(label))label+=' · multicámara';
  return label;
}

function decorateLensOptions(){
  const sel=D('cameraLensSelect');
  if(!sel)return;
  Array.from(sel.options||[]).forEach(opt=>{
    const idx=(State.devices||[]).findIndex(d=>String(d.deviceId||'')===String(opt.value||''));
    if(idx>=0)opt.textContent=lensOptionLabel(State.devices[idx],idx);
  });
}

async function applyNativeZoom(value){
  const track=currentTrack(),r=zoomRange();
  if(!track||!r)return false;
  let target=Number(value);
  if(!Number.isFinite(target))return false;
  target=Math.max(r.min,Math.min(r.max,target));
  try{
    await track.applyConstraints({advanced:[{zoom:target}]});
    State.hardwareZoom=true;
    State.digitalZoomScale=1;
    State.wideActive=false;
    State.zoomMin=Math.min(.5,r.min);
    State.zoomMax=Math.max(10,r.max);
    document.documentElement.style.setProperty('--videoZoom','1');
    const after=settingsZoom();
    paintZoom(Number.isFinite(after)?after:target);
    Camera.touchControls?.();
    return true;
  }catch(_){
    return false;
  }
}

function ensureCalibrationButtons(){
  const panel=D('cameraOptions');
  if(!panel)return;

  let btn=D('oneV6625MarkWide');
  if(!btn){
    btn=document.createElement('button');
    btn.id='oneV6625MarkWide';
    btn.type='button';
    btn.className='optionWide';
    btn.textContent='0.5x · Usar lente actual como ultra gran angular';
    btn.title='Sirve en iPhone y Android cuando el navegador muestra nombres genéricos';
    btn.addEventListener('click',async e=>{
      e.preventDefault();e.stopPropagation();
      const id=currentId(),label=currentLabel();
      if(!id)return toast('Primero abre una cámara trasera');
      if(isFrontLabel(label)||State.cameraFacing==='front')return toast('El lente 0.5x debe ser una cámara trasera');

      // Si la cámara actual ya entrega zoom nativo 0.5 (muy habitual en cámaras
      // virtuales de iPhone), la recordamos como multicámara, no como lente físico.
      if(nativeHalf()){
        writeLocal(COMPOSITE_KEY,id);
        State.wideActive=false;
        const ok=await applyNativeZoom(.5);
        refreshButton();decorateLensOptions();
        return toast(ok?'✓ 0.5x real guardado para este iPhone/Android':'El navegador no aceptó 0.5x en este lente',2600);
      }

      const d=(State.devices||[]).find(x=>sameDevice(x,id))||{deviceId:id,label,groupId:''};
      const currentMain=readLocal(MAIN_KEY)||State.mainDeviceId||'';
      if(currentMain&&currentMain!==id)writeLocal(MAIN_KEY,currentMain);
      saveWideDevice(d);
      State.wideDeviceId=id;
      State.wideActive=true;
      restoreMainReference();
      State.zoom=.5;
      try{await Camera.applyZoom(.5,{skipLensSwitch:true})}catch(_){}
      refreshButton();decorateLensOptions();
      btn.textContent='✓ 0.5x guardado para este equipo';
      toast(`✓ Ultra gran angular 0.5x guardado · ${PLATFORM.name}`,2200);
      setTimeout(()=>{btn.textContent='0.5x · Usar lente actual como ultra gran angular'},2200);
    },true);
    panel.appendChild(btn);
  }

  let reset=D('oneV6625ResetWide');
  if(!reset){
    reset=document.createElement('button');
    reset.id='oneV6625ResetWide';
    reset.type='button';
    reset.className='optionWide';
    reset.textContent='↺ Restablecer detección 0.5x';
    reset.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      clearWideDevice();
      writeLocal(COMPOSITE_KEY,'');
      State.zoom=1;
      refreshButton();decorateLensOptions();
      toast('Detección 0.5x restablecida. ONE SHOT volverá a buscar los lentes.',2800);
    },true);
    panel.appendChild(reset);
  }
  const hasSaved=savedWideIndex()>=0||!!readLocal(COMPOSITE_KEY);
  reset.classList.toggle('isHidden',!hasSaved);
}

async function calibrateHelp(){
  try{await Camera.enumerate?.()}catch(_){}
  Camera.renderLensOptions?.();
  decorateLensOptions();
  ensureCalibrationButtons();
  D('cameraOptions')?.classList.add('open');
  const msg=PLATFORM.ios
    ?'iPhone: elige el lente trasero más amplio. Si Safari no lo identifica, toca “Usar lente actual como 0.5x”.'
    :PLATFORM.android
      ?'Android: elige el lente trasero más amplio. Si Chrome no lo identifica, toca “Usar lente actual como 0.5x”.'
      :'Elige el lente trasero más amplio y guárdalo como 0.5x.';
  toast(msg,5200);
}

async function openCandidate(c){
  if(!c?.d?.deviceId)return false;
  rememberMain();
  State.deviceIndex=c.i;
  State.zoom=1;
  State.wideActive=false;
  const opened=await Camera.start({silent:true,force:true});
  if(!opened)return false;

  // Si el dispositivo seleccionado es una cámara virtual con rango desde 0.5
  // (caso típico Back Triple/Back Dual Wide en iPhone), usamos el zoom hardware
  // directo. Esto corrige el clamp >=1 del motor base.
  if(nativeHalf()){
    writeLocal(COMPOSITE_KEY,currentId());
    const ok=await applyNativeZoom(.5);
    refreshButton();decorateLensOptions();
    if(ok)toast(`0.5x real · multicámara ${PLATFORM.name}`,1500);
    return ok;
  }

  // Un lente explícitamente ultra-wide, uno guardado por el usuario o la heurística
  // Android se trata como lente físico 0.5x. Los candidatos ambiguos Android no se
  // memorizan automáticamente.
  if(['physical','saved','android-heuristic','android-ambiguous'].includes(c.mode)){
    State.wideDeviceId=currentId()||c.d.deviceId;
    State.wideActive=true;
    if(c.mode==='physical'||c.mode==='saved')saveWideDevice(c.d);
    State.zoom=.5;
    const ok=await baseZoom(.5,{skipLensSwitch:true});
    refreshButton();decorateLensOptions();
    if(ok!==false){
      toast(c.mode==='android-ambiguous'
        ?'0.5x candidato activo. Si no amplía el campo, calibra el lente desde ☰.'
        :`0.5x · ultra gran angular activo · ${PLATFORM.name}`,2200);
      return true;
    }
  }
  return false;
}

function patch(){
  if(patched)return true;
  if(typeof Camera==='undefined'||typeof State==='undefined')return false;
  patched=true;

  baseZoom=Camera.applyZoom?.bind(Camera);
  const baseFind=Camera.findWideDeviceIndex?.bind(Camera);
  const baseEnum=Camera.enumerate?.bind(Camera);
  const baseRead=Camera.readCapabilities?.bind(Camera);
  const baseSwitch=Camera.switchLens?.bind(Camera);
  const baseMain=Camera.switchToMain?.bind(Camera);
  const baseChoose=Camera.chooseLens?.bind(Camera);
  const baseRender=Camera.renderLensOptions?.bind(Camera);

  Camera.findWideDeviceIndex=function(){
    const c=candidate();
    if(c)return c.i;
    try{return Number(baseFind?.()??-1)}catch(_){return-1}
  };

  if(baseEnum)Camera.enumerate=async function(){
    const r=await baseEnum();
    restoreMainReference();
    rememberMain();
    setTimeout(()=>{
      try{Camera.renderLensOptions?.();decorateLensOptions();refreshButton();ensureCalibrationButtons()}catch(_){}
    },0);
    return r;
  };

  if(baseRender)Camera.renderLensOptions=function(){
    const r=baseRender();
    decorateLensOptions();
    return r;
  };

  if(baseRead)Camera.readCapabilities=function(){
    const r=baseRead();
    const id=currentId();

    if(nativeHalf()){
      // No marcamos wideActive: 0.5/1/2... viven en la misma cámara virtual.
      State.wideActive=false;
      State.zoomMin=.5;
      writeLocal(COMPOSITE_KEY,id);
      State.mainDeviceId=id;
      writeLocal(MAIN_KEY,id);
      const z=settingsZoom();
      if(Number.isFinite(z))paintZoom(z);
    }else{
      const idx=savedWideIndex();
      const savedId=idx>=0?String(State.devices?.[idx]?.deviceId||''):'';
      if(savedId&&id===savedId){
        State.wideDeviceId=id;
        State.wideActive=true;
        restoreMainReference();
        if(State.zoom>=1)State.zoom=.5;
        paintZoom(State.zoom);
      }else{
        rememberMain();
      }
    }
    refreshButton();ensureCalibrationButtons();decorateLensOptions();
    return r;
  };

  if(baseSwitch)Camera.switchLens=async function(preferWide=false){
    if(!preferWide)return baseSwitch(false);

    // Primero aprovechamos la cámara actual si ya es multicámara 0.5x.
    if(nativeHalf()){
      writeLocal(COMPOSITE_KEY,currentId());
      const ok=await applyNativeZoom(.5);
      refreshButton();
      if(ok)toast(`0.5x real · ${PLATFORM.name}`,1400);
      return ok;
    }

    try{await Camera.enumerate?.()}catch(_){}
    const c=candidate();
    if(!c){
      await calibrateHelp();
      return false;
    }
    const ok=await openCandidate(c);
    if(!ok)await calibrateHelp();
    return ok;
  };

  if(baseMain)Camera.switchToMain=async function(target=1){
    // En una cámara virtual (iPhone Back Triple/Dual Wide o equivalente Android)
    // no cambiamos de deviceId: solo regresamos el zoom hardware a 1x.
    if(nativeHalf()){
      State.wideActive=false;
      const ok=await applyNativeZoom(Math.max(1,Number(target)||1));
      refreshButton();
      return ok;
    }
    restoreMainReference();
    const r=await baseMain(target);
    State.wideActive=false;
    refreshButton();
    return r;
  };

  if(baseZoom)Camera.applyZoom=async function(value,opts={}){
    let z=Number(value);
    if(!Number.isFinite(z))z=1;

    // Ruta crítica iOS/Android multicámara: el motor base anterior mostraba 0.5
    // pero luego lo limitaba a >=1. Aquí aplicamos directamente el zoom hardware.
    if(z<.95&&!State.wideActive&&nativeHalf()){
      const ok=await applyNativeZoom(z);
      refreshButton();
      return ok;
    }

    if(z<.95&&!opts?.skipLensSwitch&&!State.wideActive){
      try{await Camera.enumerate?.()}catch(_){}
      const c=candidate();
      if(!c){
        await calibrateHelp();
        refreshButton();
        return false;
      }
      return openCandidate(c);
    }

    const r=await baseZoom(value,opts);
    refreshButton();
    return r;
  };

  if(baseChoose)Camera.chooseLens=async function(deviceId){
    const before=currentId();
    const wideIdx=savedWideIndex();
    const savedWideId=wideIdx>=0?String(State.devices?.[wideIdx]?.deviceId||''):'';
    if(before&&before!==savedWideId&&State.cameraFacing!=='front')writeLocal(MAIN_KEY,before);

    const r=await baseChoose(deviceId);
    const id=currentId();

    if(nativeHalf()){
      writeLocal(COMPOSITE_KEY,id);
      State.mainDeviceId=id;
      writeLocal(MAIN_KEY,id);
      State.wideActive=false;
      State.zoomMin=.5;
    }else{
      const idx=savedWideIndex();
      const wideId=idx>=0?String(State.devices?.[idx]?.deviceId||''):'';
      if(wideId&&id===wideId){
        State.wideDeviceId=id;
        State.wideActive=true;
        restoreMainReference();
        State.zoom=.5;
        await baseZoom(.5,{skipLensSwitch:true});
      }
    }
    refreshButton();ensureCalibrationButtons();decorateLensOptions();
    return r;
  };

  restoreMainReference();
  ensureCalibrationButtons();
  refreshButton();

  // iOS y Android suelen revelar más información de cámara solo después de que
  // el usuario concedió permiso y el video ya está reproduciendo.
  let n=0;
  const probe=setInterval(async()=>{
    n++;
    if(document.hidden)return;
    if(State.cameraStatus==='active'&&State.currentTrack?.readyState==='live'&&!refreshing){
      refreshing=true;
      try{
        await Camera.enumerate?.();
        Camera.readCapabilities?.();
        refreshButton();
      }catch(_){}
      finally{refreshing=false}
      if(nativeHalf()||candidate()||n>14)clearInterval(probe);
    }else if(n>34)clearInterval(probe);
  },650);

  document.documentElement.dataset.oneShotCameraPlatform=PLATFORM.name.toLowerCase();
  return true;
}

let tries=0;
const timer=setInterval(()=>{tries++;if(patch()||tries>300)clearInterval(timer)},10);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)setTimeout(()=>{
    try{Camera?.enumerate?.();Camera?.readCapabilities?.();refreshButton()}catch(_){}
  },300);
});
window.ONE_V6625_ULTRAWIDE={BUILD,PLATFORM,patch,candidate,refreshButton,calibrateHelp,applyNativeZoom};
})();
