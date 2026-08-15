/* ONE SHOT v6.3.1 · PARTY LOGOS + CLEAN REPORT · BOOTSTRAP */
(()=>{
  'use strict';
  const BUILD='oneshot-v6.3.1-party-logos-clean-report-01';
  const ua=navigator.userAgent||'';
  const isIOS=/iPhone|iPad|iPod/i.test(ua);
  const standalone=(()=>{try{return window.matchMedia?.('(display-mode: standalone)').matches===true||window.matchMedia?.('(display-mode: fullscreen)').matches===true||navigator.standalone===true||document.referrer.startsWith('android-app://');}catch(_){return navigator.standalone===true;}})();
  try{
    localStorage.setItem('oneshotRuntimeBuild',BUILD);
    localStorage.setItem('oneshotAppliedBuild',BUILD);
    localStorage.removeItem('oneshotDismissedBuild');
    if(standalone){localStorage.setItem('oneshotInstalledDetected','1');localStorage.setItem('oneshotInstallDismissed','1');}
    if(isIOS)localStorage.setItem('oneshotInstallDismissed','1');
    sessionStorage.setItem('oneshotBootBuild',BUILD);
  }catch(_){}
  window.ONE_SHOT_BOOT={BUILD,isIOS,standalone};
})();
