/* ONE SHOT v6.4.5 · VIDEO REGRESSION RESCUE · COMPAT */
(()=>{
'use strict';
if(window.ONE_V645_CORE)return;
const BUILD='oneshot-v6.4.5-video-regression-rescue-02';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let attempts=0,syncTimer=null;

/* ORIENTACIÓN: conserva Cámara y corrige únicamente la decisión de captura
   cuando el navegador no entrega sensores suficientes. */
function patchCaptureOrientation(){
  if(typeof Sensors==='undefined'||!Sensors.captureOrientation||Sensors.__v645Orientation)return;
  Sensors.__v645Orientation=true;
  Sensors.captureOrientation=()=>{
    const mode=State.settings.orientationMode||'auto';let key='portrait';
    if(mode==='portrait')key='portrait';else if(mode==='landscape-left')key='landscape-left';else if(mode==='landscape-right')key='landscape-right';else{
      const b=Number(State.beta),g=Number(State.gamma),hasSensor=Number.isFinite(b)&&Number.isFinite(g),sensed=hasSensor?Sensors.orientationFromSensors?.():null;
      const screenAngle=Number(screen.orientation?.angle??window.orientation??0),screenLandscape=Math.abs(screenAngle)===90,video=document.getElementById('video'),videoLandscape=Number(video?.videoWidth||0)>Number(video?.videoHeight||0),viewportLandscape=innerWidth>=innerHeight;
      key=sensed||(screenLandscape?(screenAngle<0?'landscape-left':'landscape-right'):(viewportLandscape||videoLandscape?'landscape-right':'portrait'));
    }
    State.smartOrientation=key;State.orientationSide=key==='landscape-left'?'left':'right';State.captureOrientationLocked=true;State.captureOrientationKey=key;
    try{Sensors.applyStageOrientation?.(false);Sensors.paintOrientationChip?.();}catch(_){}return key;
  };
}
async function rotateDataUrl(dataUrl,degrees){const img=await Watermark.load(dataUrl),rot=((Number(degrees)||0)%360+360)%360;if(!rot)return dataUrl;const w=img.naturalWidth,h=img.naturalHeight,c=document.createElement('canvas'),ctx=c.getContext('2d',{alpha:false});if(rot===90||rot===270){c.width=h;c.height=w}else{c.width=w;c.height=h}ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);ctx.save();ctx.translate(c.width/2,c.height/2);ctx.rotate(rot*Math.PI/180);ctx.drawImage(img,-w/2,-h/2);ctx.restore();return c.toDataURL('image/jpeg',.94);}
function suspectLandscapeRotation(r){return !!r?.image&&!r?.rescuedImage&&!r?.v645OrientationRepaired&&Number(r.sourceFrameWidth||0)>Number(r.sourceFrameHeight||0)&&N(r.captureOrientationKey)==='PORTRAIT'&&N(r.deviceOrientation)==='LANDSCAPE'&&Math.abs(Number(r.captureRotationApplied||0))===90;}
async function repairStoredOrientation(){
  if(typeof State==='undefined'||typeof Watermark==='undefined'||typeof Evidence==='undefined'||typeof Store==='undefined'||!State.records?.length)return;const bad=State.records.filter(suspectLandscapeRotation);if(!bad.length)return;let fixed=0;
  for(const r of bad){try{const applied=Number(r.captureRotationApplied||0),inverse=applied>0?-90:90,corrected=await rotateDataUrl(r.image,inverse);r.rescuedImage=corrected;r.rescueDerivedHash=await Evidence.imageHash(corrected);r.rescueHistory=Array.isArray(r.rescueHistory)?r.rescueHistory:[];r.rescueHistory.push({at:new Date().toISOString(),action:'AUTO_ORIENTATION_V645',rotation:inverse,reason:'Landscape preview captured as portrait'});r.v645OrientationRepaired={at:new Date().toISOString(),originalRotationApplied:applied,inverseApplied:inverse};r.stampedImage=await Watermark.stamp(corrected,r);r.stampedHash=await Evidence.imageHash(r.stampedImage);await Store.save(r);fixed++;}catch(e){console.warn('ONE SHOT orientación',r?.photoCode,e)}await wait(12);}
  if(fixed){try{Reports.invalidate?.();Gallery.render?.();if(State.records[0])Gallery.updateLastShot?.(State.records[0]);UI.toast(`✓ ${fixed} foto${fixed===1?'':'s'} recuperada${fixed===1?'':'s'} de orientación`,3200,{placement:'top',tone:'soft'})}catch(_){}}
}

/* LOGOS: mismo selector existente, sprite local y fallback con iniciales. */
function logoIndex(name){const x=(window.ONE_PARTY_CATALOG_V631||[]).find(p=>N(p.name)===N(name));return Number.isInteger(x?.i)?x.i:null}
function paintPartyLogos(){document.querySelectorAll('#guidedChoices button[data-guided-label] .v643PartyLogo').forEach(box=>{const btn=box.closest('button[data-guided-label]'),idx=logoIndex(btn?.dataset.guidedLabel);if(idx==null)return;box.dataset.initials=String(btn.dataset.guidedLabel||'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('');if(box.querySelector('.v645PartySprite'))return;const col=idx%10,row=Math.floor(idx/10),img=document.createElement('img');img.className='v645PartySprite';img.alt='';img.src='party-logos-v631.webp?v=646';img.style.left=`-${col*64}px`;img.style.top=`-${row*64}px`;img.onerror=()=>box.classList.add('v645LogoError');box.appendChild(img);});}
function patchLogoCss(){if(document.getElementById('v645LogoCss'))return;const s=document.createElement('style');s.id='v645LogoCss';s.textContent=`.v643PartyLogo{position:relative!important;overflow:hidden!important;background-image:none!important;background:#fff!important}.v643PartyLogo .v645PartySprite{position:absolute!important;width:640px!important;height:512px!important;max-width:none!important;max-height:none!important;display:block!important;pointer-events:none!important}.v643PartyLogo.v645LogoError:after{content:attr(data-initials);position:absolute;inset:0;display:grid;place-items:center;background:#edf4ff;color:#173b66;font-size:17px;font-weight:900}`;document.head.appendChild(s);}

/* SELECCIÓN: no cambia botones, solo evita superposición. */
function patchSelectionCss(){if(document.getElementById('v645SelectionCss'))return;const s=document.createElement('style');s.id='v645SelectionCss';s.textContent=`#selectionBar.open{left:12px!important;right:12px!important;bottom:76px!important;width:auto!important;border-radius:18px!important;overflow:hidden!important;box-shadow:0 12px 32px rgba(4,22,55,.28)!important}@media(max-width:700px){#selectionBar.open{left:7px!important;right:7px!important;bottom:72px!important}}`;document.head.appendChild(s);}
function syncDynamic(){clearTimeout(syncTimer);syncTimer=setTimeout(paintPartyLogos,80)}
function observeUi(){if(window.__ONE_V645_TARGET_OBS)return;window.__ONE_V645_TARGET_OBS=true;const nodes=['guidedEditor','guidedChoices','selectionBar'].map(id=>document.getElementById(id)).filter(Boolean);if(nodes.length&&window.MutationObserver){const mo=new MutationObserver(syncDynamic);nodes.forEach(n=>mo.observe(n,{subtree:true,childList:true,attributes:true,attributeFilter:['class']}));}document.addEventListener('click',()=>setTimeout(syncDynamic,50),true);}
async function start(){
  if(window.__ONE_V645_STARTED)return;if(typeof State==='undefined'||typeof Sensors==='undefined'||typeof Gallery==='undefined'||typeof Watermark==='undefined'||typeof Evidence==='undefined'||typeof Store==='undefined'){if(attempts++<50)setTimeout(start,180);return;}
  window.__ONE_V645_STARTED=true;patchCaptureOrientation();patchLogoCss();patchSelectionCss();paintPartyLogos();observeUi();
  try{State.settings.assistantName='Fer';Store.saveLite?.();}catch(_){}setTimeout(repairStoredOrientation,750);
}
window.ONE_V645_CORE={BUILD,start,repairStoredOrientation,patchCaptureOrientation};window.addEventListener('load',()=>setTimeout(start,220),{once:true});if(document.readyState==='complete')setTimeout(start,220);
})();