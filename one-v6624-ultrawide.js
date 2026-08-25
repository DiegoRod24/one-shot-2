/* ONE SHOT v6.6.24 · 0.5x ULTRA WIDE REAL */
(()=>{
'use strict';
if(window.ONE_V6624_ULTRAWIDE)return;
const BUILD='oneshot-v6.6.24-ultrawide-01';
const WIDE_KEY='oneshotUltraWideDeviceId';
const MAIN_KEY='oneshotMainCameraDeviceId';
const wideRx=/(ultra[\s-]?wide|ultrawide|0[.,]5|gran angular|wide angle|super wide|triple camera|dual wide)/i;
const rearRx=/(back|rear|environment|trasera|posterior|world|facing back)/i;
const frontRx=/(front|frontal|selfie|user facing|facing front)/i;
const rejectRx=/(tele|telephoto|periscope|macro|depth|tof|monochrome)/i;
let patched=false;
let refreshing=false;

function D(id){return document.getElementById(id)}
function toast(msg,ms=2600){try{UI?.toast?.(msg,ms,{placement:'top',tone:'soft'})}catch(_){}}
function readLocal(k){try{return localStorage.getItem(k)||''}catch(_){return''}}
function writeLocal(k,v){try{if(v)localStorage.setItem(k,v);else localStorage.removeItem(k)}catch(_){}}
function currentId(){try{return State.currentTrack?.getSettings?.().deviceId||''}catch(_){return''}}
function currentLabel(){try{return State.currentTrack?.label||''}catch(_){return''}}
function isRearLabel(label=''){return rearRx.test(label)&&!frontRx.test(label)}
function isFrontLabel(label=''){return frontRx.test(label)}
function nativeHalf(){try{const c=State.currentTrack?.getCapabilities?.()||{};return !!c.zoom&&Number(c.zoom.min)<=.55}catch(_){return false}}

function rearDevices(){
  const arr=Array.isArray(State.devices)?State.devices:[];
  const clearlyRear=arr.map((d,i)=>({d,i,label:String(d.label||'')})).filter(x=>isRearLabel(x.label));
  if(clearlyRear.length)return clearlyRear;
  // Algunos navegadores no describen el facing mode en la etiqueta. Solo usamos
  // los no-front como fallback; nunca elegimos uno que diga frontal/selfie.
  return arr.map((d,i)=>({d,i,label:String(d.label||'')})).filter(x=>!isFrontLabel(x.label));
}

function savedWideIndex(){
  const saved=readLocal(WIDE_KEY);
  if(!saved)return-1;
  const idx=(State.devices||[]).findIndex(d=>d.deviceId===saved);
  if(idx<0)writeLocal(WIDE_KEY,'');
  return idx;
}

function bestWideIndex(){
  const saved=savedWideIndex();
  if(saved>=0)return saved;
  const current=currentId();
  const rear=rearDevices().filter(x=>x.d.deviceId!==current);
  if(!rear.length)return-1;

  // Primero una etiqueta inequívoca del fabricante/navegador.
  const explicit=rear.find(x=>wideRx.test(x.label)&&!rejectRx.test(x.label));
  if(explicit)return explicit.i;

  // Android/Chrome suele exponer camera2 0, camera2 2, etc. El sensor 2 es
  // frecuentemente el gran angular secundario. Se usa como heurística, nunca
  // un sensor descrito como tele/macro/depth.
  let best={idx:-1,score:-Infinity};
  for(const x of rear){
    let score=0;
    if(rejectRx.test(x.label))score-=2000;
    if(isRearLabel(x.label))score+=120;
    if(/camera\s*2\b|camera2\s*2\b|cam\s*2\b/i.test(x.label))score+=360;
    if(/camera\s*3\b|camera2\s*3\b|cam\s*3\b/i.test(x.label))score+=90;
    if(/wide/i.test(x.label))score+=250;
    if(score>best.score)best={idx:x.i,score};
  }
  if(best.idx>=0&&best.score>=300)return best.idx;

  // Si el navegador expone exactamente dos cámaras traseras, la otra cámara
  // es el único candidato físico razonable. El usuario puede corregirlo desde
  // Lente / encuadre y memorizar el sensor correcto.
  const allRear=rearDevices();
  if(allRear.length===2){
    const other=allRear.find(x=>x.d.deviceId!==current);
    if(other&&!rejectRx.test(other.label))return other.i;
  }
  return-1;
}

function rememberMain(){
  const id=currentId(),label=currentLabel(),savedWide=readLocal(WIDE_KEY);
  if(!id||id===savedWide||isFrontLabel(label))return;
  State.mainDeviceId=id;
  writeLocal(MAIN_KEY,id);
}

function restoreMainReference(){
  const stored=readLocal(MAIN_KEY);
  if(stored&&(State.devices||[]).some(d=>d.deviceId===stored))State.mainDeviceId=stored;
}

function refreshButton(){
  const b=D('zoomPresets')?.querySelector?.('[data-zoom="0.5"]');
  if(!b)return;
  const idx=bestWideIndex();
  const available=nativeHalf()||idx>=0||State.wideActive||!!readLocal(WIDE_KEY);
  b.classList.remove('isHidden');
  b.classList.toggle('disabled',!available);
  b.textContent='0.5x';
  b.setAttribute('aria-label','Ultra gran angular 0.5x');
  b.title=available?'0.5x · Ultra gran angular':'0.5x · el navegador aún no expone un lente ultra gran angular';
}

function ensureCalibrationButton(){
  const panel=D('cameraOptions');
  if(!panel||D('oneV6624MarkWide'))return;
  const btn=document.createElement('button');
  btn.id='oneV6624MarkWide';
  btn.type='button';
  btn.className='optionWide';
  btn.textContent='0.5x · Usar lente actual como ultra gran angular';
  btn.title='Úsalo si tu teléfono muestra cámaras traseras con nombres genéricos';
  btn.addEventListener('click',async e=>{
    e.preventDefault();e.stopPropagation();
    const id=currentId(),label=currentLabel();
    if(!id)return toast('Primero abre una cámara trasera');
    if(isFrontLabel(label)||State.cameraFacing==='front')return toast('El lente 0.5x debe ser una cámara trasera');
    const oldWide=readLocal(WIDE_KEY);
    if(!oldWide||oldWide!==id){
      const existingMain=readLocal(MAIN_KEY);
      if(!existingMain&&State.mainDeviceId&&State.mainDeviceId!==id)writeLocal(MAIN_KEY,State.mainDeviceId);
      writeLocal(WIDE_KEY,id);
    }
    State.wideDeviceId=id;
    State.wideActive=true;
    restoreMainReference();
    State.zoom=.5;
    try{await Camera.applyZoom(.5,{skipLensSwitch:true})}catch(_){}
    refreshButton();
    btn.textContent='✓ 0.5x guardado para este celular';
    toast('✓ Lente ultra gran angular 0.5x guardado',2200);
    setTimeout(()=>{btn.textContent='0.5x · Usar lente actual como ultra gran angular'},2200);
  },true);
  panel.appendChild(btn);
}

async function calibrateHelp(){
  try{await Camera.enumerate?.()}catch(_){}
  Camera.renderLensOptions?.();
  ensureCalibrationButton();
  D('cameraOptions')?.classList.add('open');
  toast('Elige el lente trasero más amplio y toca “Usar lente actual como 0.5x”',4200);
}

function patch(){
  if(patched)return true;
  if(typeof Camera==='undefined'||typeof State==='undefined')return false;
  patched=true;

  const baseFind=Camera.findWideDeviceIndex?.bind(Camera);
  Camera.findWideDeviceIndex=function(){
    const learned=bestWideIndex();
    if(learned>=0)return learned;
    try{return Number(baseFind?.()??-1)}catch(_){return-1}
  };

  const baseEnum=Camera.enumerate?.bind(Camera);
  if(baseEnum)Camera.enumerate=async function(){
    const r=await baseEnum();
    restoreMainReference();
    rememberMain();
    setTimeout(()=>{try{Camera.renderLensOptions?.();refreshButton()}catch(_){}},0);
    return r;
  };

  const baseRead=Camera.readCapabilities?.bind(Camera);
  if(baseRead)Camera.readCapabilities=function(){
    const r=baseRead();
    const saved=readLocal(WIDE_KEY),id=currentId();
    if(saved&&id===saved){State.wideDeviceId=saved;State.wideActive=true;restoreMainReference();if(State.zoom>=1)State.zoom=.5}
    else rememberMain();
    refreshButton();ensureCalibrationButton();
    return r;
  };

  const baseSwitch=Camera.switchLens?.bind(Camera);
  if(baseSwitch)Camera.switchLens=async function(preferWide=false){
    if(!preferWide)return baseSwitch(false);
    try{await Camera.enumerate?.()}catch(_){}
    const idx=Camera.findWideDeviceIndex();
    if(idx<0){await calibrateHelp();return false}
    rememberMain();
    const d=(State.devices||[])[idx];
    if(!d?.deviceId){await calibrateHelp();return false}
    State.wideDeviceId=d.deviceId;
    State.deviceIndex=idx;
    State.zoom=.5;
    const result=await Camera.start({silent:true,force:true});
    if(!result)return false;
    const now=currentId();
    if(now===d.deviceId){
      State.wideActive=true;
      if(wideRx.test(d.label||'')||rearDevices().length===2)writeLocal(WIDE_KEY,d.deviceId);
      restoreMainReference();
      await Camera.applyZoom(.5,{skipLensSwitch:true});
      refreshButton();
      toast('0.5x · ultra gran angular activo',1500);
      return true;
    }
    return false;
  };

  const baseMain=Camera.switchToMain?.bind(Camera);
  if(baseMain)Camera.switchToMain=async function(target=1){
    restoreMainReference();
    const r=await baseMain(target);
    State.wideActive=false;
    refreshButton();
    return r;
  };

  const baseZoom=Camera.applyZoom?.bind(Camera);
  if(baseZoom)Camera.applyZoom=async function(value,opts={}){
    const z=Number(value);
    if(Number.isFinite(z)&&z<.95&&!opts?.skipLensSwitch&&!State.wideActive&&!nativeHalf()){
      try{await Camera.enumerate?.()}catch(_){}
      if(Camera.findWideDeviceIndex()<0){await calibrateHelp();refreshButton();return false}
    }
    const r=await baseZoom(value,opts);
    refreshButton();
    return r;
  };

  const baseChoose=Camera.chooseLens?.bind(Camera);
  if(baseChoose)Camera.chooseLens=async function(deviceId){
    const before=currentId();
    if(before&&before!==readLocal(WIDE_KEY)&&State.cameraFacing!=='front')writeLocal(MAIN_KEY,before);
    const r=await baseChoose(deviceId);
    const id=currentId(),saved=readLocal(WIDE_KEY);
    if(saved&&id===saved){State.wideDeviceId=saved;State.wideActive=true;restoreMainReference();State.zoom=.5;await Camera.applyZoom(.5,{skipLensSwitch:true})}
    refreshButton();ensureCalibrationButton();
    return r;
  };

  restoreMainReference();
  ensureCalibrationButton();
  refreshButton();

  // La enumeración posterior a permisos es la que suele revelar los sensores
  // secundarios en Android. Refrescamos sin bloquear la primera imagen.
  let n=0;
  const probe=setInterval(async()=>{
    n++;
    if(document.hidden)return;
    if(State.cameraStatus==='active'&&State.currentTrack?.readyState==='live'&&!refreshing){
      refreshing=true;
      try{await Camera.enumerate?.();Camera.readCapabilities?.();refreshButton()}catch(_){}finally{refreshing=false}
      if(bestWideIndex()>=0||nativeHalf()||n>12)clearInterval(probe);
    }else if(n>30)clearInterval(probe);
  },650);

  return true;
}

let tries=0;
const timer=setInterval(()=>{tries++;if(patch()||tries>300)clearInterval(timer)},10);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{try{Camera?.enumerate?.();refreshButton()}catch(_){}},300)});
window.ONE_V6624_ULTRAWIDE={BUILD,patch,bestWideIndex,refreshButton,calibrateHelp};
})();
