/* ONE SHOT · COMPATIBILITY BOOTSTRAP · UPDATE LOOP HOTFIX */
(()=>{
'use strict';
const LEGACY_BUILD='oneshot-v6.4.3-data-edit-flow-fix-01';
const CURRENT_BUILD='oneshot-v6.4.5-video-regression-rescue-02';
const ua=navigator.userAgent||'';
const isIOS=/iPhone|iPad|iPod/i.test(ua);
const standalone=(()=>{try{return window.matchMedia?.('(display-mode: standalone)').matches===true||window.matchMedia?.('(display-mode: fullscreen)').matches===true||navigator.standalone===true||document.referrer.startsWith('android-app://')}catch(_){return navigator.standalone===true}})();

/* Este bootstrap ya NO debe cambiar la versión aplicada ni borrar la decisión
   "Ahora no". Esas claves pertenecen al actualizador de la versión vigente. */
try{
  if(standalone){localStorage.setItem('oneshotInstalledDetected','1');localStorage.setItem('oneshotInstallDismissed','1')}
  if(isIOS)localStorage.setItem('oneshotInstallDismissed','1');
  sessionStorage.setItem('oneshotBootBuild',LEGACY_BUILD);
}catch(_){}

const semver=v=>{const m=String(v||'').match(/(?:oneshot-)?v(\d+)\.(\d+)\.(\d+)/i);return m?[Number(m[1]),Number(m[2]),Number(m[3])]:null};
const cmp=(a,b)=>{const A=semver(a),B=semver(b);if(!A||!B)return 0;for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]>B[i]?1:-1}return 0};
const runtimeBuild=()=>{
  try{if(typeof ONE_V645_CORE!=='undefined'&&ONE_V645_CORE?.BUILD)return ONE_V645_CORE.BUILD}catch(_){}
  try{if(window.ONE_V645_CORE?.BUILD)return window.ONE_V645_CORE.BUILD}catch(_){}
  try{const r=localStorage.getItem('oneshotRuntimeBuild');if(r&&cmp(r,LEGACY_BUILD)>0)return r}catch(_){}
  return CURRENT_BUILD;
};
const markCurrent=()=>{
  try{
    const runtime=runtimeBuild(),applied=localStorage.getItem('oneshotAppliedBuild')||'';
    if(!applied||cmp(runtime,applied)>=0)localStorage.setItem('oneshotAppliedBuild',runtime);
    localStorage.setItem('oneshotRuntimeBuild',runtime);
    return runtime;
  }catch(_){return runtimeBuild()}
};
const isNative=()=>{try{return typeof APKBridge!=='undefined'&&APKBridge.isNative?.()===true}catch(_){return false}};

function patchUpdater(){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    try{
      if(typeof AppUpdater==='undefined'||!AppUpdater?.check||!AppUpdater?.prompt||!AppUpdater?.install){if(tries<80)return;clearInterval(timer);return}
      clearInterval(timer);
      if(AppUpdater.__updateLoopHotfix)return;
      AppUpdater.__updateLoopHotfix=true;

      AppUpdater.feed=async()=>{
        const url=isNative()?`https://raw.githubusercontent.com/DiegoRod24/one-shot-2/main/version.json?t=${Date.now()}`:`version.json?t=${Date.now()}`;
        const r=await fetch(url,{cache:'no-store'});
        if(!r.ok)throw new Error('No se pudo leer la versión publicada');
        return r.json();
      };

      AppUpdater.check=async(force=false)=>{
        if(!navigator.onLine)return UI.toast('Sin internet: no se puede buscar actualización');
        const btn=document.getElementById('toolUpdateApp'),txt=document.getElementById('updateAppText');
        btn?.classList.add('busy');if(txt)txt.textContent='Buscando versión nueva…';
        try{
          const remote=await AppUpdater.feed();
          const current=markCurrent();
          const applied=localStorage.getItem('oneshotAppliedBuild')||'';
          const dismissed=localStorage.getItem('oneshotDismissedBuild')||'';
          const same=remote.build===current||remote.build===applied||cmp(current,remote.build)>=0;

          if(same){
            document.getElementById('updateModal')?.classList.remove('open');
            if(txt)txt.textContent=`Actualizado · ${remote.version||current}`;
            if(force)UI.toast(`ONE SHOT ${remote.version||''} está actualizado`.trim());
            return;
          }
          if(remote.build===dismissed&&!force){
            if(txt)txt.textContent=`Disponible · ${remote.version||remote.build}`;
            return;
          }

          const accept=await AppUpdater.prompt(remote);
          if(!accept){
            localStorage.setItem('oneshotDismissedBuild',remote.build||'');
            if(txt)txt.textContent='Actualización disponible · pospuesta';
            return;
          }
          localStorage.setItem('oneshotAppliedBuild',remote.build||current);
          localStorage.setItem('oneshotRuntimeBuild',remote.build||current);
          localStorage.removeItem('oneshotDismissedBuild');
          await AppUpdater.install(remote);
        }catch(e){
          if(txt)txt.textContent='No se pudo comprobar actualización';
          UI.toast(e.message||String(e),3500);
        }finally{btn?.classList.remove('busy')}
      };

      const current=markCurrent();
      const txt=document.getElementById('updateAppText');
      if(txt)txt.textContent=`Actualizado · ${current.replace(/^oneshot-/,'')}`;
    }catch(e){
      console.warn('ONE SHOT updater hotfix',e);
      if(tries>=80)clearInterval(timer);
    }
  },40);
}

/* Esperamos a que app.js y los módulos 6.4.5 terminen de iniciar antes de
   parchear el actualizador; su comprobación automática ocurre después. */
window.addEventListener('load',()=>setTimeout(patchUpdater,420),{once:true});
if(document.readyState==='complete')setTimeout(patchUpdater,420);
window.ONE_SHOT_BOOT={BUILD:LEGACY_BUILD,CURRENT_BUILD,isIOS,standalone};
})();
