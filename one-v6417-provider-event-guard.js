/* ONE SHOT v6.4.17 · PROVIDER EVENT GUARD */
(()=>{
'use strict';
if(window.ONE_V6417_PROVIDER_EVENT_GUARD)return;
const BUILD='oneshot-v6.4.17-panel-provider-flow-01';
let tries=0;
const isProvider=()=>document.getElementById('guidedEditor')?.dataset?.v6417Step==='provider';
function guard(id,action){const el=document.getElementById(id);if(!el||el.dataset.v6417ProviderGuard==='1')return;el.dataset.v6417ProviderGuard='1';el.addEventListener('click',e=>{if(!isProvider())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();Promise.resolve(action()).catch(err=>{console.error('provider event guard',err);UI?.toast?.(err?.message||String(err),3600);});},true);}
function install(){guard('guidedBackBtn',()=>GuidedEditor.back?.());guard('guidedSkipBtn',()=>GuidedEditor.skip?.());}
function start(){if(window.__ONE_V6417_PROVIDER_EVENT_GUARD_STARTED)return;if(!window.ONE_V6417_PANEL_PROVIDER||typeof GuidedEditor==='undefined'){if(tries++<220)return void setTimeout(start,60);return;}window.__ONE_V6417_PROVIDER_EVENT_GUARD_STARTED=true;install();const editor=document.getElementById('guidedEditor');if(editor&&window.MutationObserver)new MutationObserver(install).observe(editor,{childList:true,subtree:true});}
window.ONE_V6417_PROVIDER_EVENT_GUARD={BUILD,start,install};window.addEventListener('load',()=>setTimeout(start,3780),{once:true});if(document.readyState==='complete')setTimeout(start,3780);
})();
