/* ONE SHOT · COMPATIBILITY BOOTSTRAP · UPDATE + CAMERA STABILITY v6.6.13 */
(()=>{
'use strict';
const LEGACY_BUILD='oneshot-v6.4.3-data-edit-flow-fix-01';
const CURRENT_BUILD='oneshot-v6.6.13-update-camera-stability-01';
const ua=navigator.userAgent||'';
const isIOS=/iPhone|iPad|iPod/i.test(ua);
const standalone=(()=>{try{return window.matchMedia?.('(display-mode: standalone)').matches===true||window.matchMedia?.('(display-mode: fullscreen)').matches===true||navigator.standalone===true||document.referrer.startsWith('android-app://')}catch(_){return navigator.standalone===true}})();
try{
  if(standalone){localStorage.setItem('oneshotInstalledDetected','1');localStorage.setItem('oneshotInstallDismissed','1')}
  if(isIOS)localStorage.setItem('oneshotInstallDismissed','1');
  sessionStorage.setItem('oneshotBootBuild',CURRENT_BUILD);
}catch(_){}
const semver=v=>{const m=String(v||'').match(/(?:oneshot-)?v(\d+)\.(\d+)\.(\d+)/i);return m?[+m[1],+m[2],+m[3]]:null};
const cmp=(a,b)=>{const A=semver(a),B=semver(b);if(!A||!B)return 0;for(let i=0;i<3;i++)if(A[i]!==B[i])return A[i]>B[i]?1:-1;return 0};
const maxBuild=(...vals)=>vals.filter(Boolean).reduce((best,v)=>!best||cmp(v,best)>0?v:best,'');
const runtimeBuild=()=>{
  let best=CURRENT_BUILD;
  for(const get of [
    ()=>window.ONE_V6613_UPDATE_CAMERA_STABILITY?.BUILD,
    ()=>window.ONE_V6612_FIELD_FLOW_CLEANUP?.BUILD,
    ()=>window.ONE_V6611_CAMERA_FAST?.BUILD,
    ()=>window.ONE_V669_LOCAL_PARTIDARIO?.BUILD,
    ()=>window.ONE_V668_MOBILE_EDITOR_POLISH?.BUILD,
    ()=>window.ONE_V667_MOBILE_BATCH?.BUILD,
    ()=>window.ONE_V664_EDITOR_STABLE?.BUILD,
    ()=>window.ONE_V653_MOBILE_UX?.BUILD,
    ()=>window.ONE_V653_FIELD_FINDINGS?.BUILD,
    ()=>window.ONE_V652_DOMAIN?.BUILD,
    ()=>window.ONE_V652_MUNICIPAL?.BUILD,
    ()=>window.ONE_V651_ASSETS?.BUILD,
    ()=>window.ONE_V651_REPORTS_UI?.BUILD,
    ()=>window.ONE_V6416_EVIDENCE_RECOVERY?.BUILD,
    ()=>window.ONE_V6415_TERRITORY_OPS?.BUILD
  ]){try{const v=get();if(v&&cmp(v,best)>0)best=v}catch(_){}}
  return best;
};
const markCurrent=()=>{try{const runtime=runtimeBuild(),applied=localStorage.getItem('oneshotAppliedBuild')||'',current=maxBuild(CURRENT_BUILD,runtime,applied);localStorage.setItem('oneshotAppliedBuild',current);localStorage.setItem('oneshotRuntimeBuild',current);return current}catch(_){return CURRENT_BUILD}};
const isNative=()=>{try{return typeof APKBridge!=='undefined'&&APKBridge.isNative?.()===true}catch(_){return false}};

function patchManualUpdateButton(){
  const btn=document.getElementById('toolUpdateApp');
  const txt=document.getElementById('updateAppText');
  if(!btn||btn.dataset.oneUpdaterV669==='1')return;
  btn.dataset.oneUpdaterV669='1';
  if(txt)txt.textContent='Buscar nueva versión de ONE SHOT';
  btn.addEventListener('click',async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(!navigator.onLine){UI?.toast?.('Sin internet: no se puede actualizar');return;}
    if(!isNative()&&window.ONE_V6613_UPDATE_CAMERA_STABILITY?.checkUpdate)return window.ONE_V6613_UPDATE_CAMERA_STABILITY.checkUpdate();
    btn.classList.add('busy');if(txt)txt.textContent='Comprobando versión publicada…';
    try{
      const remote=await AppUpdater.feed(),current=markCurrent();
      if(!remote?.build||cmp(current,remote.build)>=0){if(txt)txt.textContent=`Ya tienes la última versión · ${remote?.version||current}`;UI?.toast?.(`✓ ONE SHOT ${remote?.version||''} está actualizado`,2400);return;}
      if(txt)txt.textContent='Nueva versión disponible';
      const accept=await AppUpdater.prompt(remote);if(!accept){if(txt)txt.textContent='Actualización disponible · pendiente';return;}
      localStorage.setItem('oneshotAppliedBuild',remote.build||current);localStorage.setItem('oneshotRuntimeBuild',remote.build||current);localStorage.removeItem('oneshotDismissedBuild');await AppUpdater.install(remote);
    }catch(err){if(txt)txt.textContent='No se pudo actualizar · toca para reintentar';UI?.toast?.(err?.message||String(err),3800)}finally{btn.classList.remove('busy')}
  },true);
}

function patchUpdater(){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    try{
      if(typeof AppUpdater==='undefined'||!AppUpdater?.check||!AppUpdater?.prompt||!AppUpdater?.install){if(tries<100)return;clearInterval(timer);return;}
      clearInterval(timer);AppUpdater.__updateLoopHotfix='v6.6.13';
      AppUpdater.feed=async()=>{const url=isNative()?`https://raw.githubusercontent.com/DiegoRod24/one-shot-2/main/version.json?t=${Date.now()}`:`version.json?t=${Date.now()}`;const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('No se pudo leer la versión publicada');return r.json();};
      if(!isNative()&&window.ONE_V6613_UPDATE_CAMERA_STABILITY?.applyUpdate){AppUpdater.refreshPwa=remote=>window.ONE_V6613_UPDATE_CAMERA_STABILITY.applyUpdate(remote);}
      AppUpdater.check=async(force=false)=>{
        if(!navigator.onLine)return UI.toast('Sin internet: no se puede buscar actualización');
        try{
          const remote=await AppUpdater.feed(),current=markCurrent(),dismissed=localStorage.getItem('oneshotDismissedBuild')||'';
          if(!remote?.build||remote.build===current||cmp(current,remote.build)>=0){localStorage.removeItem('oneshotDismissedBuild');const txt=document.getElementById('updateAppText');if(txt)txt.textContent=`Ya tienes la última versión · ${remote?.version||'ONE SHOT'}`;if(force)UI.toast(`✓ ONE SHOT ${remote?.version||''} está actualizado`);return;}
          if(remote.build===dismissed&&!force)return;
          if(!isNative()&&window.ONE_V6613_UPDATE_CAMERA_STABILITY?.checkUpdate)return window.ONE_V6613_UPDATE_CAMERA_STABILITY.checkUpdate();
          const accept=await AppUpdater.prompt(remote);if(!accept){localStorage.setItem('oneshotDismissedBuild',remote.build||'');return;}
          localStorage.setItem('oneshotAppliedBuild',remote.build||current);localStorage.setItem('oneshotRuntimeBuild',remote.build||current);localStorage.removeItem('oneshotDismissedBuild');await AppUpdater.install(remote);setTimeout(()=>{try{localStorage.setItem('oneshotAppliedBuild',remote.build||CURRENT_BUILD)}catch(_){}},250);
        }catch(e){UI.toast(e.message||String(e),3500)}
      };
      markCurrent();patchManualUpdateButton();setTimeout(patchManualUpdateButton,700);
    }catch(e){if(tries>=100)clearInterval(timer)}
  },40);
}
window.addEventListener('load',()=>setTimeout(patchUpdater,360),{once:true});if(document.readyState==='complete')setTimeout(patchUpdater,360);
window.ONE_SHOT_BOOT={BUILD:CURRENT_BUILD,LEGACY_BUILD,CURRENT_BUILD,isIOS,standalone};
})();
