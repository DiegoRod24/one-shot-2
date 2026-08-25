/* ONE SHOT v6.6.26 · CAMERA CORE · 0.5x DIRECTO · iPhone + Android */
(()=>{
'use strict';
if(window.ONE_V6626_CAMERA_CORE)return;

const BUILD='oneshot-v6.6.26-camera-core-slim-01';
const MAIN_KEY='oneshotMainCameraDeviceId';
const WIDE_KEY='oneshotUltraWideDeviceId';
const WIDE_LABEL_KEY='oneshotUltraWideLabel';
const WIDE_GROUP_KEY='oneshotUltraWideGroupId';
const COMPOSITE_KEY='oneshotCompositeCameraDeviceId';
const MIGRATION_KEY='oneshotAutoLensV6626';

const ua=navigator.userAgent||'';
const PLATFORM={
  ios:/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
  android:/Android/i.test(ua)
};
PLATFORM.name=PLATFORM.ios?'iOS':PLATFORM.android?'Android':'Web';

const ultraRx=/(ultra[\s-]?wide|ultrawide|0[.,]5|super[\s-]?wide|gran angular|ultra gran angular)/i;
const compositeRx=/(back.*(?:dual|triple)|dual wide|dual camera|triple camera|c[aá]mara (?:doble|triple))/i;
const rearRx=/(back|rear|environment|trasera|posterior|world|facing back|c[aá]mara trasera)/i;
const frontRx=/(front|frontal|selfie|user facing|facing front|c[aá]mara frontal)/i;
const rejectRx=/(tele|telephoto|teleobjetivo|periscope|macro|depth|tof|monochrome|profundidad)/i;

let patched=false;
let switching=false;
let baseZoom=null;
let baseEnum=null;
let baseRead=null;
let baseRender=null;
let baseStop=null;

const D=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function toast(msg,ms=2600){try{UI?.toast?.(msg,ms,{placement:'top',tone:'soft'})}catch(_){}}
function status(msg){try{UI?.status?.(msg)}catch(_){}}
function readLocal(k){try{return localStorage.getItem(k)||''}catch(_){return''}}
function writeLocal(k,v){try{if(v)localStorage.setItem(k,String(v));else localStorage.removeItem(k)}catch(_){}}
function currentTrack(){try{return State.currentTrack||null}catch(_){return null}}
function settings(){try{return currentTrack()?.getSettings?.()||{}}catch(_){return{}}}
function caps(){try{return currentTrack()?.getCapabilities?.()||{}}catch(_){return{}}}
function constraints(){try{return currentTrack()?.getConstraints?.()||{}}catch(_){return{}}}
function currentId(){return String(settings().deviceId||'')}
function currentLabel(){try{return String(currentTrack()?.label||'')}catch(_){return''}}
function sameDevice(d,id){return !!id&&String(d?.deviceId||'')===String(id)}
function isFront(label=''){return frontRx.test(label)}
function isRear(label=''){return rearRx.test(label)&&!frontRx.test(label)}
function isUltra(label=''){return ultraRx.test(label)&&!rejectRx.test(label)}

function zoomRange(){
  const c=caps();
  if(!c.zoom)return null;
  const min=Number(c.zoom.min),max=Number(c.zoom.max),step=Number(c.zoom.step||.1);
  if(!Number.isFinite(min)||!Number.isFinite(max))return null;
  return{min,max,step:Number.isFinite(step)&&step>0?step:.1};
}
function nativeHalf(){const r=zoomRange();return !!r&&r.min<=.55}
function settingZoom(){const z=Number(settings().zoom);return Number.isFinite(z)?z:null}
function requestedZoom(){
  const c=constraints();
  if(Number.isFinite(Number(c.zoom)))return Number(c.zoom);
  const advanced=Array.isArray(c.advanced)?c.advanced:[];
  for(let i=advanced.length-1;i>=0;i--){if(Number.isFinite(Number(advanced[i]?.zoom)))return Number(advanced[i].zoom)}
  return null;
}

function resetLegacyCalibrationOnce(){
  if(readLocal(MIGRATION_KEY)==='1')return;
  // Versiones anteriores podían memorizar por error el lente 1x como 0.5x.
  // Se limpia una sola vez para que la detección automática empiece desde cero.
  writeLocal(WIDE_KEY,'');writeLocal(WIDE_LABEL_KEY,'');writeLocal(WIDE_GROUP_KEY,'');writeLocal(COMPOSITE_KEY,'');
  writeLocal(MIGRATION_KEY,'1');
}
function saveWide(d){
  if(!d?.deviceId)return;
  writeLocal(WIDE_KEY,d.deviceId);writeLocal(WIDE_LABEL_KEY,d.label||'');writeLocal(WIDE_GROUP_KEY,d.groupId||'');
}
function resolveSavedWide(){
  const arr=Array.isArray(State.devices)?State.devices:[];
  const id=readLocal(WIDE_KEY);
  if(id){const i=arr.findIndex(d=>sameDevice(d,id));if(i>=0)return i}
  const label=readLocal(WIDE_LABEL_KEY),group=readLocal(WIDE_GROUP_KEY);
  if(label){
    const matches=arr.map((d,i)=>({d,i})).filter(x=>String(x.d.label||'')===label&&!isFront(label));
    if(group){const x=matches.find(m=>String(m.d.groupId||'')===group);if(x)return x.i}
    if(matches.length===1)return matches[0].i;
  }
  return-1;
}

function rearDevices(){
  const arr=Array.isArray(State.devices)?State.devices:[];
  const mapped=arr.map((d,i)=>({d,i,label:String(d.label||''),groupId:String(d.groupId||'')}));
  const clear=mapped.filter(x=>isRear(x.label));
  if(clear.length)return clear;
  return mapped.filter(x=>!isFront(x.label));
}
function rememberMain(){
  if(State.__oneCameraRole==='wide'||State.wideActive)return;
  const id=currentId(),label=currentLabel();
  if(!id||isFront(label)||isUltra(label))return;
  State.mainDeviceId=id;writeLocal(MAIN_KEY,id);
}
function restoreMain(){
  const id=readLocal(MAIN_KEY);
  if(id&&(State.devices||[]).some(d=>sameDevice(d,id)))State.mainDeviceId=id;
}

function candidate(){
  const current=currentId(),rear=rearDevices();
  if(!rear.length)return null;
  const saved=resolveSavedWide();
  if(saved>=0){const x=rear.find(r=>r.i===saved);if(x&&!sameDevice(x.d,current))return{...x,mode:'saved'}}
  const explicit=rear.find(x=>!sameDevice(x.d,current)&&isUltra(x.label));
  if(explicit)return{...explicit,mode:'physical'};
  const composite=rear.find(x=>!sameDevice(x.d,current)&&compositeRx.test(x.label)&&!rejectRx.test(x.label));
  if(composite)return{...composite,mode:'composite'};
  if(PLATFORM.android){
    let best=null;
    for(const x of rear){
      if(sameDevice(x.d,current)||rejectRx.test(x.label))continue;
      let score=0;
      if(isRear(x.label))score+=70;
      if(/camera2?\s*2\b|camera\s*2\b|cam\s*2\b/i.test(x.label))score+=360;
      if(/ultra|wide|angular/i.test(x.label))score+=280;
      if(/camera2?\s*3\b|camera\s*3\b|cam\s*3\b/i.test(x.label))score+=60;
      if(!best||score>best.score)best={...x,score,mode:'android-heuristic'};
    }
    if(best&&best.score>=300)return best;
  }
  return null;
}

function paintZoom(z){
  z=Number(z);if(!Number.isFinite(z))return;
  State.zoom=z;
  const slider=D('zoomSlider'),label=D('zoomLabel');
  if(slider){slider.min=String(State.zoomMin||.5);slider.max=String(State.zoomMax||10);slider.value=String(z)}
  if(label)label.textContent=`${z.toFixed(1)}x`;
  document.querySelectorAll('.zoomPresets button').forEach(b=>b.classList.toggle('active',Math.abs(Number(b.dataset.zoom)-z)<.12));
}
function refreshHalfButton(){
  const b=D('zoomPresets')?.querySelector?.('[data-zoom="0.5"]');if(!b)return;
  const available=nativeHalf()||State.wideActive||resolveSavedWide()>=0||!!candidate();
  b.classList.remove('isHidden');
  b.classList.toggle('disabled',!available);
  b.setAttribute('aria-disabled',String(!available));
  b.textContent='0.5x';
  b.title=available?`0.5x real · ${PLATFORM.name}`:`0.5x no disponible por ${PLATFORM.name}/navegador`;
}
function removeOldCalibrationUi(){D('oneV6625MarkWide')?.remove();D('oneV6625ResetWide')?.remove()}

async function nextVideoFrame(){
  const v=D('video');
  if(v?.requestVideoFrameCallback)await new Promise(r=>v.requestVideoFrameCallback(()=>r()));
  else await wait(90);
}
async function applyNativeZoomVerified(target){
  const track=currentTrack(),r=zoomRange();
  if(!track||!r||target<r.min-.02||target>r.max+.02)return false;
  try{
    await track.applyConstraints({advanced:[{zoom:target}]});
    await nextVideoFrame();
    const after=settingZoom(),requested=requestedZoom();
    // Si el navegador sí reporta el valor aplicado, no aceptamos un falso 0.5.
    if(Number.isFinite(after)&&target<=.55&&after>.72)return false;
    if(Number.isFinite(after)&&target>=.95&&after<.78)return false;
    if(!Number.isFinite(after)&&Number.isFinite(requested)&&Math.abs(requested-target)>.18)return false;
    State.hardwareZoom=true;State.digitalZoomScale=1;State.wideActive=false;
    State.zoomMin=Math.min(.5,r.min);State.zoomMax=Math.max(10,r.max);
    document.documentElement.style.setProperty('--videoZoom','1');
    paintZoom(Number.isFinite(after)?after:target);Camera.touchControls?.();
    return true;
  }catch(_){return false}
}

async function enumerate(){
  try{if(baseEnum)await baseEnum();else State.devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput')}catch(_){State.devices=[]}
  restoreMain();rememberMain();refreshHalfButton();
  try{baseRender?.();}catch(_){}
  return State.devices;
}

async function attachStream(stream,role='main',silent=true){
  const track=stream?.getVideoTracks?.()[0];
  if(!track){stream?.getTracks?.().forEach(t=>t.stop());throw new Error('No se recibió pista de video')}
  State.stream=stream;State.currentTrack=track;State.__oneCameraRole=role;
  const facing=String(track.getSettings?.().facingMode||'');
  State.cameraFacing=/user|front/i.test(facing)||isFront(track.label||'')?'front':'back';
  const video=D('video');if(!video)throw new Error('Vista de cámara no disponible');
  video.srcObject=stream;await video.play();await Camera.waitReady?.(video);
  try{Camera.readCapabilities?.()}catch(_){}
  try{Camera.armRecovery?.()}catch(_){}
  Camera.setStatus?.('active');Camera.touchControls?.();
  try{Sensors?.enable?.().catch(()=>{});Sensors?.smartRotate?.(true);Sensors?.applyStageOrientation?.(false)}catch(_){}
  if(role!=='wide')rememberMain();
  setTimeout(()=>enumerate().catch(()=>{}),30);
  setTimeout(()=>enumerate().catch(()=>{}),900);
  const st=track.getSettings?.()||{};status(`Cámara trasera lista · ${st.width||'?'}×${st.height||'?'}`);
  if(!silent)toast('Cámara lista',1000);
  return true;
}
async function stopForSwitch(){
  try{await Promise.race([baseStop?.({keepWanted:true}),wait(900)])}catch(_){}
  try{const v=D('video');if(v?.srcObject){v.srcObject.getTracks?.().forEach(t=>t.stop());v.srcObject=null}}catch(_){}
}
async function openWithConstraints(videoConstraints,role='main',silent=true){
  await stopForSwitch();
  const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:videoConstraints});
  return attachStream(stream,role,silent);
}
async function openDevice(deviceId,role='manual',silent=true){
  if(!deviceId)return false;
  const q=Camera.qualityConstraints?.()||{width:{ideal:1920},height:{ideal:1080}};
  return openWithConstraints({deviceId:{exact:deviceId},...q},role,silent);
}
async function openRearMain(silent=true){
  const q=Camera.qualityConstraints?.()||{width:{ideal:1920},height:{ideal:1080}};
  const saved=readLocal(MAIN_KEY);
  if(saved){try{return await openDevice(saved,'main',silent)}catch(_){writeLocal(MAIN_KEY,'')}}
  let last=null;
  for(const c of [
    {facingMode:{exact:'environment'},...q},
    {facingMode:{ideal:'environment'},...q},
    {facingMode:'environment'}
  ]){
    try{return await openWithConstraints(c,'main',silent)}catch(e){last=e}
  }
  await enumerate();
  const rear=rearDevices().find(x=>!isUltra(x.label)&&!rejectRx.test(x.label))||rearDevices()[0];
  if(rear?.d?.deviceId)return openDevice(rear.d.deviceId,'main',silent);
  throw last||new Error('No se encontró cámara trasera');
}

async function activateHalf(){
  if(switching)return false;switching=true;
  try{
    if(State.cameraStatus!=='active'||!currentTrack())await Camera.start({silent:true});
    if(nativeHalf()){
      const ok=await applyNativeZoomVerified(.5);
      refreshHalfButton();
      if(ok){writeLocal(COMPOSITE_KEY,currentId());toast('0.5x · ultra gran angular activo',1200);return true}
    }
    await enumerate();
    const c=candidate();
    if(!c){paintZoom(1);toast('0.5x no disponible en este navegador/equipo',2800);return false}
    const mainBefore=currentId();if(mainBefore&&!State.wideActive){State.mainDeviceId=mainBefore;writeLocal(MAIN_KEY,mainBefore)}
    try{await openDevice(c.d.deviceId,c.mode==='composite'?'composite':'wide',true)}catch(_){paintZoom(1);toast('No se pudo abrir el lente 0.5x',2600);return false}
    if(nativeHalf()){
      const ok=await applyNativeZoomVerified(.5);
      if(ok){writeLocal(COMPOSITE_KEY,currentId());State.__oneCameraRole='composite';toast('0.5x · ultra gran angular activo',1200);return true}
    }
    if(c.mode==='physical'||c.mode==='saved'||c.mode==='android-heuristic'||isUltra(currentLabel())){
      State.wideDeviceId=currentId()||c.d.deviceId;State.wideActive=true;State.__oneCameraRole='wide';
      if(c.mode==='physical'||isUltra(c.label))saveWide(c.d);
      State.hardwareZoom=false;State.digitalZoomScale=1;document.documentElement.style.setProperty('--videoZoom','1');
      paintZoom(.5);refreshHalfButton();toast('0.5x · ultra gran angular activo',1200);return true;
    }
    // Cámara compuesta que no entregó rango 0.5: volvemos a 1x; no fingimos el efecto.
    await openRearMain(true);paintZoom(1);toast('El navegador no expone 0.5x real en este equipo',2800);return false;
  }finally{switching=false;refreshHalfButton()}
}
async function activateMain(target=1){
  target=Math.max(1,Number(target)||1);
  if(switching)return false;switching=true;
  try{
    if(nativeHalf()&&!State.wideActive){
      const ok=await applyNativeZoomVerified(1);
      if(ok){if(target>1&&baseZoom)return baseZoom(target);paintZoom(1);return true}
    }
    if(State.wideActive||State.__oneCameraRole==='wide'){
      const main=readLocal(MAIN_KEY)||State.mainDeviceId||'';
      if(main){try{await openDevice(main,'main',true)}catch(_){await openRearMain(true)}}else await openRearMain(true);
      State.wideActive=false;State.wideDeviceId=null;paintZoom(1);
      if(target>1&&baseZoom)return baseZoom(target);
      return true;
    }
    if(target===1&&nativeHalf())return applyNativeZoomVerified(1);
    if(target===1){paintZoom(1);if(baseZoom)await baseZoom(1);return true}
    return baseZoom?baseZoom(target):false;
  }finally{switching=false;refreshHalfButton()}
}

function patch(){
  if(patched)return true;
  if(typeof Camera==='undefined'||typeof State==='undefined'||!navigator.mediaDevices?.getUserMedia)return false;
  patched=true;resetLegacyCalibrationOnce();removeOldCalibrationUi();

  baseZoom=Camera.applyZoom?.bind(Camera);baseEnum=Camera.enumerate?.bind(Camera);baseRead=Camera.readCapabilities?.bind(Camera);
  baseRender=Camera.renderLensOptions?.bind(Camera);baseStop=Camera.stop?.bind(Camera);
  const baseSwitch=Camera.switchLens?.bind(Camera),baseChoose=Camera.chooseLens?.bind(Camera);

  Camera.start=async function({silent=false,force=false}={}){
    State.cameraWanted=true;
    if(State.startPromise)return State.startPromise;
    if(!force&&State.cameraStatus==='active'&&currentTrack()?.readyState==='live')return true;
    State.startPromise=(async()=>{
      try{Camera.setStatus?.('starting','Abriendo cámara trasera…');return await openRearMain(silent)}
      catch(err){Camera.setStatus?.('error',err?.message||'No se pudo iniciar la cámara trasera');if(!silent)toast(err?.message||'No se pudo iniciar la cámara',3200);return false}
    })();
    try{return await State.startPromise}finally{State.startPromise=null}
  };

  Camera.enumerate=enumerate;
  Camera.findWideDeviceIndex=function(){const c=candidate();return c?.i??-1};

  if(baseRead)Camera.readCapabilities=function(){
    const r=baseRead();
    if(nativeHalf()){State.zoomMin=.5;State.wideActive=false;writeLocal(COMPOSITE_KEY,currentId());if(State.__oneCameraRole!=='wide')rememberMain()}
    else if(State.__oneCameraRole==='wide'){State.wideActive=true;State.zoomMin=.5;paintZoom(.5)}
    refreshHalfButton();return r;
  };
  if(baseRender)Camera.renderLensOptions=function(){const r=baseRender();refreshHalfButton();return r};

  Camera.applyZoom=async function(value,opts={}){
    let z=Number(value);if(!Number.isFinite(z))z=1;
    if(z<.75&&!opts?.skipLensSwitch)return activateHalf();
    if(z>=.95&&z<1.25)return activateMain(1);
    if(State.wideActive&&z>=.95)return activateMain(z);
    if(nativeHalf()&&z<.95)return applyNativeZoomVerified(z);
    return baseZoom?baseZoom(z,opts):false;
  };
  Camera.switchToMain=activateMain;
  Camera.switchLens=async function(preferWide=false){
    if(preferWide)return activateHalf();
    await enumerate();
    if((State.devices||[]).length<2)return toast('El navegador no expone otro lente');
    const id=currentId();let idx=(State.devices||[]).findIndex(d=>sameDevice(d,id));if(idx<0)idx=State.deviceIndex||0;
    const next=(idx+1)%State.devices.length;State.deviceIndex=next;
    try{await openDevice(State.devices[next].deviceId,'manual',true);paintZoom(1);return true}catch(_){return baseSwitch?baseSwitch(false):false}
  };
  if(baseChoose)Camera.chooseLens=async function(deviceId){
    const idx=(State.devices||[]).findIndex(d=>sameDevice(d,deviceId));if(idx>=0)State.deviceIndex=idx;
    try{await openDevice(deviceId,'manual',true);State.wideActive=false;paintZoom(1);return true}catch(_){return false}
  };

  refreshHalfButton();
  setTimeout(()=>enumerate().catch(()=>{}),0);
  setTimeout(()=>{
    if(document.hidden||State.cameraStatus==='active'||State.startPromise)return;
    Camera.start({silent:true}).catch(()=>{});
  },0);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>enumerate().catch(()=>{}),250)});
  document.documentElement.dataset.oneShotCameraPlatform=PLATFORM.name.toLowerCase();
  try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD)}catch(_){}
  return true;
}

let tries=0;
const timer=setInterval(()=>{tries++;if(patch()||tries>220)clearInterval(timer)},10);
window.ONE_V6626_CAMERA_CORE={BUILD,PLATFORM,patch,activateHalf,activateMain,candidate,refreshHalfButton};
})();
