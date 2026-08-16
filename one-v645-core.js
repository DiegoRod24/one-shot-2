/* ONE SHOT v6.4.5 · VIDEO REGRESSION RESCUE */
(()=>{
'use strict';
if(window.ONE_V645_CORE)return;
const BUILD='oneshot-v6.4.5-video-regression-rescue-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let attempts=0;

/* ------------------------------------------------------------------
   1. EXCEL: app.js tiene un identificador heredado "candidato"
   sin declarar dentro de CLASIFICACION_COMPATIBLE. Evitamos que
   rompa la generación; v6.4.3 ya reemplaza después esa columna por
   alcalde/encargado del directorio municipal.
------------------------------------------------------------------- */
function patchExcelCrash(){
  try{if(!('candidato' in window))window.candidato='';}catch(_){}
  if(!window.Reports?.makeExcel||Reports.__v645ExcelGuard)return;
  Reports.__v645ExcelGuard=true;
  const previous=Reports.makeExcel.bind(Reports);
  Reports.makeExcel=async(...args)=>{
    try{
      if(!('candidato' in window))window.candidato='';
      const file=await previous(...args);
      return file;
    }catch(e){
      console.error('[ONE SHOT v6.4.5] Excel',e);
      const msg=String(e?.message||e||'Error desconocido');
      try{UI.toast(`No pude preparar el Excel · ${msg}`,5200,{placement:'top',tone:'soft'});}catch(_){}
      throw e;
    }
  };
}

/* ------------------------------------------------------------------
   2. ORIENTACION: en pantallas sin sensores (p.ej. laptop/PWA) el
   estado smartOrientation podía quedarse en portrait aunque el
   preview estuviera horizontal. Conservamos la Cámara y solo
   corregimos la decisión de orientación en el instante de captura.
------------------------------------------------------------------- */
function patchCaptureOrientation(){
  if(!window.Sensors?.captureOrientation||Sensors.__v645Orientation)return;
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
      if(sensed)key=sensed;
      else key=window.innerWidth>=window.innerHeight?'landscape-right':'portrait';
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
  if(!dataUrl)return'';
  const img=await Watermark.load(dataUrl),rot=((Number(degrees)||0)%360+360)%360;
  if(!rot)return dataUrl;
  const c=document.createElement('canvas'),ctx=c.getContext('2d',{alpha:false}),w=img.naturalWidth,h=img.naturalHeight;
  if(rot===90||rot===270){c.width=h;c.height=w;}else{c.width=w;c.height=h;}
  ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);ctx.save();ctx.translate(c.width/2,c.height/2);ctx.rotate(rot*Math.PI/180);ctx.drawImage(img,-w/2,-h/2);ctx.restore();
  return c.toDataURL('image/jpeg',.94);
}
function suspectLandscapeRotation(r){
  const sourceLandscape=Number(r?.sourceFrameWidth||0)>Number(r?.sourceFrameHeight||0);
  const capturePortrait=N(r?.captureOrientationKey)==='PORTRAIT';
  const deviceLandscape=N(r?.deviceOrientation)==='LANDSCAPE';
  const applied=Math.abs(Number(r?.captureRotationApplied||0))===90;
  return !!r?.image&&!r?.v645OrientationRepaired&&!r?.rescuedImage&&sourceLandscape&&capturePortrait&&deviceLandscape&&applied;
}
async function repairStoredOrientation(){
  if(!window.State?.records?.length||!window.Watermark||!window.Evidence||!window.Store)return;
  const bad=State.records.filter(suspectLandscapeRotation);
  if(!bad.length)return;
  let fixed=0;
  for(const r of bad){
    try{
      const applied=Number(r.captureRotationApplied||0),inverse=applied>0?-90:90;
      const corrected=await rotateDataUrl(r.image,inverse);
      if(!corrected)continue;
      r.rescuedImage=corrected;
      r.rescueDerivedHash=await Evidence.imageHash(corrected);
      r.rescueHistory=Array.isArray(r.rescueHistory)?r.rescueHistory:[];
      r.rescueHistory.push({at:new Date().toISOString(),action:'AUTO_ORIENTATION_V645',rotation:inverse,reason:'Landscape preview captured as portrait'});
      r.v645OrientationRepaired={at:new Date().toISOString(),originalRotationApplied:applied,inverseApplied:inverse};
      r.stampedImage=await Watermark.stamp(corrected,r);
      r.stampedHash=await Evidence.imageHash(r.stampedImage);
      r.photoOrientationDerived='Horizontal';
      await Store.save(r);fixed++;
    }catch(e){console.warn('[ONE SHOT v6.4.5] no pude reparar orientación',r?.photoCode,e);}
    await sleep(10);
  }
  if(fixed){
    try{Reports.invalidate?.();Gallery.render?.();if(State.records[0])Gallery.updateLastShot?.(State.records[0]);UI.toast(`✓ ${fixed} foto${fixed===1?'':'s'} recuperada${fixed===1?'':'s'} de orientación`,3200,{placement:'top',tone:'soft'});}catch(_){}
  }
}

/* ------------------------------------------------------------------
   3. FER: había dos motores visuales compitiendo (v640 y v642), por
   eso aparecían dos Fers y con estilos distintos. No cambiamos sus
   lugares funcionales: unificamos el avatar y ocultamos el FAB cuando
   ya existe un Fer contextual en la pantalla/modal actual.
------------------------------------------------------------------- */
const FER_HTML='<div class="ferGlow"></div><div class="ferBun"></div><div class="ferHair"></div><div class="ferHead"><span class="ferEar left"></span><span class="ferEar right"></span><i class="ferBrow left"></i><i class="ferBrow right"></i><i class="ferEye left"></i><i class="ferEye right"></i><span class="ferNose"></span><span class="ferBeard"></span><span class="ferMouth"></span></div><div class="ferNeck"></div><div class="ferTorso"><span class="ferShirt"></span><span class="ferLanyard"></span><span class="ferBadge">OS</span></div><span class="ferArm left"><i class="ferHand"></i></span><span class="ferArm right"><i class="ferHand"></i></span><span class="ferStateDot"></span>';
function restoreHumanFer(){
  document.querySelectorAll('.ferAvatar').forEach(a=>{
    if(a.dataset.v645Human==='1')return;
    /* fer-v641 no vuelve a reemplazar el contenido cuando fer642=1 */
    a.dataset.fer642='1';a.dataset.v645Human='1';a.innerHTML=FER_HTML;
  });
}
function replaceOneCopy(){
  const ids=['guidedHeard','guidedRecognitionNote','assistantLiveInsight','assistantContextLabel'];
  for(const id of ids){const e=document.getElementById(id);if(e&&/\bONE\b/.test(e.textContent||''))e.textContent=e.textContent.replace(/\bONE\b/g,'Fer');}
  document.querySelectorAll('#oneAssistantModal small,#oneAssistantModal p,#oneAssistantModal span,#editModal small,#editModal p').forEach(e=>{if(e.children.length===0&&/\bONE\b/.test(e.textContent||''))e.textContent=e.textContent.replace(/\bONE\b/g,'Fer');});
}
function contextualFerVisible(){
  const open=id=>document.getElementById(id)?.classList.contains('open');
  const reports=document.getElementById('viewReports')?.classList.contains('active');
  return open('editModal')||open('relationModal')||open('oneAssistantModal')||open('reportPreviewModal')||open('bulkModal')||reports||State?.selectionMode===true;
}
function syncFerFab(){const fab=document.getElementById('oneAssistantFab');if(fab)fab.style.setProperty('display',contextualFerVisible()?'none':'','important');}
function patchFer(){
  if(!document.getElementById('v645FerCss')){
    const s=document.createElement('style');s.id='v645FerCss';s.textContent=`
    html.v645Rescue .ferAvatar{background:transparent!important;overflow:visible!important;filter:drop-shadow(0 8px 13px rgba(2,16,38,.22))!important}
    html.v645Rescue .ferAvatar .ferSvg{display:none!important}
    html.v645Rescue #guidedRobot .ferAvatar{width:92px!important;height:102px!important;min-width:92px!important;min-height:102px!important;margin:-8px 0 -6px -5px!important}
    html.v645Rescue .reportOneMascot .ferAvatar{width:84px!important;height:93px!important;min-width:84px!important;min-height:93px!important}
    html.v645Rescue .editMiniAssistant .ferAvatar{width:70px!important;height:78px!important;min-width:70px!important;min-height:78px!important}
    html.v645Rescue #oneAssistantFab.ferFab{width:82px!important;height:60px!important;grid-template-columns:48px 1fr!important}
    html.v645Rescue #oneAssistantFab.ferFab .ferAvatar{width:48px!important;height:53px!important;min-width:48px!important;min-height:53px!important}
    html.v645Rescue #guidedRobot{overflow:visible!important}
    `;document.head.appendChild(s);document.documentElement.classList.add('v645Rescue');
  }
  restoreHumanFer();replaceOneCopy();syncFerFab();
}

/* ------------------------------------------------------------------
   4. LOGOS: el selector mostraba 75 cuadros blancos. Conservamos el
   catálogo y el mismo selector; renderizamos el sprite mediante IMG
   recortado, con cache-bust, en lugar de depender solo de background.
------------------------------------------------------------------- */
function logoIndex(name){const x=(window.ONE_PARTY_CATALOG_V631||[]).find(p=>N(p.name)===N(name));return Number.isInteger(x?.i)?x.i:null;}
function paintPartyLogos(){
  document.querySelectorAll('#guidedChoices button[data-guided-label] .v643PartyLogo').forEach(box=>{
    const btn=box.closest('button[data-guided-label]'),idx=logoIndex(btn?.dataset.guidedLabel);if(idx==null)return;
    box.dataset.initials=String(btn.dataset.guidedLabel||'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('');
    if(box.querySelector('.v645PartySprite'))return;
    const c=idx%10,r=Math.floor(idx/10),img=document.createElement('img');img.className='v645PartySprite';img.alt='';img.src='party-logos-v631.webp?v=645';img.style.left=`-${c*64}px`;img.style.top=`-${r*64}px`;img.onerror=()=>box.classList.add('v645LogoError');box.appendChild(img);
  });
}
function patchLogos(){
  if(!document.getElementById('v645LogoCss')){
    const s=document.createElement('style');s.id='v645LogoCss';s.textContent=`
    .v643PartyLogo{position:relative!important;overflow:hidden!important;background-image:none!important;background:#fff!important}
    .v643PartyLogo .v645PartySprite{position:absolute!important;width:640px!important;height:512px!important;max-width:none!important;max-height:none!important;display:block!important;pointer-events:none!important}
    .v643PartyLogo.v645LogoError:after{content:attr(data-initials);position:absolute;inset:0;display:grid;place-items:center;color:#173b66;font-weight:900;font-size:17px;background:#edf4ff}
    `;document.head.appendChild(s);
  }
  paintPartyLogos();
}

/* ------------------------------------------------------------------
   5. SELECCION: la barra tapaba Fer y navegación. No cambiamos los
   botones; solo la elevamos sobre la barra inferior y ocultamos Fer
   mientras está activa.
------------------------------------------------------------------- */
function patchSelectionLayout(){
  if(document.getElementById('v645SelectionCss'))return;
  const s=document.createElement('style');s.id='v645SelectionCss';s.textContent=`
  #selectionBar.open{left:12px!important;right:12px!important;bottom:76px!important;width:auto!important;border-radius:18px!important;overflow:hidden!important;box-shadow:0 12px 32px rgba(4,22,55,.28)!important}
  @media(max-width:700px){#selectionBar.open{left:7px!important;right:7px!important;bottom:72px!important}}
  `;document.head.appendChild(s);
}

/* Re-sincroniza UI dinámica sin MutationObserver agresivo. */
let syncTimer=null;
function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(()=>{patchFer();patchLogos();patchSelectionLayout();},80);}
function observeUi(){
  const root=document.querySelector('.appShell')||document.body;
  const mo=new MutationObserver(scheduleSync);mo.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-state']});
  document.addEventListener('click',()=>setTimeout(()=>{syncFerFab();paintPartyLogos();replaceOneCopy();},60),true);
}

async function start(){
  if(window.__ONE_V645_STARTED)return;
  if(typeof State==='undefined'||typeof Sensors==='undefined'||typeof Reports==='undefined'||typeof Gallery==='undefined'||typeof Watermark==='undefined'||typeof Evidence==='undefined'){if(attempts++<40)setTimeout(start,180);return;}
  window.__ONE_V645_STARTED=true;
  patchExcelCrash();patchCaptureOrientation();patchFer();patchLogos();patchSelectionLayout();observeUi();
  try{State.settings.assistantName='Fer';Store.saveLite?.();localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}
  document.title='ONE SHOT v6.4.5 · RESCATE DE VIDEO';
  setTimeout(()=>repairStoredOrientation(),700);
  setTimeout(scheduleSync,1000);
}
window.ONE_V645_CORE={BUILD,start,repairStoredOrientation,patchCaptureOrientation,patchExcelCrash};
window.addEventListener('load',()=>setTimeout(start,220),{once:true});
if(document.readyState==='complete')setTimeout(start,220);
})();