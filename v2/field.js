"use strict";
(()=> {
  const O=window.OS2;
  O.GPS={
    watchId:null,
    paint(){const chip=O.$("gpsStatus"),c=O.$("hudCoords");if(O.gps){chip.textContent=`GPS ±${Math.round(O.gps.accuracy||0)}m`;chip.classList.remove("warn");c.textContent=`${O.gps.latitude.toFixed(5)}, ${O.gps.longitude.toFixed(5)}`}else{chip.textContent="GPS…";chip.classList.add("warn");c.textContent="GPS pendiente"}},
    refresh(silent=false){return new Promise(resolve=>{if(!navigator.geolocation){if(!silent)O.toast("GPS no disponible");return resolve(null)}navigator.geolocation.getCurrentPosition(p=>{O.gps={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,altitude:p.coords.altitude,heading:p.coords.heading,at:Date.now()};this.paint();resolve(O.gps)},e=>{this.paint();if(!silent)O.toast(e.code===1?"Permiso de ubicación pendiente":"No pude actualizar GPS");resolve(null)},{enableHighAccuracy:true,timeout:10000,maximumAge:8000})})}
  };

  O.Territory={
    cache:new Map(),lastCallAt:0,
    async reverse(gps){
      if(!gps)return null;
      const key=`${gps.latitude.toFixed(4)},${gps.longitude.toFixed(4)}`;if(this.cache.has(key))return this.cache.get(key);
      const wait=Math.max(0,1100-(Date.now()-this.lastCallAt));if(wait)await new Promise(r=>setTimeout(r,wait));this.lastCallAt=Date.now();
      try{
        const url=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(gps.latitude)}&lon=${encodeURIComponent(gps.longitude)}&addressdetails=1&accept-language=es`;
        const res=await fetch(url,{headers:{"Accept":"application/json"}});if(!res.ok)throw new Error("reverse");
        const j=await res.json(),a=j.address||{};
        const out={captureAddress:j.display_name||"",department:a.state||a.region||"",province:a.province||a.state_district||a.county||"",district:a.city_district||a.district||a.suburb||a.town||a.city||a.municipality||"",raw:a};
        this.cache.set(key,out);return out;
      }catch(_){return null}
    },
    tryMunicipalCandidates(r,geo){
      if(!geo)return;
      const deps=[geo.department,r.department].filter(Boolean),pros=[geo.province,r.province].filter(Boolean),dists=[geo.district,r.district].filter(Boolean);
      for(const d of deps)for(const p of pros)for(const s of dists){const m=O.Directory.byTerritory.get(O.Directory.key(d,p,s));if(m){r.department=m.department;r.province=m.province;r.district=m.district;r.ubigeo=m.ubigeo;return}}
      const nd=O.norm(geo.district);if(nd){
        const matches=O.municipalRows.filter(m=>O.norm(m.district)===nd&&(deps.length===0||deps.some(d=>O.norm(m.department)===O.norm(d))));
        if(matches.length===1){const m=matches[0];r.department=m.department;r.province=m.province;r.district=m.district;r.ubigeo=m.ubigeo}
      }
    },
    async enrich(r){
      const geo=await this.reverse(r.gps);if(geo){r.captureAddress=O.clean(geo.captureAddress)||r.captureAddress;r.address=r.captureAddress;this.tryMunicipalCandidates(r,geo)}
      O.Directory.apply(r);r.reviewStatus=O.reviewState(r);return r;
    }
  };

  O.Camera={
    async start(){
      this.stop();const constraints={audio:false,video:{facingMode:{ideal:O.facing},width:{ideal:1920},height:{ideal:1080}}};
      try{O.stream=await navigator.mediaDevices.getUserMedia(constraints);O.$("video").srcObject=O.stream;await O.$("video").play().catch(()=>{});O.$("cameraFallback").classList.add("hidden");O.$("cameraError").textContent="";await O.GPS.refresh(true);return true}
      catch(e){O.$("cameraFallback").classList.remove("hidden");O.$("cameraError").textContent=e?.name==="NotAllowedError"?"Permite el acceso a la cámara desde los permisos del navegador o de la app.":`No pude abrir la cámara: ${e?.message||e}`;return false}
    },
    stop(){O.stream?.getTracks?.().forEach(t=>t.stop());O.stream=null;const v=O.$("video");if(v)v.srcObject=null},
    pause(){if(O.stream)this.stop()},
    ensure(){if(!O.stream)setTimeout(()=>this.start(),120)},
    async switch(){O.facing=O.facing==="environment"?"user":"environment";await this.start();O.toast(O.facing==="environment"?"Cámara trasera":"Cámara frontal")},
    async capture(){
      const v=O.$("video");if(!O.stream||!v.videoWidth){O.toast("Primero abre la cámara");return}
      if(!O.gps||Date.now()-(O.gps.at||0)>25000)await O.GPS.refresh(true);
      const w=v.videoWidth,h=v.videoHeight,c=O.$("captureCanvas"),ctx=c.getContext("2d");c.width=w;c.height=h;ctx.drawImage(v,0,0,w,h);
      const original=c.toDataURL("image/jpeg",.9),photoCode=O.photoCode(),d=new Date(),coords=O.gps?`${O.gps.latitude.toFixed(6)}, ${O.gps.longitude.toFixed(6)}`:"GPS pendiente";
      const bar=Math.max(132,Math.round(h*.15)),grad=ctx.createLinearGradient(0,h-bar,0,h);grad.addColorStop(0,"rgba(2,8,18,0)");grad.addColorStop(.28,"rgba(2,8,18,.76)");grad.addColorStop(1,"rgba(2,8,18,.94)");
      ctx.fillStyle=grad;ctx.fillRect(0,h-bar,w,bar);const pad=Math.max(18,Math.round(w*.018));ctx.fillStyle="#52d9ff";ctx.font=`900 ${Math.max(24,Math.round(w*.025))}px Arial`;ctx.fillText("ONE SHOT 2",pad,h-bar+Math.max(40,Math.round(bar*.42)));
      ctx.fillStyle="#fff";ctx.font=`700 ${Math.max(18,Math.round(w*.017))}px Arial`;ctx.fillText(`${O.date(d)}  ${O.time(d)}  ·  ${photoCode}`,pad,h-bar+Math.max(70,Math.round(bar*.68)));ctx.fillStyle="#c9d9ed";ctx.font=`600 ${Math.max(15,Math.round(w*.014))}px Arial`;ctx.fillText(coords,pad,h-18);
      const stamped=c.toDataURL("image/jpeg",.9);
      const r=O.RecordModel.normalize({id:O.uid(),photoCode,verifyCode:O.verifyCode(),image:original,stampedImage:stamped,createdAt:new Date().toISOString(),fecha:O.date(d),hora:O.time(d),captureAddress:O.gps?`GPS ${coords}`:"Ubicación pendiente",gps:O.gps?{...O.gps}:null,accuracy:O.gps?.accuracy??null,altitude:O.gps?.altitude??null,type:"PENDIENTE",status:"Pendiente",party:"",observation:"",sourceWidth:w,sourceHeight:h,cameraFacing:O.facing,appVersion:O.version,appBuild:O.build,routeId:O.Route?.current?.id||""});
      await O.DB.put(r);O.records.unshift(r);O.lastId=r.id;O.$("captureToastCode").textContent=photoCode;O.$("captureToast").classList.add("show");setTimeout(()=>O.$("captureToast").classList.remove("show"),5200);
      O.Evidence?.renderAll();O.Route?.paint();O.Deliveries?.render();O.Reports?.paint();O.Fer?.setState("success");O.Fer?.say("Evidencia guardada. Voy a intentar ubicar el territorio mientras tú sigues trabajando.",false);O.toast("Evidencia guardada");
      O.Territory.enrich(r).then(async()=>{await O.DB.put(r);O.Evidence?.renderAll();O.Deliveries?.render();O.Reports?.paint()});
    }
  };

  O.Route={
    current:null,history:[],watchId:null,map:null,routeLayer:null,evidenceLayer:null,meMarker:null,historyLayer:null,
    load(){
      try{this.current=JSON.parse(localStorage.getItem("os2CurrentRoute")||"null")}catch(_){this.current=null}
      try{this.history=JSON.parse(localStorage.getItem("os2RouteHistory")||"[]");if(!Array.isArray(this.history))this.history=[]}catch(_){this.history=[]}
      if(!this.history.length){try{const old=JSON.parse(localStorage.getItem("oneshotSettings")||"{}");if(Array.isArray(old.routeHistory))this.history=old.routeHistory.map(x=>({...x,legacy:true}))}catch(_){}}
    },
    save(){try{localStorage.setItem("os2CurrentRoute",JSON.stringify(this.current));localStorage.setItem("os2RouteHistory",JSON.stringify(this.history.slice(0,100)))}catch(_){}},
    async start(){
      if(this.current?.active){O.toast("Ya existe un recorrido activo");return}
      const name=O.clean(O.$("routeName").value)||`Recorrido ${O.date()}`;await O.GPS.refresh(true);const p=O.gps?{latitude:O.gps.latitude,longitude:O.gps.longitude,at:Date.now(),accuracy:O.gps.accuracy}:null;
      this.current={id:O.uid(),name,active:true,startedAt:new Date().toISOString(),endedAt:null,points:p?[p]:[],distanceM:0};this.save();this.startWatch();this.paint();O.toast("Recorrido iniciado");O.Fer?.say(`Recorrido ${name} iniciado. Registraré por dónde pasa la brigada.`,false)
    },
    startWatch(){
      if(this.watchId!=null||!navigator.geolocation||!this.current?.active)return;
      this.watchId=navigator.geolocation.watchPosition(p=>{const pt={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy,at:Date.now()};O.gps={...pt,altitude:p.coords.altitude,heading:p.coords.heading};O.GPS.paint();const a=this.current.points.at(-1);if(!a||O.haversine(a,pt)>=8||pt.at-(a.at||0)>=20000){if(a)this.current.distanceM=(this.current.distanceM||0)+O.haversine(a,pt);this.current.points.push(pt);this.save();this.paintMap()}},()=>{}, {enableHighAccuracy:true,maximumAge:6000,timeout:12000});
    },
    stopWatch(){if(this.watchId!=null&&navigator.geolocation){navigator.geolocation.clearWatch(this.watchId);this.watchId=null}},
    finish(){
      if(!this.current?.active){O.toast("No hay recorrido activo");return}this.stopWatch();this.current.active=false;this.current.endedAt=new Date().toISOString();this.current.evidenceCount=O.records.filter(r=>r.routeId===this.current.id).length;this.history.unshift(this.current);this.current=null;this.save();this.paint();O.toast("Recorrido finalizado");O.Fer?.say("Recorrido finalizado. La cobertura y los hallazgos quedan guardados por separado.",false)
    },
    distance(route=this.current){return Number(route?.distanceM||0)},
    paint(){
      const active=!!this.current?.active;O.$("routeStatusChip").textContent=active?"ACTIVO":"INACTIVO";O.$("routeStatusChip").classList.toggle("warn",!active);O.$("startRouteBtn").disabled=active;O.$("finishRouteBtn").disabled=!active;
      const dist=this.distance();O.$("routeDistance").textContent=`${(dist/1000).toFixed(2)} km`;O.$("routePointCount").textContent=this.current?.points?.length||0;O.$("routeEvidenceCount").textContent=this.current?O.records.filter(r=>r.routeId===this.current.id).length:0;
      O.$("routeHud").textContent=active?`${(dist/1000).toFixed(2)} km · recorrido`:"Sin recorrido";O.$("routeHistoryCount").textContent=`${this.history.length} recorridos`;
      O.$("routeHistory").innerHTML=this.history.map((r,i)=>`<div class="routeHistoryItem"><div><b>${O.esc(r.name||`Recorrido ${i+1}`)}</b><small>${O.esc(String(r.startedAt||"").slice(0,10))} · ${((Number(r.distanceM)||0)/1000).toFixed(2)} km · ${Number(r.evidenceCount||0)} evidencias</small></div><button data-route-history="${i}">Ver</button></div>`).join("")||'<div class="emptyState show"><span>Aún no hay recorridos finalizados.</span></div>';
      O.$$('[data-route-history]').forEach(b=>b.onclick=()=>this.showHistory(Number(b.dataset.routeHistory)));this.paintMap()
    },
    initMap(){
      if(this.map||!window.L)return;this.map=L.map("coverageMap",{zoomControl:true}).setView([-12.0464,-77.0428],13);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(this.map);this.routeLayer=L.layerGroup().addTo(this.map);this.evidenceLayer=L.layerGroup().addTo(this.map);this.historyLayer=L.layerGroup().addTo(this.map)
    },
    paintMap(){
      if(O.view!=="coverage")return;this.initMap();if(!this.map)return;setTimeout(()=>this.map.invalidateSize(),40);this.routeLayer.clearLayers();this.evidenceLayer.clearLayers();this.historyLayer.clearLayers();
      const route=this.current,pts=(route?.points||[]).map(p=>[p.latitude,p.longitude]);if(pts.length){L.polyline(pts,{color:"#1e7bff",weight:5,opacity:.85}).addTo(this.routeLayer);this.map.fitBounds(L.latLngBounds(pts),{padding:[28,28],maxZoom:17})}
      const evid=O.records.filter(r=>Number.isFinite(Number(r.gps?.latitude))&&Number.isFinite(Number(r.gps?.longitude)));for(const r of evid){L.circleMarker([r.gps.latitude,r.gps.longitude],{radius:6,color:"#9b6700",weight:2,fillColor:"#f7b731",fillOpacity:.95}).bindPopup(`<b>${O.esc(r.party||"Sin partido")}</b><br>${O.esc(O.safeType(r))}<br>${O.esc(r.photoCode)}`).addTo(this.evidenceLayer)}
      if(O.gps){if(this.meMarker)this.meMarker.remove();this.meMarker=L.circleMarker([O.gps.latitude,O.gps.longitude],{radius:9,color:"#1e7bff",weight:4,fillColor:"#fff",fillOpacity:1}).addTo(this.map)}
      if(!pts.length&&O.gps)this.map.setView([O.gps.latitude,O.gps.longitude],15)
    },
    showHistory(i){
      const r=this.history[i];if(!r)return;O.view="coverage";this.initMap();this.historyLayer.clearLayers();const pts=(r.points||[]).map(p=>[p.latitude,p.longitude]);if(pts.length){L.polyline(pts,{color:"#7758ff",weight:5,opacity:.85}).addTo(this.historyLayer);this.map.fitBounds(L.latLngBounds(pts),{padding:[25,25],maxZoom:17})}
    }
  };
  O.Route.load();
})();