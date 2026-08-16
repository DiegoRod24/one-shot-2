/* ONE SHOT v6.4.6 · FER CONTINUITY + ANTI-ECHO */
(()=>{
'use strict';
if(window.ONE_V646_FER)return;
const BUILD='oneshot-v6.4.6-stability-ux-repair-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
let lastSpoken='',lastSpokenAt=0,resumeTimer=null,tries=0;

function css(){
  if(document.getElementById('v646FerCss'))return;const s=document.createElement('style');s.id='v646FerCss';s.textContent=`
  html.v646Fer .ferAvatar{background:transparent!important;overflow:visible!important;filter:drop-shadow(0 8px 14px rgba(2,16,38,.22))!important}
  html.v646Fer .ferAvatar .ferSvg{display:none!important}
  html.v646Fer .ferAvatar .ferGlow,html.v646Fer .ferAvatar .ferBun,html.v646Fer .ferAvatar .ferHair,html.v646Fer .ferAvatar .ferHead,html.v646Fer .ferAvatar .ferNeck,html.v646Fer .ferAvatar .ferTorso,html.v646Fer .ferAvatar .ferArm,html.v646Fer .ferAvatar .ferStateDot{display:block!important}
  html.v646Fer #guidedRobot .ferAvatar{width:112px!important;height:124px!important;min-width:112px!important;min-height:124px!important;margin:-8px 0 -5px -4px!important}
  html.v646Fer .editMiniAssistant .ferAvatar{width:88px!important;height:97px!important;min-width:88px!important;min-height:97px!important}
  html.v646Fer .reportOneMascot .ferAvatar{width:94px!important;height:104px!important;min-width:94px!important;min-height:104px!important}
  html.v646Fer #oneAssistantFab.ferFab{width:90px!important;height:62px!important}
  html.v646Fer #oneAssistantFab.ferFab .ferAvatar{width:50px!important;height:56px!important;min-width:50px!important;min-height:56px!important}
  html.v646Fer .ferAvatar[data-fer-state=idle]{animation:v646FerBreathe 3.2s ease-in-out infinite}
  html.v646Fer .ferAvatar[data-fer-state=listening] .ferHead{animation:v646FerListen .85s ease-in-out infinite alternate;transform-origin:center bottom}
  html.v646Fer .ferAvatar[data-fer-state=thinking] .ferHead,html.v646Fer .ferAvatar[data-fer-state=searching] .ferHead{animation:v646FerThink 1.25s ease-in-out infinite alternate;transform-origin:center bottom}
  html.v646Fer .ferAvatar[data-fer-state=observing] .ferHead{animation:v646FerObserve 1.3s ease-in-out infinite alternate;transform-origin:center bottom}
  html.v646Fer .ferAvatar[data-fer-state=speaking] .ferMouth{animation:v646FerTalk .20s ease-in-out infinite alternate}
  html.v646Fer .ferAvatar[data-fer-state=success]{animation:v646FerSuccess .62s ease-out 1}
  html.v646Fer .ferAvatar[data-fer-state=alert] .ferStateDot,html.v646Fer .ferAvatar[data-fer-state=error] .ferStateDot{animation:v646FerAlert .75s ease-in-out infinite alternate}
  @keyframes v646FerBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
  @keyframes v646FerListen{to{transform:rotate(4deg) translateY(-1px)}}
  @keyframes v646FerThink{to{transform:rotate(-3deg) translateY(-1px)}}
  @keyframes v646FerObserve{to{transform:rotate(3deg) translateY(1px)}}
  @keyframes v646FerTalk{from{transform:scaleY(.65)}to{transform:scaleY(1.35)}}
  @keyframes v646FerSuccess{35%{transform:translateY(-6px) scale(1.035)}70%{transform:translateY(0) scale(.99)}100%{transform:translateY(0) scale(1)}}
  @keyframes v646FerAlert{to{opacity:.35;transform:scale(.8)}}
  `;document.head.appendChild(s);document.documentElement.classList.remove('v643Fer');document.documentElement.classList.add('v646Fer');
}

function mount(){
  try{window.FER_V640?.mountAll?.();window.FER_V640?.patchAssistant?.();window.FER_V640?.helpCopy?.();}catch(_){}
  document.querySelectorAll('.ferAvatar').forEach(a=>{if(!a.dataset.ferState)a.dataset.ferState='idle';});
  const replacements=['guidedHeard','guidedRecognitionNote','assistantLiveInsight','assistantContextLabel','editMiniAssistantSpeech'];
  for(const id of replacements){const e=document.getElementById(id);if(e&&e.children.length===0&&/\bONE\b/.test(e.textContent||''))e.textContent=e.textContent.replace(/\bONE\b/g,'Fer');}
  for(const id of ['editAssistantNameTitle','editMiniAssistantName','guidedAssistantName','editAssistantNameLabel','oneAssistantFabName','assistantModalName','assistantHelloName']){const e=document.getElementById(id);if(e)e.textContent='Fer';}
}

function contextual(){
  const open=id=>document.getElementById(id)?.classList.contains('open');
  const camera=document.getElementById('viewCamera')?.classList.contains('active');
  const reports=document.getElementById('viewReports')?.classList.contains('active');
  let selecting=false;try{selecting=State.selectionMode===true;}catch(_){}
  return{camera,context:open('editModal')||open('relationModal')||open('oneAssistantModal')||open('reportPreviewModal')||open('bulkModal')||reports||selecting};
}
function syncFab(){const fab=document.getElementById('oneAssistantFab');if(!fab)return;const c=contextual();fab.style.setProperty('display',c.camera||c.context?'none':'','important');}

function similarity(a,b){const A=N(a),B=N(b);if(!A||!B)return 0;if(A===B||A.includes(B)||B.includes(A))return 1;const aw=A.split(' ').filter(x=>x.length>2),bw=new Set(B.split(' ').filter(x=>x.length>2));if(!aw.length||!bw.size)return 0;const hit=aw.filter(x=>bw.has(x)).length;return hit/Math.max(aw.length,bw.size);}
function speechBusy(){try{return !!window.speechSynthesis?.speaking;}catch(_){return false;}}
function stopRecognition(){try{GuidedEditor.recognition?.abort?.();}catch(_){try{GuidedEditor.recognition?.stop?.();}catch(__){}}GuidedEditor.recognition=null;}
function resumeWhenQuiet(){
  clearTimeout(resumeTimer);if(!GuidedEditor.listenRequested)return;
  const started=Date.now();const poll=()=>{if(!GuidedEditor.listenRequested)return;if(speechBusy()||Date.now()-lastSpokenAt<360){if(Date.now()-started<12000)return void(resumeTimer=setTimeout(poll,180));}try{GuidedEditor.listen();}catch(_){};};resumeTimer=setTimeout(poll,260);
}

function patchVoice(){
  if(GuidedEditor.__v646Voice)return;GuidedEditor.__v646Voice=true;
  const oldSay=GuidedEditor.say?.bind(GuidedEditor),oldListen=GuidedEditor.listen?.bind(GuidedEditor),oldParse=GuidedEditor.parseVoice?.bind(GuidedEditor),oldRobot=GuidedEditor.robot?.bind(GuidedEditor);
  if(oldRobot)GuidedEditor.robot=state=>{const out=oldRobot(state);try{window.FER_V640?.state?.(state);}catch(_){}document.querySelectorAll('.ferAvatar').forEach(a=>a.dataset.ferState=String(state||'idle'));return out;};
  if(oldSay)GuidedEditor.say=text=>{
    lastSpoken=String(text||'');lastSpokenAt=Date.now();if(GuidedEditor.listenRequested)stopRecognition();
    const out=oldSay(String(text||'').replace(/\bONE\b/g,'Fer'));if(GuidedEditor.listenRequested)resumeWhenQuiet();return out;
  };
  if(oldListen)GuidedEditor.listen=()=>{
    if(!GuidedEditor.listenRequested)return;if(speechBusy()||Date.now()-lastSpokenAt<420){resumeWhenQuiet();return;}
    return oldListen();
  };
  if(oldParse)GuidedEditor.parseVoice=raw=>{
    const age=Date.now()-lastSpokenAt;if(age<5200&&similarity(raw,lastSpoken)>=.72){if(GuidedEditor.listenRequested)resumeWhenQuiet();return;}
    return oldParse(raw);
  };
  const oldToggle=GuidedEditor.toggleListening?.bind(GuidedEditor);if(oldToggle)GuidedEditor.toggleListening=()=>{const out=oldToggle();if(GuidedEditor.listenRequested)resumeWhenQuiet();return out;};
}

function targetedObservers(){
  if(window.__ONE_V646_FER_OBS)return;window.__ONE_V646_FER_OBS=true;
  const nodes=['editModal','relationModal','oneAssistantModal','reportPreviewModal','bulkModal','viewCamera','viewReports','selectionBar'].map(id=>document.getElementById(id)).filter(Boolean);
  if(nodes.length&&window.MutationObserver){const mo=new MutationObserver(()=>{syncFab();mount();});for(const n of nodes)mo.observe(n,{attributes:true,attributeFilter:['class']});}
  document.addEventListener('click',()=>setTimeout(()=>{syncFab();mount();},60),true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){syncFab();mount();if(GuidedEditor?.listenRequested)resumeWhenQuiet();}});
}

function start(){
  if(window.__ONE_V646_FER_STARTED)return;
  if(typeof GuidedEditor==='undefined'||typeof State==='undefined'){if(tries++<90)setTimeout(start,120);return;}
  window.__ONE_V646_FER_STARTED=true;css();mount();patchVoice();targetedObservers();syncFab();
  try{State.settings.assistantName='Fer';Store.saveLite?.();}catch(_){}
}
window.ONE_V646_FER={BUILD,start,mount,syncFab};
window.addEventListener('load',()=>setTimeout(start,640),{once:true});if(document.readyState==='complete')setTimeout(start,640);
})();