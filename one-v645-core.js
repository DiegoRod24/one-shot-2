/* ONE SHOT v6.4.5 · VIDEO REGRESSION RESCUE */
(()=>{
'use strict';
if(window.ONE_V645_CORE)return;
const BUILD='oneshot-v6.4.5-video-regression-rescue-02';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let attempts=0,syncTimer=null;

/* 1 · EXCEL
   app.js heredó `candidato` sin declarar en CLASIFICACION_COMPATIBLE.
   Dejamos un valor neutro para que el libro se construya; la capa 6.4.3
   reemplaza luego esa columna con el alcalde/encargado municipal real. */
function patchExcelCrash(){
  try{if(!('candidato' in window))window.candidato='';}catch(_){}
  if(typeof Reports==='undefined'||!Reports.makeExcel||Reports.__v645ExcelGuard)return;
  Reports.__v645ExcelGuard=true;
  const previous=Reports.makeExcel.bind(Reports);
  Reports.makeExcel=async(...args)=>{
    try{
      if(!('candidato' in window))window.candidato='';
      return await previous(...args);
    }catch(e){
      console.error('[ONE SHOT v6.4.5] Excel',e);
      try{UI.toast(`No pude preparar el Excel · ${String(e?.message||e)}`,5200,{placement:'top',tone:'soft'});}catch(_){}
      throw e;
    }
  };
}

/* 2 · ORIENTACIÓN
   No cambiamos el flujo de Cámara. Solo corregimos la decisión automática
   cuando el equipo no entrega sensores de orientación (laptop/PWA). */
function patchCaptureOrientation(){
  if(typeof Sensors==='undefined'||!Sensors.captureOrientation||Sensors.__v645Orientation)return;
  Sensors.__v645Orientation=true;
  Sensors.captureOrientation=()=>{
    const mode=State.settings.orientationMode||'auto';
    let key='portrait';
    if(mode==='portrait')key='portrait';
    else if(mode==='landscape-left')key='landscape-left';
    else if(mode==='landscape-right')key='landscape-right';
    else{
      const b=Number(State.beta),g=Number(State.gamma),hasSensor=Number.isFinite(b)&&Number.isFinite(g);
      const sensed=hasSensor?Sensors.orientationFromSensors?.():null;
      key=sensed||(innerWidth>=innerHeight?'landscape-right':'portrait');
    }
    State.smartOrientation=key;
    State.orientationSide=key==='landscape-left'?'left':'right';
    State.captureOrientationLocked=true;
    State.captureOrientationKey=key;
    try{Sensors.applyStageOrientation?.(false);Sensors.paintOrientationChip?.();}catch(_){}
    return key;
  };
}
async function rotateDataUrl(dataUrl,degrees){
  const img=await Watermark.load(dataUrl),rot=((Number(degrees)||0)%360+360)%360;
  if(!rot)return dataUrl;
  const w=img.naturalWidth,h=img.naturalHeight,c=document.createElement('canvas'),ctx=c.getContext('2d',{alpha:false});
  if(rot===90||rot===270){c.width=h;c.height=w}else{c.width=w;c.height=h}
  ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);ctx.save();ctx.translate(c.width/2,c.height/2);ctx.rotate(rot*Math.PI/180);ctx.drawImage(img,-w/2,-h/2);ctx.restore();
  return c.toDataURL('image/jpeg',.94);
}
function suspectLandscapeRotation(r){
  return !!r?.image&&!r?.rescuedImage&&!r?.v645OrientationRepaired&&
    Number(r.sourceFrameWidth||0)>Number(r.sourceFrameHeight||0)&&
    N(r.captureOrientationKey)==='PORTRAIT'&&N(r.deviceOrientation)==='LANDSCAPE'&&
    Math.abs(Number(r.captureRotationApplied||0))===90;
}
async function repairStoredOrientation(){
  if(typeof State==='undefined'||typeof Watermark==='undefined'||typeof Evidence==='undefined'||typeof Store==='undefined'||!State.records?.length)return;
  const bad=State.records.filter(suspectLandscapeRotation);if(!bad.length)return;
  let fixed=0;
  for(const r of bad){
    try{
      const applied=Number(r.captureRotationApplied||0),inverse=applied>0?-90:90;
      const corrected=await rotateDataUrl(r.image,inverse);
      r.rescuedImage=corrected;
      r.rescueDerivedHash=await Evidence.imageHash(corrected);
      r.rescueHistory=Array.isArray(r.rescueHistory)?r.rescueHistory:[];
      r.rescueHistory.push({at:new Date().toISOString(),action:'AUTO_ORIENTATION_V645',rotation:inverse,reason:'Landscape preview captured as portrait'});
      r.v645OrientationRepaired={at:new Date().toISOString(),originalRotationApplied:applied,inverseApplied:inverse};
      r.stampedImage=await Watermark.stamp(corrected,r);r.stampedHash=await Evidence.imageHash(r.stampedImage);
      await Store.save(r);fixed++;
    }catch(e){console.warn('ONE SHOT orientación',r?.photoCode,e)}
    await wait(12);
  }
  if(fixed){try{Reports.invalidate?.();Gallery.render?.();if(State.records[0])Gallery.updateLastShot?.(State.records[0]);UI.toast(`✓ ${fixed} foto${fixed===1?'':'s'} recuperada${fixed===1?'':'s'} de orientación`,3200,{placement:'top',tone:'soft'})}catch(_){}}
}

/* 3 · FER
   v6.4.5 usa únicamente fer-v640 como motor visual. Aquí solo evitamos
   que el FAB aparezca encima de otro Fer contextual y terminamos de
   sustituir textos heredados ONE → Fer. */
function contextualFerVisible(){
  const open=id=>document.getElementById(id)?.classList.contains('open');
  const reports=document.getElementById('viewReports')?.classList.contains('active');
  return open('editModal')||open('relationModal')||open('oneAssistantModal')||open('reportPreviewModal')||open('bulkModal')||reports||State.selectionMode===true;
}
function syncFer(){
  try{window.FER_V640?.mountAll?.();window.FER_V640?.helpCopy?.();window.FER_V640?.context?.()}catch(_){}
  const fab=document.getElementById('oneAssistantFab');if(fab)fab.style.setProperty('display',contextualFerVisible()?'none':'','important');
  const ids=['guidedHeard','guidedRecognitionNote','assistantLiveInsight','assistantContextLabel','editAssistantNameTitle','guidedAssistantName','editMiniAssistantName','oneAssistantFabName'];
  ids.forEach(id=>{const e=document.getElementById(id);if(e&&/\bONE\b/.test(e.textContent||''))e.textContent=e.textContent.replace(/\bONE\b/g,'Fer')});
  document.querySelectorAll('#oneAssistantModal small,#oneAssistantModal p,#oneAssistantModal span,#editModal small,#editModal p').forEach(e=>{if(e.children.length===0&&/\bONE\b/.test(e.textContent||''))e.textContent=e.textContent.replace(/\bONE\b/g,'Fer')});
}
function patchFerCss(){
  if(document.getElementById('v645FerCss'))return;
  const s=document.createElement('style');s.id='v645FerCss';s.textContent=`
  html.v645Rescue #guidedRobot .ferAvatar{width:96px!important;height:106px!important;min-width:96px!important;min-height:106px!important}
  html.v645Rescue .reportOneMascot .ferAvatar{width:82px!important;height:91px!important;min-width:82px!important;min-height:91px!important}
  html.v645Rescue .editMiniAssistant .ferAvatar{width:70px!important;height:78px!important;min-width:70px!important;min-height:78px!important}
  html.v645Rescue #oneAssistantFab.ferFab{width:82px!important;height:60px!important}
  html.v645Rescue #guidedRobot{overflow:visible!important}
  `;document.head.appendChild(s);document.documentElement.classList.add('v645Rescue');
}

/* 4 · LOGOS
   Mismo selector de partidos. El sprite se muestra como imagen recortada
   para evitar los cuadros blancos vistos en el video. */
function logoIndex(name){const x=(window.ONE_PARTY_CATALOG_V631||[]).find(p=>N(p.name)===N(name));return Number.isInteger(x?.i)?x.i:null}
function paintPartyLogos(){
  document.querySelectorAll('#guidedChoices button[data-guided-label] .v643PartyLogo').forEach(box=>{
    const btn=box.closest('button[data-guided-label]'),idx=logoIndex(btn?.dataset.guidedLabel);if(idx==null)return;
    box.dataset.initials=String(btn.dataset.guidedLabel||'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('');
    if(box.querySelector('.v645PartySprite'))return;
    const col=idx%10,row=Math.floor(idx/10),img=document.createElement('img');img.className='v645PartySprite';img.alt='';img.src='party-logos-v631.webp?v=645';img.style.left=`-${col*64}px`;img.style.top=`-${row*64}px`;img.onerror=()=>box.classList.add('v645LogoError');box.appendChild(img);
  });
}
function patchLogoCss(){
  if(document.getElementById('v645LogoCss'))return;
  const s=document.createElement('style');s.id='v645LogoCss';s.textContent=`
  .v643PartyLogo{position:relative!important;overflow:hidden!important;background-image:none!important;background:#fff!important}
  .v643PartyLogo .v645PartySprite{position:absolute!important;width:640px!important;height:512px!important;max-width:none!important;max-height:none!important;display:block!important;pointer-events:none!important}
  .v643PartyLogo.v645LogoError:after{content:attr(data-initials);position:absolute;inset:0;display:grid;place-items:center;background:#edf4ff;color:#173b66;font-size:17px;font-weight:900}
  `;document.head.appendChild(s);
}

/* 5 · SELECCIÓN
   Mismos controles; solo evita que la barra flote sobre navegación/Fer. */
function patchSelectionCss(){
  if(document.getElementById('v645SelectionCss'))return;
  const s=document.createElement('style');s.id='v645SelectionCss';s.textContent=`
  #selectionBar.open{left:12px!important;right:12px!important;bottom:76px!important;width:auto!important;border-radius:18px!important;overflow:hidden!important;box-shadow:0 12px 32px rgba(4,22,55,.28)!important}
  @media(max-width:700px){#selectionBar.open{left:7px!important;right:7px!important;bottom:72px!important}}
  `;document.head.appendChild(s);
}

function syncDynamic(){clearTimeout(syncTimer);syncTimer=setTimeout(()=>{syncFer();paintPartyLogos()},90)}
function observeUi(){
  const root=document.querySelector('.appShell')||document.body;
  new MutationObserver(syncDynamic).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-state']});
  document.addEventListener('click',()=>setTimeout(syncDynamic,50),true);
}
async function start(){
  if(window.__ONE_V645_STARTED)return;
  if(typeof State==='undefined'||typeof Sensors==='undefined'||typeof Reports==='undefined'||typeof Gallery==='undefined'||typeof Watermark==='undefined'||typeof Evidence==='undefined'||typeof Store==='undefined'){
    if(attempts++<50)setTimeout(start,180);return;
  }
  window.__ONE_V645_STARTED=true;
  patchExcelCrash();patchCaptureOrientation();patchFerCss();patchLogoCss();patchSelectionCss();syncFer();paintPartyLogos();observeUi();
  try{State.settings.assistantName='Fer';Store.saveLite?.();localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD)}catch(_){}
  document.title='ONE SHOT v6.4.5 · RESCATE DE VIDEO';
  setTimeout(repairStoredOrientation,750);
}
window.ONE_V645_CORE={BUILD,start,repairStoredOrientation,patchCaptureOrientation,patchExcelCrash};
window.addEventListener('load',()=>setTimeout(start,220),{once:true});
if(document.readyState==='complete')setTimeout(start,220);
})();