/* ONE SHOT v6.4.7 · FER GEOMETRY FIX */
(()=>{
'use strict';
if(window.ONE_V647_FER)return;
const BUILD='oneshot-v6.4.7-data-fer-visual-fix-01';
let tries=0;
function css(){
  if(document.getElementById('v647FerCss'))return;
  const s=document.createElement('style');s.id='v647FerCss';s.textContent=`
  /* Fer fue diseñado internamente en 76x84. Nunca se redimensionan sus piezas. */
  html.v647Fer .ferAvatar{width:76px!important;height:84px!important;min-width:76px!important;min-height:84px!important;max-width:76px!important;max-height:84px!important;transform-origin:center center!important}
  html.v647Fer #guidedRobot.ferHumanHost{grid-template-columns:94px minmax(0,1fr) auto!important;min-height:108px!important;align-items:center!important;overflow:hidden!important}
  html.v647Fer #guidedRobot .ferAvatar{width:76px!important;height:84px!important;min-width:76px!important;min-height:84px!important;margin:0 0 0 5px!important;scale:1.13!important;transform-origin:center center!important}
  html.v647Fer .editMiniAssistant{align-items:center!important;overflow:hidden!important}
  html.v647Fer .editMiniAssistant .ferAvatar{width:76px!important;height:84px!important;min-width:76px!important;min-height:84px!important;margin:-7px -4px -7px -8px!important;scale:.76!important;transform-origin:center center!important}
  html.v647Fer .reportOneMascot.ferHumanHost{width:72px!important;height:78px!important;display:grid!important;place-items:center!important;overflow:hidden!important}
  html.v647Fer .reportOneMascot .ferAvatar{width:76px!important;height:84px!important;min-width:76px!important;min-height:84px!important;margin:0!important;scale:.78!important;transform-origin:center center!important}
  html.v647Fer #oneAssistantFab.ferFab{width:86px!important;height:60px!important;overflow:hidden!important}
  html.v647Fer #oneAssistantFab.ferFab .ferAvatar{width:76px!important;height:84px!important;min-width:76px!important;min-height:84px!important;left:-5px!important;top:-8px!important;margin:0!important;scale:.55!important;transform-origin:center center!important}
  html.v647Fer .ferOrbHuman .ferAvatar{width:76px!important;height:84px!important;min-width:76px!important;min-height:84px!important;scale:.68!important;transform-origin:center center!important}
  html.v647Fer .relationHelpBot .ferAvatar{width:76px!important;height:84px!important;min-width:76px!important;min-height:84px!important;scale:.54!important;transform-origin:center center!important}
  @media(max-width:700px){
    html.v647Fer #guidedRobot.ferHumanHost{grid-template-columns:82px minmax(0,1fr) auto!important;min-height:100px!important}
    html.v647Fer #guidedRobot .ferAvatar{scale:1!important;margin-left:2px!important}
    html.v647Fer .editMiniAssistant .ferAvatar{scale:.68!important;margin-left:-11px!important;margin-right:-8px!important}
  }
  `;document.head.appendChild(s);document.documentElement.classList.add('v647Fer');
}
function sync(){
  try{window.FER_V640?.mountAll?.();}catch(_){}
  document.querySelectorAll('.ferAvatar').forEach(a=>{a.style.removeProperty('width');a.style.removeProperty('height');if(!a.dataset.ferState)a.dataset.ferState='idle';});
}
function start(){
  if(window.__ONE_V647_FER_STARTED)return;
  if(!window.FER_V640||typeof GuidedEditor==='undefined'){if(tries++<100)setTimeout(start,100);return;}
  window.__ONE_V647_FER_STARTED=true;css();sync();
  const nodes=['guidedRobot','editMiniAssistant','oneAssistantFab','viewReports','relationModal'].map(id=>document.getElementById(id)).filter(Boolean);
  if(window.MutationObserver&&nodes.length){const mo=new MutationObserver(()=>setTimeout(sync,20));nodes.forEach(n=>mo.observe(n,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-state']}));}
}
window.ONE_V647_FER={BUILD,start,sync};
window.addEventListener('load',()=>setTimeout(start,820),{once:true});if(document.readyState==='complete')setTimeout(start,820);
})();