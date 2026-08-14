window.ONE_SHOT_DATA={parties:["ALIANZA PARA EL PROGRESO","FUERZA POPULAR","PARTIDO MORADO","SOMOS PERÚ","RENOVACIÓN POPULAR"],candidates:[]};

/* ONE SHOT v6.0.4 · TURN TAKING HOTFIX
   Se carga antes de app.js y aplica el parche al terminar de cargar la app. */
window.addEventListener("load",()=>{
  try{
    localStorage.setItem("oneshotAppliedBuild","oneshot-v6.0.4-turn-taking-mascot-01");
    if(typeof GuidedEditor==="undefined"||typeof ONEAssistant==="undefined")return;

    const css=`
.guidedRobot[data-state="waiting"] .robotFace,.editMiniAssistant[data-state="waiting"] .miniRobotFace{border-color:#64d8ff;box-shadow:0 0 0 5px rgba(76,188,255,.08),0 0 26px rgba(68,171,255,.32);animation:oneWaitingBreath 1.4s ease-in-out infinite}
.guidedRobot[data-state="speaking"] .robotFace,.editMiniAssistant[data-state="speaking"] .miniRobotFace{animation:oneHeadTalk .36s ease-in-out infinite alternate}
.guidedRobot[data-state="thinking"] .robotFace,.editMiniAssistant[data-state="thinking"] .miniRobotFace{animation:oneHeadThink .72s ease-in-out infinite alternate}
.guidedRobot[data-state="success"] .robotFace,.editMiniAssistant[data-state="success"] .miniRobotFace{animation:oneCelebrate .5s ease-out 1;border-color:#59e09f;box-shadow:0 0 26px rgba(78,223,158,.34)}
.editImageStage[data-one-state="thinking"]::after{content:'ONE está mirando la evidencia…';position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:8;background:rgba(2,14,32,.84);border:1px solid rgba(86,170,255,.35);color:#dff4ff;padding:7px 12px;border-radius:999px;font-size:10px;font-weight:850}
.editImageStage[data-one-state="listening"]::after,.editImageStage[data-one-state="waiting"]::after{content:'Tu turno · ONE te escucha';position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:8;background:rgba(3,32,42,.86);border:1px solid rgba(78,226,188,.36);color:#dffff5;padding:7px 12px;border-radius:999px;font-size:10px;font-weight:850}
.editImageStage[data-one-state="success"]::after{content:'✓ Respuesta guardada';position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:8;background:rgba(7,62,45,.9);border:1px solid rgba(87,231,167,.4);color:#eafff5;padding:7px 12px;border-radius:999px;font-size:10px;font-weight:900;animation:oneSuccessBadge .65s ease-out 1}
.editMiniAssistant[data-state="speaking"] .miniRobotMascot{animation:oneMascotTalk .38s ease-in-out infinite alternate}.editMiniAssistant[data-state="waiting"] .miniRobotMascot{animation:oneMascotWait 1.35s ease-in-out infinite}.editMiniAssistant[data-state="success"] .miniRobotArm.right{animation:oneRobotWave .28s ease-in-out 4 alternate}
.guidedRobot[data-state="speaking"] .robotFace b,.editMiniAssistant[data-state="speaking"] .miniRobotFace b{height:7px;animation:oneMouthSpeak .18s linear infinite alternate}
@keyframes oneWaitingBreath{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.025)}}@keyframes oneHeadTalk{0%{transform:translateY(0) rotate(-1deg)}100%{transform:translateY(-2px) rotate(2deg)}}@keyframes oneHeadThink{0%{transform:translateY(0) rotate(-4deg)}100%{transform:translateY(-3px) rotate(5deg)}}@keyframes oneCelebrate{0%{transform:translateY(0)}45%{transform:translateY(-8px) scale(1.07)}100%{transform:translateY(0)}}@keyframes oneMascotTalk{0%{transform:translateY(0) rotate(-2deg)}100%{transform:translateY(-3px) rotate(2deg)}}@keyframes oneMascotWait{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes oneMouthSpeak{0%{transform:translateX(-50%) scaleY(.6)}100%{transform:translateX(-50%) scaleY(1.55)}}@keyframes oneSuccessBadge{0%{opacity:0;transform:translateX(-50%) translateY(-8px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}`;
    const style=document.createElement("style");style.dataset.oneshotV604="1";style.textContent=css;document.head.appendChild(style);

    GuidedEditor.speechLock=false;GuidedEditor.lastAssistantSpeech="";GuidedEditor.lastAssistantSpeechAt=0;GuidedEditor.resumeListenTimer=null;

    const oldRobot=GuidedEditor.robot.bind(GuidedEditor);
    GuidedEditor.robot=(state="idle")=>{oldRobot(state);document.getElementById("editImageStage")?.setAttribute("data-one-state",state);};

    GuidedEditor.say=text=>{
      const msg=String(text||"").trim();
      if(document.getElementById("guidedAssistantSpeech"))document.getElementById("guidedAssistantSpeech").textContent=msg;
      if(document.getElementById("editMiniAssistantSpeech"))document.getElementById("editMiniAssistantSpeech").textContent=msg;
      GuidedEditor.lastAssistantSpeech=msg;GuidedEditor.lastAssistantSpeechAt=Date.now();GuidedEditor.robot("speaking");ONEAssistant.say(msg);
    };

    ONEAssistant.say=msg=>{
      const text=String(msg||"").trim().slice(0,220);if(!text)return;
      GuidedEditor.lastAssistantSpeech=text;GuidedEditor.lastAssistantSpeechAt=Date.now();GuidedEditor.speechLock=true;clearTimeout(GuidedEditor.resumeListenTimer);
      try{GuidedEditor.recognition?.abort?.();}catch(_){}GuidedEditor.recognition=null;GuidedEditor.robot("speaking");
      const done=()=>{GuidedEditor.speechLock=false;clearTimeout(GuidedEditor.resumeListenTimer);if(GuidedEditor.listenRequested){GuidedEditor.robot("waiting");const h=document.getElementById("guidedHeard");if(h)h.textContent="Tu turno · te escucho…";GuidedEditor.resumeListenTimer=setTimeout(()=>{if(GuidedEditor.listenRequested&&!GuidedEditor.speechLock)GuidedEditor.listen();},650);}else GuidedEditor.robot("idle");};
      if(State.settings.assistantVoice===false||!("speechSynthesis" in window)){setTimeout(done,Math.min(1500,500+text.length*9));return;}
      try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="es-PE";u.rate=1.02;u.onstart=()=>{GuidedEditor.speechLock=true;GuidedEditor.robot("speaking")};u.onend=done;u.onerror=done;speechSynthesis.speak(u);}catch(_){done();}
    };

    const originalParse=GuidedEditor.parseVoice.bind(GuidedEditor);
    GuidedEditor.parseVoice=async raw=>{
      const q=ONEAssistant.normalize(raw);if(!q)return;
      const spoken=ONEAssistant.normalize(GuidedEditor.lastAssistantSpeech||"");const age=Date.now()-(GuidedEditor.lastAssistantSpeechAt||0);
      if(age<5200&&spoken){const same=q===spoken||spoken.includes(q)||q.includes(spoken)||GuidedEditor.similarity(q,spoken)>=.72;if(same){const h=document.getElementById("guidedHeard");if(h)h.textContent="Evité escuchar mi propia voz · ahora te escucho a ti.";GuidedEditor.robot("waiting");return;}}
      return originalParse(raw);
    };

    GuidedEditor.listen=()=>{
      if(!GuidedEditor.listenRequested||GuidedEditor.speechLock)return;
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){GuidedEditor.listenRequested=false;GuidedEditor.updateListenUI();return UI.toast("El reconocimiento de voz no está disponible en este navegador");}
      try{if(GuidedEditor.recognition)return;const r=new SR();r.lang="es-PE";r.interimResults=false;r.maxAlternatives=1;r.continuous=false;
        r.onstart=()=>{if(GuidedEditor.speechLock){try{r.abort()}catch(_){}return;}GuidedEditor.robot("listening");const h=document.getElementById("guidedHeard");if(h)h.textContent="Tu turno · escuchando…";GuidedEditor.updateListenUI();};
        r.onresult=e=>{if(!GuidedEditor.speechLock)GuidedEditor.parseVoice(e.results?.[0]?.[0]?.transcript||"")};
        r.onerror=e=>{if(["aborted","no-speech"].includes(e?.error))return;GuidedEditor.robot("error");};
        r.onend=()=>{if(GuidedEditor.recognition===r)GuidedEditor.recognition=null;if(GuidedEditor.listenRequested&&!GuidedEditor.speechLock){clearTimeout(GuidedEditor.resumeListenTimer);GuidedEditor.resumeListenTimer=setTimeout(()=>{if(GuidedEditor.listenRequested&&!GuidedEditor.speechLock&&!GuidedEditor.recognition)GuidedEditor.listen()},420);}GuidedEditor.updateListenUI();};
        GuidedEditor.recognition=r;r.start();
      }catch(_){GuidedEditor.recognition=null;}
    };

    GuidedEditor.toggleListening=()=>{if(GuidedEditor.listenRequested)return GuidedEditor.stopListening(true);GuidedEditor.listenRequested=true;GuidedEditor.updateListenUI();GuidedEditor.robot("waiting");const h=document.getElementById("guidedHeard");if(h)h.textContent="Micrófono activo · te escucharé después de cada pregunta hasta que vuelvas a tocarlo.";setTimeout(()=>{if(GuidedEditor.listenRequested&&!GuidedEditor.speechLock)GuidedEditor.listen()},180);};
    GuidedEditor.stopListening=()=>{GuidedEditor.listenRequested=false;clearTimeout(GuidedEditor.resumeListenTimer);try{GuidedEditor.recognition?.abort?.()}catch(_){}GuidedEditor.recognition=null;GuidedEditor.robot("idle");GuidedEditor.updateListenUI();const h=document.getElementById("guidedHeard");if(h)h.textContent="Micrófono en pausa. Tócalo cuando quieras volver a hablarme.";};

    ["guidedMicBtn","guidedMicTopBtn","editMiniAssistantMic"].forEach(id=>{const old=document.getElementById(id);if(!old)return;const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener("click",GuidedEditor.toggleListening);});
  }catch(e){console.warn("ONE SHOT v6.0.4 hotfix:",e);}
});
