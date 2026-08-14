/* ONE SHOT v6.2 · INSTALL & UPDATE CORE · PLATFORM CONTROLLER */
(()=>{
  'use strict';
  const BOOT=window.ONE_SHOT_BOOT||{};
  const BUILD=BOOT.BUILD||'oneshot-v6.2-install-update-core-01';
  const isIOS=()=>BOOT.isIOS===true||/iPhone|iPad|iPod/i.test(navigator.userAgent||'');
  const isStandalone=()=>{
    try{return window.matchMedia?.('(display-mode: standalone)').matches===true||window.matchMedia?.('(display-mode: fullscreen)').matches===true||navigator.standalone===true||document.referrer.startsWith('android-app://');}catch(_){return navigator.standalone===true;}
  };
  const closeInstallModal=()=>document.getElementById('installModal')?.classList.remove('open');
  const closeUpdateModal=()=>document.getElementById('updateModal')?.classList.remove('open');
  const markCurrent=()=>{try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);localStorage.removeItem('oneshotDismissedBuild');}catch(_){}};
  markCurrent();

  const installController=()=>{
    try{
      if(typeof EasyInstall==='undefined')return false;
      const originalOpen=EasyInstall.open.bind(EasyInstall);
      const originalMaybePrompt=EasyInstall.maybePrompt.bind(EasyInstall);
      EasyInstall.isStandalone=isStandalone;
      EasyInstall.open=()=>{
        if(isStandalone()){
          try{localStorage.setItem('oneshotInstallDismissed','1');localStorage.setItem('oneshotInstalledDetected','1');}catch(_){}
          closeInstallModal();EasyInstall.render?.();
          if(typeof UI!=='undefined')UI.toast('ONE SHOT ya está instalada en este dispositivo',2400);
          return;
        }
        return originalOpen();
      };
      EasyInstall.maybePrompt=()=>{
        if(isStandalone()){
          try{localStorage.setItem('oneshotInstallDismissed','1');localStorage.setItem('oneshotInstalledDetected','1');}catch(_){}
          closeInstallModal();EasyInstall.render?.();return;
        }
        // iPhone/iPad: la guía de instalación jamás aparece sola.
        if(isIOS())return;
        if(localStorage.getItem('oneshotInstallDismissed')==='1')return;
        if(sessionStorage.getItem('oneshotInstallPromptedSession')==='1')return;
        sessionStorage.setItem('oneshotInstallPromptedSession','1');
        return originalMaybePrompt();
      };
      EasyInstall.render?.();
      if(isStandalone())closeInstallModal();
      return true;
    }catch(e){console.warn('ONE SHOT install controller',e);return false;}
  };

  const updateController=()=>{
    try{
      if(typeof AppUpdater==='undefined')return false;
      const originalInstall=AppUpdater.install.bind(AppUpdater);
      AppUpdater.feed=async()=>{
        try{
          const r=await fetch(`version.json?t=${Date.now()}`,{cache:'no-store'});
          if(!r.ok)throw new Error('feed local');
          return await r.json();
        }catch(_){
          const r=await fetch(`https://raw.githubusercontent.com/DiegoRod24/one-shot-2/main/version.json?t=${Date.now()}`,{cache:'no-store'});
          if(!r.ok)throw new Error('No se pudo leer la versión publicada');
          return r.json();
        }
      };
      AppUpdater.check=async(force=false)=>{
        if(!navigator.onLine){if(typeof UI!=='undefined')UI.toast('Sin internet: no se puede buscar actualización');return;}
        const btn=document.getElementById('toolUpdateApp'),txt=document.getElementById('updateAppText');
        btn?.classList.add('busy');if(txt)txt.textContent='Buscando versión nueva…';
        try{
          const remote=await AppUpdater.feed();
          const remoteBuild=String(remote?.build||'').trim();
          const applied=localStorage.getItem('oneshotAppliedBuild')||'';
          const same=!remoteBuild||remoteBuild===BUILD||remoteBuild===applied;
          if(same){markCurrent();closeUpdateModal();if(txt)txt.textContent=`Actualizado · ${remote?.version||'v6.2'}`;if(force&&typeof UI!=='undefined')UI.toast(`ONE SHOT ${remote?.version||'v6.2'} ya está actualizado`,2400);return;}
          const dismissed=localStorage.getItem('oneshotDismissedBuild')||'';
          if(remoteBuild===dismissed&&!force){if(txt)txt.textContent=`Disponible · ${remote.version||remoteBuild}`;return;}
          const accept=await AppUpdater.prompt(remote);
          if(!accept){localStorage.setItem('oneshotDismissedBuild',remoteBuild);if(txt)txt.textContent='Actualización disponible';return;}
          localStorage.setItem('oneshotAppliedBuild',remoteBuild);localStorage.removeItem('oneshotDismissedBuild');
          await originalInstall(remote);
        }catch(e){if(txt)txt.textContent='No se pudo comprobar actualización';if(typeof UI!=='undefined')UI.toast(e?.message||String(e),3200);}finally{btn?.classList.remove('busy');}
      };
      setTimeout(async()=>{try{const remote=await AppUpdater.feed();if(!remote?.build||remote.build===BUILD||remote.build===localStorage.getItem('oneshotAppliedBuild')){markCurrent();closeUpdateModal();}}catch(_){}},0);
      return true;
    }catch(e){console.warn('ONE SHOT update controller',e);return false;}
  };

  const reconcile=()=>{
    markCurrent();
    if(isStandalone()){
      try{localStorage.setItem('oneshotInstallDismissed','1');localStorage.setItem('oneshotInstalledDetected','1');}catch(_){}
      closeInstallModal();
      try{if(typeof EasyInstall!=='undefined')EasyInstall.render?.();}catch(_){}
    }
  };
  const apply=()=>{installController();updateController();reconcile();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('load',apply,{once:true});
  window.addEventListener('pageshow',reconcile);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)reconcile();});
  window.addEventListener('appinstalled',()=>{try{localStorage.setItem('oneshotInstallDismissed','1');localStorage.setItem('oneshotInstalledDetected','1');}catch(_){}closeInstallModal();});
})();
