/* ONE SHOT v6.4.9 · FER SESSION + VOICE SYNC */
(()=>{
'use strict';
if(window.ONE_V649_FER_SESSION)return;
const BUILD='oneshot-v6.4.9-fer-session-logos-real-fix-01';
let tries=0;
const S={
 token:0,phase:'idle',processing:false,restartTimer:null,lastSpoken:'',lastSpokenAt:0,
 open(){return !!Editor?.current&&document.getElementById('editModal')?.classList.contains('open');},
 setPhase(phase,msg=''){
   S.phase=phase;
   const map={idle:'idle',speaking:'speaking',listening:'listening',processing:'thinking',thinking:'thinking',success:'success',error:'error',waiting:'waiting'};
   try{GuidedEditor.robot?.(map[phase]||phase);}catch(_){}
   try{window.FER_V640?.state?.(map[phase]||phase,msg);}catch(_){}
   const heard=document.getElementById('guidedHeard');if(heard&&msg)heard.textContent=msg;
   const box=document.getElementById('guidedRobot');if(box)box.dataset.ferPhase=phase;
 },
 cancelRecognition(){
   clearTimeout(S.restartTimer);S.restartTimer=null;
   const r=GuidedEditor.recognition;GuidedEditor.recognition=null;
   if(r){try{r.onend=null;r.onresult=null;r.onerror=null;r.abort?.();}catch(_){try{r.stop?.();}catch(__){}}}
 },
 cancelSpeech(){S.token++;try{if('speechSynthesis'in window)speechSynthesis.cancel();}catch(_){}},
 stopAll({keepRequest=false}={}){
   clearTimeout(S.restartTimer);S.restartTimer=null;S.processing=false;
   if(!keepRequest)GuidedEditor.listenRequested=false;
   S.cancelRecognition();S.cancelSpeech();S.setPhase('idle','Fer en pausa.');
   try{GuidedEditor.updateListenUI?.();}catch(_){}
 },
 scheduleListen(delay=180){
   clearTimeout(S.restartTimer);S.restartTimer=setTimeout(()=>{
     const busy=('speechSynthesis'in window)&&(speechSynthesis.speaking||speechSynthesis.pending);
     if(S.open()&&GuidedEditor.listenRequested&&!S.processing&&!busy)S.listen();
   },delay);
 },
 visualText(text){
   const t=String(text||'').replace(/\bONE\b/g,'Fer');
   const a=document.getElementById('guidedAssistantSpeech');if(a)a.textContent=t;
   const b=document.getElementById('editMiniAssistantSpeech');if(b)b.textContent=t;
   const n=document.getElementById('editMiniAssistantName');if(n)n.textContent='Fer';
   return t;
 },
 speak(text,{force=false}={}){
   const t=S.visualText(text);if(!t||!S.open())return;
   const now=Date.now();if(!force&&t===S.lastSpoken&&now-S.lastSpokenAt<1800)return;
   S.lastSpoken=t;S.lastSpokenAt=now;
   if(/^Correcto\. Registr[eé]|^Respuesta guardada|^Cambios guardados/i.test(t)){S.setPhase('success',t);return;}
   S.cancelRecognition();
   if(State.settings.assistantVoice===false||!('speechSynthesis'in window)){
     S.setPhase(GuidedEditor.listenRequested?'waiting':'idle',GuidedEditor.listenRequested?'Listo para escucharte.':'Fer listo.');
     if(GuidedEditor.listenRequested)S.scheduleListen(100);return;
   }
   S.cancelSpeech();const token=S.token;let u;
   try{u=new SpeechSynthesisUtterance(t.slice(0,260));}catch(_){if(GuidedEditor.listenRequested)S.scheduleListen(100);return;}
   u.lang='es-PE';u.rate=.98;u.pitch=1;
   u.onstart=()=>{if(token!==S.token||!S.open())return;S.setPhase('speaking','Fer está hablando…');};
   u.onend=()=>{if(token!==S.token||!S.open())return;S.setPhase(GuidedEditor.listenRequested?'waiting':'idle',GuidedEditor.listenRequested?'Ahora te escucho.':'Fer listo.');if(GuidedEditor.listenRequested)S.scheduleListen(160);};
   u.onerror=()=>{if(token!==S.token||!S.open())return;S.setPhase(GuidedEditor.listenRequested?'waiting':'idle',GuidedEditor.listenRequested?'Ahora te escucho.':'Fer listo.');if(GuidedEditor.listenRequested)S.scheduleListen(180);};
   try{speechSynthesis.speak(u);}catch(_){if(GuidedEditor.listenRequested)S.scheduleListen(100);}
 },
 listen(){
   if(!S.open()||!GuidedEditor.listenRequested||S.processing)return;
   const busy=('speechSynthesis'in window)&&(speechSynthesis.speaking||speechSynthesis.pending);if(busy){S.scheduleListen(180);return;}
   const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
   if(!SR){GuidedEditor.listenRequested=false;GuidedEditor.updateListenUI?.();S.setPhase('error','Este navegador no permite reconocimiento de voz.');return UI.toast('El reconocimiento de voz no está disponible en este navegador');}
   S.cancelRecognition();
   try{
     const r=new SR();GuidedEditor.recognition=r;r.lang='es-PE';r.interimResults=false;r.maxAlternatives=1;r.continuous=false;
     r.onstart=()=>{if(!S.open()||!GuidedEditor.listenRequested)return;S.setPhase('listening','🎙 Escuchando tu respuesta…');GuidedEditor.updateListenUI?.();};
     r.onresult=async e=>{
       if(!S.open())return;const raw=e.results?.[0]?.[0]?.transcript||'';if(!raw.trim())return;
       S.processing=true;S.setPhase('processing',`Entendí: “${raw}” · revisando…`);
       try{await GuidedEditor.parseVoice(raw);}catch(err){console.error('Fer voice parse',err);S.setPhase('error','No pude procesar esa respuesta.');}
       finally{S.processing=false;const speaking=('speechSynthesis'in window)&&speechSynthesis.speaking;if(S.open()&&GuidedEditor.listenRequested&&S.phase!=='speaking'&&!speaking)S.scheduleListen(260);}
     };
     r.onerror=e=>{
       if(!S.open())return;const fatal=['not-allowed','service-not-allowed','audio-capture'].includes(e?.error);if(e?.error==='aborted')return;
       if(fatal){GuidedEditor.listenRequested=false;S.setPhase('error','Micrófono bloqueado. Revisa el permiso del navegador.');UI.toast('Permiso de micrófono bloqueado');}
       else{S.setPhase('waiting','No te escuché bien. Intenta otra vez.');if(GuidedEditor.listenRequested)S.scheduleListen(420);}GuidedEditor.updateListenUI?.();
     };
     r.onend=()=>{if(GuidedEditor.recognition===r)GuidedEditor.recognition=null;const speaking=('speechSynthesis'in window)&&speechSynthesis.speaking;if(S.open()&&GuidedEditor.listenRequested&&!S.processing&&S.phase!=='speaking'&&!speaking)S.scheduleListen(260);};
     r.start();
   }catch(e){console.error('Fer microphone',e);GuidedEditor.listenRequested=false;GuidedEditor.updateListenUI?.();S.setPhase('error','No pude iniciar el micrófono.');UI.toast('No pude iniciar el micrófono');}
 },
 toggle(){
   if(!S.open())return;
   if(GuidedEditor.listenRequested){GuidedEditor.listenRequested=false;S.cancelRecognition();S.setPhase('idle','Micrófono en pausa.');GuidedEditor.updateListenUI?.();return;}
   GuidedEditor.listenRequested=true;GuidedEditor.updateListenUI?.();
   const busy=('speechSynthesis'in window)&&(speechSynthesis.speaking||speechSynthesis.pending);
   if(busy){S.setPhase('waiting','Cuando termine de hablar, te escucharé automáticamente.');return;}
   S.listen();
 }
};
function patchVoice(){
  if(GuidedEditor.__v649Voice)return;GuidedEditor.__v649Voice=true;
  GuidedEditor.say=text=>S.speak(text);
  GuidedEditor.listen=()=>S.listen();
  GuidedEditor.toggleListening=()=>S.toggle();
  GuidedEditor.stopListening=(notify=false)=>{GuidedEditor.listenRequested=false;S.cancelRecognition();S.setPhase('idle',notify?'Micrófono en pausa.':'Fer listo.');GuidedEditor.updateListenUI?.();};
  const baseUI=GuidedEditor.updateListenUI?.bind(GuidedEditor);
  GuidedEditor.updateListenUI=()=>{
    try{baseUI?.();}catch(_){}
    const active=!!GuidedEditor.listenRequested;
    const set=(id,on,off)=>{const e=document.getElementById(id);if(!e)return;e.textContent=active?on:off;e.classList.toggle('listening',active);e.disabled=false;};
    set('guidedMicBtn','🛑 Pausar','🎙 Hablar');set('guidedMicTopBtn','🛑','🎙');set('editMiniAssistantMic','🛑','🎙');
    const heard=document.getElementById('guidedHeard');if(heard&&S.phase==='idle')heard.textContent=active?'Micrófono activo · toca Pausar para detenerlo.':'Toca Hablar y responde a la pregunta actual.';
  };
}
function patchClose(){
  if(Editor.__v649Close)return;Editor.__v649Close=true;
  const old=Editor.close?.bind(Editor);if(old)Editor.close=(...a)=>{S.stopAll();return old(...a);};
  document.getElementById('editClose')?.addEventListener('click',()=>S.stopAll(),true);
  const modal=document.getElementById('editModal');if(modal&&window.MutationObserver)new MutationObserver(()=>{if(!modal.classList.contains('open'))S.stopAll();}).observe(modal,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.open())S.stopAll();});
}
function css(){if(document.getElementById('v649FerSessionCss'))return;const s=document.createElement('style');s.id='v649FerSessionCss';s.textContent=`
#guidedRobot[data-fer-phase="speaking"]{box-shadow:inset 0 0 0 1px rgba(66,190,255,.28),0 0 28px rgba(40,142,255,.12)!important}
#guidedRobot[data-fer-phase="listening"]{box-shadow:inset 0 0 0 1px rgba(72,224,177,.34),0 0 30px rgba(56,215,165,.14)!important}
#guidedRobot[data-fer-phase="processing"]{box-shadow:inset 0 0 0 1px rgba(177,160,255,.3),0 0 28px rgba(138,116,255,.12)!important}
html.v649Fer .ferAvatar[data-fer-state="listening"] .ferArm.right{animation:v649Ear .72s ease-in-out infinite alternate!important}
html.v649Fer .ferAvatar[data-fer-state="speaking"] .ferArm.left{animation:v649Explain .66s ease-in-out infinite alternate!important}
html.v649Fer .ferAvatar[data-fer-state="thinking"] .ferHead{animation:v649ThinkHead .8s ease-in-out infinite alternate!important}
html.v649Fer .ferAvatar[data-fer-state="success"]{animation:v649Yes .52s ease-out 1!important}
@keyframes v649Ear{from{transform:rotate(-108deg) translate(2px,-3px)}to{transform:rotate(-125deg) translate(4px,-6px)}}
@keyframes v649Explain{from{transform:rotate(28deg)}to{transform:rotate(58deg) translateY(-2px)}}
@keyframes v649ThinkHead{from{transform:rotate(-3deg)}to{transform:rotate(8deg)}}
@keyframes v649Yes{0%{transform:translateY(0)}45%{transform:translateY(-5px) rotate(2deg)}100%{transform:translateY(0)}}
`;document.head.appendChild(s);document.documentElement.classList.add('v649Fer');}
function start(){
  if(window.__ONE_V649_FER_SESSION_STARTED)return;
  if(typeof GuidedEditor==='undefined'||typeof Editor==='undefined'||typeof State==='undefined'){if(tries++<120)setTimeout(start,100);return;}
  window.__ONE_V649_FER_SESSION_STARTED=true;css();patchVoice();patchClose();GuidedEditor.updateListenUI?.();
  try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}
}
window.ONE_V649_FER_SESSION={BUILD,S,start};
window.addEventListener('load',()=>setTimeout(start,1450),{once:true});if(document.readyState==='complete')setTimeout(start,1450);
})();