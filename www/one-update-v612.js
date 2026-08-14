/* ONE SHOT v6.1.2 · UPDATE LOOP FIX · EARLY PATCH */
(()=>{
  const BUILD='oneshot-v6.1.2-update-loop-fix-01';
  const FEED='version.json';
  try{localStorage.setItem('oneshotAppliedBuild',BUILD);localStorage.removeItem('oneshotDismissedBuild');}catch(_){}

  const nativeFetch=window.fetch?.bind(window);
  if(nativeFetch){
    window.fetch=(input,init)=>{
      try{
        const raw=typeof input==='string'?input:(input?.url||'');
        if(raw.includes('raw.githubusercontent.com/DiegoRod24/evidencia-calle-pro/main/version.json')){
          return nativeFetch(`${FEED}?t=${Date.now()}`,{...(init||{}),cache:'no-store'});
        }
      }catch(_){}
      return nativeFetch(input,init);
    };
  }

  const patchUpdater=()=>{
    try{
      if(typeof AppUpdater==='undefined'||AppUpdater.__v612Patched)return false;
      AppUpdater.__v612Patched=true;
      AppUpdater.feed=async()=>{
        const r=await fetch(`${FEED}?t=${Date.now()}`,{cache:'no-store'});
        if(!r.ok)throw new Error('No se pudo leer la versión publicada');
        return r.json();
      };
      AppUpdater.check=async(force=false)=>{
        if(!navigator.onLine)return UI.toast('Sin internet: no se puede buscar actualización');
        const btn=document.getElementById('toolUpdateApp'),txt=document.getElementById('updateAppText');
        btn?.classList.add('busy');if(txt)txt.textContent='Buscando versión nueva…';
        try{
          const remote=await AppUpdater.feed();
          const remoteBuild=String(remote?.build||'');
          const applied=localStorage.getItem('oneshotAppliedBuild')||'';
          const same=remoteBuild===BUILD||remoteBuild===applied;
          if(same){
            localStorage.setItem('oneshotAppliedBuild',BUILD);
            localStorage.removeItem('oneshotDismissedBuild');
            document.getElementById('updateModal')?.classList.remove('open');
            if(txt)txt.textContent=`Actualizado · ${remote.version||'v6.1.2'}`;
            if(force)UI.toast(`ONE SHOT ${remote.version||'v6.1.2'} ya está actualizado`);
            return;
          }
          const dismissed=localStorage.getItem('oneshotDismissedBuild')||'';
          if(remoteBuild===dismissed&&!force){if(txt)txt.textContent=`Disponible · ${remote.version||remoteBuild}`;return;}
          const accept=await AppUpdater.prompt(remote);
          if(!accept){localStorage.setItem('oneshotDismissedBuild',remoteBuild);if(txt)txt.textContent='Actualización disponible';return;}
          localStorage.setItem('oneshotAppliedBuild',remoteBuild||BUILD);
          localStorage.removeItem('oneshotDismissedBuild');
          await AppUpdater.install(remote);
        }catch(e){if(txt)txt.textContent='No se pudo comprobar actualización';UI.toast(e.message||String(e),3500);}finally{btn?.classList.remove('busy');}
      };
      const modal=document.getElementById('updateModal');
      if(modal?.classList.contains('open')){
        AppUpdater.feed().then(remote=>{
          if(String(remote?.build||'')===BUILD){modal.classList.remove('open');localStorage.setItem('oneshotAppliedBuild',BUILD);}
        }).catch(()=>{});
      }
      document.title='ONE SHOT v6.1.2 · UPDATE LOOP FIX';
      return true;
    }catch(e){console.warn('ONE SHOT early update-loop fix',e);return false;}
  };

  let tries=0;
  const timer=setInterval(()=>{tries++;if(patchUpdater()||tries>200)clearInterval(timer);},10);
  document.addEventListener('DOMContentLoaded',patchUpdater,{once:false});
  window.addEventListener('load',patchUpdater,{once:false});
})();
