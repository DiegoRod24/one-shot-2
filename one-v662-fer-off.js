/* ONE SHOT v6.6.2 · FER OFF */
(()=>{
'use strict';
if(window.ONE_V662_FER_OFF)return;
const BUILD='oneshot-v6.6.2-fer-off-update-loop-fix-01';
const selectors=[
  '[id*="fer" i]','[class*="fer-" i]','[class*="fer_" i]',
  '[data-fer]','[data-assistant]','[aria-label*="Fer" i]',
  '.assistant-live','.virtual-assistant','.fer-shell','.fer-modal','.fer-panel'
];
function looksLikeFer(el){
  if(!(el instanceof Element))return false;
  const text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  return text.includes('fer · asistente live')||text.includes('hola. soy fer')||text.includes('dime qué necesitas');
}
function removeFer(root=document){
  for(const s of selectors){try{root.querySelectorAll?.(s).forEach(el=>{if(el.closest?.('[data-one-keep-fer-off]'))return;el.remove();});}catch(_){}}
  try{root.querySelectorAll?.('div,section,aside,dialog').forEach(el=>{if(looksLikeFer(el))el.remove();});}catch(_){}
}
function neutralizeGlobals(){
  const names=['Fer','FER','FerAssistant','AssistantFer','ONE_FER','ONE_V651_FER_SHELL','ONE_V649_FER_SESSION'];
  for(const name of names){try{if(name in window)window[name]=null;}catch(_){}}
}
const style=document.createElement('style');
style.id='one-v662-fer-off-style';
style.textContent='[id*="fer" i],[class*="fer-shell" i],[class*="fer-modal" i],[class*="fer-panel" i],[data-fer],[data-assistant]{display:none!important;visibility:hidden!important;pointer-events:none!important;}';
document.head.appendChild(style);
removeFer();neutralizeGlobals();
const observer=new MutationObserver(muts=>{for(const m of muts)for(const n of m.addedNodes){if(n.nodeType===1){if(looksLikeFer(n))n.remove();else removeFer(n);}}});
observer.observe(document.documentElement,{childList:true,subtree:true});
window.ONE_V662_FER_OFF={BUILD,enabled:true,removeFer};
})();
