/* ONE SHOT v6.6.15 · NEARBY HISTORY PREFERENCES */
(()=>{
'use strict';
if(window.ONE_V6615_NEARBY_PREFS)return;
const BUILD='oneshot-v6.6.15-nearby-preferences-01';
const $=id=>document.getElementById(id);
let feedbackTimer=null;

function versionTuple(v){const m=String(v||'').match(/v?(\d+)\.(\d+)\.(\d+)/i);return m?[+m[1],+m[2],+m[3]]:[0,0,0]}
function newerOrEqual(a,b){const A=versionTuple(a),B=versionTuple(b);for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]>B[i]}return true}
try{
  const applied=localStorage.getItem('oneshotAppliedBuild')||'';
  if(!applied||newerOrEqual(BUILD,applied))localStorage.setItem('oneshotAppliedBuild',BUILD);
  localStorage.setItem('oneshotRuntimeBuild',BUILD);
}catch(_){}

function runtimeReady(){
  try{return typeof State!=='undefined'&&State.settings&&typeof Store!=='undefined'}catch(_){return false}
}

function closeNearbyUi(){
  try{if(typeof Places!=='undefined'&&typeof Places.closeRelation==='function')Places.closeRelation()}catch(_){}
  const modal=$('relationModal');
  if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
  try{
    State.pendingRelationId='';
    State.pendingPreviousId='';
    State.pendingBaseItem=null;
  }catch(_){}
}

function persistNearby(enabled,{notify=true}={}){
  if(!runtimeReady())return false;
  const value=!!enabled;
  State.settings.nearbyHistoryEnabled=value;
  try{Store.saveLite()}catch(_){}
  const input=$('nearbyHistoryInput');
  if(input&&input.checked!==value)input.checked=value;
  if(!value)closeNearbyUi();
  if(notify){
    try{UI.toast(value?'✓ Historial cercano activado':'✓ Historial cercano desactivado · no aparecerán avisos',2600)}catch(_){}
  }
  return true;
}

function ensureFeedback(){
  const save=$('saveConfigBtn');
  if(!save)return null;
  let box=$('configSaveFeedback');
  if(box)return box;
  box=document.createElement('div');
  box.id='configSaveFeedback';
  box.className='oneConfigSaveFeedback';
  box.setAttribute('role','status');
  box.setAttribute('aria-live','polite');
  save.insertAdjacentElement('afterend',box);
  return box;
}

function showSaveFeedback(){
  const input=$('nearbyHistoryInput');
  const enabled=input?input.checked:!!State?.settings?.nearbyHistoryEnabled;
  persistNearby(enabled,{notify:false});
  const box=ensureFeedback();
  const save=$('saveConfigBtn');
  if(box){
    box.innerHTML=`<b>✓ Configuración guardada</b><span>Historial cercano: <strong>${enabled?'ACTIVADO':'DESACTIVADO'}</strong></span>`;
    box.classList.add('show');
    clearTimeout(feedbackTimer);
    feedbackTimer=setTimeout(()=>box.classList.remove('show'),3600);
  }
  if(save){
    const previous=save.dataset.normalText||save.textContent||'Guardar configuración';
    save.dataset.normalText=previous.includes('Guardada')?'Guardar configuración':previous;
    save.textContent='✓ Configuración guardada';
    save.classList.add('oneSaved');
    setTimeout(()=>{save.textContent=save.dataset.normalText||'Guardar configuración';save.classList.remove('oneSaved')},1800);
  }
  try{UI.toast(`✓ Configuración guardada · historial cercano ${enabled?'activado':'desactivado'}`,2800)}catch(_){}
}

function patchPromptRelation(){
  try{
    if(typeof Places==='undefined'||Places.__nearbyPrefsPatched)return;
    const original=Places.promptRelation?.bind(Places);
    if(typeof original==='function'){
      Places.promptRelation=function(...args){
        if(State?.settings?.nearbyHistoryEnabled===false){closeNearbyUi();return;}
        return original(...args);
      };
    }
    Places.__nearbyPrefsPatched=true;
  }catch(_){}
}

function injectStyles(){
  if($('oneNearbyPrefsStyle'))return;
  const style=document.createElement('style');
  style.id='oneNearbyPrefsStyle';
  style.textContent=`
    .oneConfigSaveFeedback{display:none;margin:10px 0 0;padding:12px 14px;border-radius:16px;background:#eaf9f1;border:1px solid #b9ead0;color:#0d653b;gap:4px;flex-direction:column;font-size:14px;box-shadow:0 8px 24px rgba(13,101,59,.08)}
    .oneConfigSaveFeedback.show{display:flex;animation:oneCfgSaved .18s ease-out}
    .oneConfigSaveFeedback b{font-size:15px}.oneConfigSaveFeedback span{color:#376d53}.oneConfigSaveFeedback strong{color:#0d653b}
    #saveConfigBtn.oneSaved{background:linear-gradient(135deg,#08794b,#19a96a)!important}
    @keyframes oneCfgSaved{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
  `;
  document.head.appendChild(style);
}

function bind(){
  if(!runtimeReady())return false;
  injectStyles();
  patchPromptRelation();
  const input=$('nearbyHistoryInput');
  if(input&&!input.dataset.oneNearbyImmediate){
    input.dataset.oneNearbyImmediate='1';
    input.addEventListener('change',()=>persistNearby(input.checked,{notify:true}));
  }
  const save=$('saveConfigBtn');
  if(save&&!save.dataset.oneConfigConfirm){
    save.dataset.oneConfigConfirm='1';
    save.addEventListener('click',()=>setTimeout(showSaveFeedback,40));
  }
  ensureFeedback();
  return true;
}

let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(bind()||tries>120)clearInterval(timer);
},50);
window.addEventListener('load',()=>setTimeout(bind,80),{once:true});
window.ONE_V6615_NEARBY_PREFS={BUILD,persistNearby,closeNearbyUi};
})();
