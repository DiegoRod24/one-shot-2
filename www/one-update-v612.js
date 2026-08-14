/* ONE SHOT v6.1.2 · UPDATE LOOP FIX */
(()=>{
  const BUILD='oneshot-v6.1.2-update-loop-fix-01';
  try{localStorage.setItem('oneshotAppliedBuild',BUILD);localStorage.removeItem('oneshotDismissedBuild');}catch(_){}
  const nativeFetch=window.fetch?.bind(window);
  if(nativeFetch){
    window.fetch=(input,init)=>{
      try{
        const raw=typeof input==='string'?input:(input?.url||'');
        if(raw.includes('raw.githubusercontent.com/DiegoRod24/evidencia-calle-pro/main/version.json')){
          return nativeFetch(`version.json?t=${Date.now()}`,{...(init||{}),cache:'no-store'});
        }
      }catch(_){}
      return nativeFetch(input,init);
    };
  }
  window.addEventListener('load',()=>{
    try{
      if(typeof AppUpdater!=='undefined'){
        AppUpdater.feed=async()=>{const r=await fetch(`version.json?t=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error('No se pudo leer la versión publicada');return r.json();};
      }
      document.title='ONE SHOT v6.1.2 · UPDATE LOOP FIX';
    }catch(e){console.warn('ONE SHOT update-loop fix',e);}
  });
})();
