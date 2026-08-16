"use strict";
(()=> {
  const O=window.OS2;
  O.Fer={
    voiceActive:false,recognition:null,speaking:false,lastSpeech:"",lastSpeechAt:0,guided:null,
    setState(s="idle"){O.$$(" .ferAvatar".trim()).forEach(a=>a.dataset.ferState=s);const f=O.$("ferFabState");if(f)f.textContent=s==="speaking"?"hablando":s==="listening"?"escuchando":s==="thinking"?"pensando":s==="success"?"listo":"listo"},
    open(open=true){O.$("ferPanel").classList.toggle("open",open);O.$("ferPanel").setAttribute("aria-hidden",open?"false":"true");if(open)this.context(false)},
    add(text,user=false){const d=document.createElement("div");d.className=`ferMessage${user?" user":""}`;d.textContent=text;O.$("ferConversation").appendChild(d);O.$("ferConversation").scrollTop=O.$("ferConversation").scrollHeight},
    say(text,speak=true){
      const msg=String(text||"").trim();if(!msg)return;this.lastSpeech=msg;this.lastSpeechAt=Date.now();this.add(msg,false);
      if(!speak||!("speechSynthesis" in window)){this.setState("idle");return}
      this.speaking=true;this.stopRecognition();this.setState("speaking");
      try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(msg);u.lang="es-PE";u.rate=1.02;u.pitch=1;const done=()=>{this.speaking=false;this.setState("idle");if(this.voiceActive)setTimeout(()=>this.listen(),420)};u.onend=done;u.onerror=done;speechSynthesis.speak(u)}catch(_){this.speaking=false;if(this.voiceActive)this.listen()}
    },
    context(announce=true){
      const pending=O.records.filter(r=>O.reviewState(r)==="PENDIENTE").length,loc=O.records.filter(r=>O.reviewState(r)==="REVISAR_UBICACION").length,ready=O.records.filter(r=>O.reviewState(r)==="REVISADA").length;
      const actions={
        camera:["Ir a cobertura","Actualizar GPS","Qué falta"],
        evidence:["Revisar pendiente","Revisar ubicación","Qué falta","Ir a destinos"],
        coverage:["Iniciar recorrido","Ver hallazgos","Qué falta"],
        deliveries:["Qué falta","Ir a reportes","Revisar pendiente"],
        reports:["Generar Excel","Qué falta","Ir a evidencias"]
      };
      O.$("ferActions").innerHTML=(actions[O.view]||[]).map(x=>`<button type="button">${O.esc(x)}</button>`).join("");O.$$("#ferActions button").forEach(b=>b.onclick=()=>this.command(b.textContent));
      if(announce)this.say(`Ahora tienes ${ready} evidencias listas, ${pending} sin clasificar y ${loc} que necesitan revisar ubicación.`,false)
    },
    toggleVoice(){
      this.voiceActive=!this.voiceActive;O.$("ferVoiceState").textContent=this.voiceActive?"Voz continua activa · Fer vuelve a escuchar después de hablar":"Voz continua apagada";O.$("ferMicBtn").textContent=this.voiceActive?"🟢":"🎙";
      if(this.voiceActive){this.open(true);this.say("Conversación continua activada. Te escucho sin que tengas que tocar el micrófono en cada pregunta.",true)}else{this.stopRecognition();this.setState("idle")}
    },
    listen(){
      if(!this.voiceActive||this.speaking||this.recognition)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){this.voiceActive=false;O.$("ferVoiceState").textContent="Reconocimiento de voz no disponible en este navegador";return}
      try{const r=new SR();r.lang="es-PE";r.interimResults=false;r.continuous=false;r.maxAlternatives=1;r.onstart=()=>this.setState("listening");r.onresult=e=>{const t=e.results?.[0]?.[0]?.transcript||"";if(t)this.command(t,true)};r.onerror=e=>{if(!["aborted","no-speech"].includes(e.error))this.setState("error")};r.onend=()=>{if(this.recognition===r)this.recognition=null;if(this.voiceActive&&!this.speaking)setTimeout(()=>this.listen(),480)};this.recognition=r;r.start()}catch(_){this.recognition=null}
    },
    stopRecognition(){try{this.recognition?.abort?.()}catch(_){}this.recognition=null},
    matchParty(text){
      const q=O.norm(text);if(!q)return"";const names=O.partyNames(),exact=names.find(n=>O.norm(n)===q);if(exact)return exact;
      const hits=names.filter(n=>O.norm(n).includes(q)||q.includes(O.norm(n)));if(hits.length===1)return hits[0];
      const words=q.split(" ").filter(x=>x.length>3),scored=names.map(n=>({n,s:words.filter(w=>O.norm(n).includes(w)).length})).sort((a,b)=>b.s-a.s);return scored[0]?.s>=2?scored[0].n:""
    },
    startReview(id){
      const r=O.records.find(x=>x.id===id)||O.records.find(x=>O.reviewState(x)!=="REVISADA");if(!r){this.open(true);this.say("No encuentro evidencias pendientes. Buen trabajo.",true);return}
      this.guided={id:r.id,step:r.party?"type":"party"};this.open(true);O.Editor.open(r.id);O.modal("editModal",false);
      if(this.guided.step==="party")this.askParty(r);else this.askType(r)
    },
    askParty(r){this.guided.step="party";this.setState("observing");this.say(`Estoy revisando ${r.photoCode}. ¿A qué organización política pertenece?`,true);this.actions(["Abrir edición","Saltar revisión"])},
    askType(r){this.guided.step="type";this.say("Perfecto. ¿Qué encontraste en la calle: panel, banner o pinta?",true);this.actions(["PANEL","BANNER","PINTA","Abrir edición"])},
    askTerritory(r){
      this.guided.step="territory";O.Directory.apply(r);
      if(r.municipality){this.say(`El territorio corresponde a ${r.municipality}. La evidencia se prepara para el alcalde ${r.municipalMayor||"registrado"} y también para ${r.party}. ¿Guardo la revisión?`,true);this.actions(["Guardar revisión","Abrir edición"])}
      else{this.say("La clasificación está lista, pero no tengo un match municipal exacto. Necesitamos revisar Departamento, Provincia y Distrito antes de cerrar.",true);this.actions(["Abrir edición","Guardar como pendiente"])}
    },
    actions(labels){O.$("ferActions").innerHTML=labels.map(x=>`<button type="button">${O.esc(x)}</button>`).join("");O.$$("#ferActions button").forEach(b=>b.onclick=()=>this.command(b.textContent))},
    async handleGuided(text){
      const g=this.guided,r=O.records.find(x=>x.id===g?.id);if(!g||!r)return false;const q=O.norm(text);
      if(q.includes("ABRIR EDICION")){O.Editor.open(r.id);this.say("Abrí la ficha completa. Ahí puedes corregir territorio, partido o tipo.",false);this.guided=null;return true}
      if(q.includes("SALTAR")||q.includes("COMO PENDIENTE")){await O.DB.put(r);O.Evidence.renderAll();this.guided=null;this.say("La dejo pendiente para no inventar datos.",true);return true}
      if(g.step==="party"){const p=this.matchParty(text);if(!p){this.say("No pude identificar una organización única. Puedes repetir el nombre o abrir la edición con el buscador de partidos.",true);return true}r.party=p;await O.DB.put(r);this.setState("success");this.say(`Entendí ${p}.`,true);setTimeout(()=>this.askType(r),500);return true}
      if(g.step==="type"){
        const t=["PANEL","BANNER","PINTA"].find(x=>q.includes(x));if(!t){this.say("Solo necesito saber si es panel, banner o pinta.",true);return true}r.type=t;await O.DB.put(r);this.setState("success");this.say(`Tipo ${t} guardado.`,true);setTimeout(()=>this.askTerritory(r),450);return true
      }
      if(g.step==="territory"&&q.includes("GUARDAR")){
        O.Directory.apply(r);r.reviewStatus=O.reviewState(r);await O.DB.put(r);O.Evidence.renderAll();O.Deliveries.render();O.Reports.paint();this.guided=null;this.setState("success");this.say(O.reviewState(r)==="REVISADA"?"Revisión completa. La evidencia ya tiene sus dos destinos identificados.":"Guardé la evidencia, pero seguirá marcada para revisar ubicación.",true);return true
      }
      return false
    },
    async command(raw,fromVoice=false){
      const text=String(raw||"").trim();if(!text)return;if(fromVoice){const q=O.norm(text),spoken=O.norm(this.lastSpeech),age=Date.now()-this.lastSpeechAt;if(age<5000&&spoken&&(q===spoken||spoken.includes(q)||q.includes(spoken)))return}
      this.add(text,true);this.setState("thinking");if(await this.handleGuided(text))return;
      const q=O.norm(text),pending=O.records.filter(r=>O.reviewState(r)==="PENDIENTE"),loc=O.records.filter(r=>O.reviewState(r)==="REVISAR_UBICACION");
      setTimeout(()=>{
        if(q.includes("GPS")){O.GPS.refresh(false);this.say("Estoy actualizando tu posición.",false)}
        else if(q.includes("COBERTURA")||q.includes("RECORRIDO")){O.App.view("coverage");this.say("Te llevo a Cobertura. Recuerda: ruta recorrida y hallazgos son datos distintos.",false)}
        else if(q.includes("INICIAR")){O.App.view("coverage");O.Route.start()}
        else if(q.includes("HALLAZ")){O.App.view("evidence");this.say(`Tienes ${O.records.length} hallazgos registrados.`,false)}
        else if(q.includes("PENDIENT")){if(pending[0])this.startReview(pending[0].id);else this.say("No hay evidencias sin clasificar.",true)}
        else if(q.includes("UBICACION")){if(loc[0]){O.Editor.open(loc[0].id);this.say("Abrí una evidencia que necesita revisar territorio antes de determinar su municipalidad.",false)}else this.say("No hay evidencias marcadas para revisar ubicación.",true)}
        else if(q.includes("DESTINO")){O.App.view("deliveries");this.say("Aquí agrupamos evidencias por municipalidad y por organización política.",false)}
        else if(q.includes("EXCEL")||q.includes("REPORTE")){O.App.view("reports");this.say("El Excel de entrega conserva la estructura ERM y agrega trazabilidad de destinos.",false)}
        else if(q.includes("EVIDEN")){O.App.view("evidence");this.say("Te llevo a Evidencias.",false)}
        else if(q.includes("QUE FALTA")||q.includes("QUÉ FALTA")||q.includes("SIGUE"))this.context(true)
        else this.say("Puedo ayudarte con cobertura, GPS, revisión, destino municipal, partido político y Excel. También puedes decirme “qué falta”.",true)
      },250)
    }
  };
})();