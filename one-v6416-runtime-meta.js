/* ONE SHOT v6.4.16 · RUNTIME METADATA ALIGNMENT */
(()=>{
'use strict';
if(window.ONE_V6416_RUNTIME_META)return;
const BUILD='oneshot-v6.4.16-edit-flow-evidence-recovery-01',VERSION='v6.4.16';
let tries=0;
function patch(){
  if(typeof Evidence==='undefined'||!Evidence.make||Evidence.__v6416Build)return false;
  Evidence.__v6416Build=true;const old=Evidence.make.bind(Evidence);
  Evidence.make=(...a)=>{const r=old(...a);if(r){r.appBuild=BUILD;r.runtimeBuild=BUILD;r.appVersion=VERSION;r.storageSchema='oneshotEvidenceDB_v2';}return r;};
  document.documentElement.dataset.oneshotBuild=BUILD;
  try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}
  return true;
}
function start(){if(window.__ONE_V6416_RUNTIME_META_STARTED)return;if(!patch()){if(tries++<180)return void setTimeout(start,80);return;}window.__ONE_V6416_RUNTIME_META_STARTED=true;}
window.ONE_V6416_RUNTIME_META={BUILD,VERSION,start,patch};window.addEventListener('load',()=>setTimeout(start,3480),{once:true});if(document.readyState==='complete')setTimeout(start,3480);
})();
