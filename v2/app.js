"use strict";
(()=> {
  const O=window.OS2;
  O.App={
    view(name){
      O.view=name;document.body.dataset.view=name;O.$$(".view").forEach(v=>v.classList.toggle("active",v.dataset.view===name));O.$$(".bottomNav [data-target]").forEach(b=>b.classList.toggle("active",b.dataset.target===name));
      if(name!=="camera")O.Camera.pause();else O.Camera.ensure();
      if(name==="evidence")O.Evidence.renderAll();if(name==="coverage"){O.Route.paint();setTimeout(()=>O.Route.paintMap(),80)}if(name==="deliveries")O.Deliveries.render();if(name==="reports")O.Reports.paint();O.Fer.context(false)
    }
  };
  function bind(){
    O.$("startCameraBtn").onclick=()=>O.Camera.start();O.$("shootBtn").onclick=()=>O.Camera.capture();O.$("switchCameraBtn").onclick=()=>O.Camera.switch();O.$("refreshGpsBtn").onclick=()=>O.GPS.refresh(false);
    O.$("syncBtn").onclick=async()=>{await O.GPS.refresh(true);O.Evidence.renderAll();O.Route.paint();O.Deliveries.render();O.toast("ONE SHOT 2 actualizado")};
    O.$("lastShotBtn").onclick=()=>{const r=O.records[0];if(r){O.App.view("evidence");O.carouselIndex=0;O.Evidence.renderCarousel()}else O.toast("Aún no hay evidencias")};
    O.$("routeQuickBtn").onclick=()=>O.App.view("coverage");O.$("cameraInfoBtn").onclick=()=>{O.Fer.open(true);O.Fer.say("En Cámara me mantengo fuera de la vista para no tapar la evidencia. Si necesitas ayuda, te acompaño desde aquí.",false)};
    O.$("captureEditBtn").onclick=()=>{if(O.lastId)O.Editor.open(O.lastId)};
    O.$$(".bottomNav [data-target]").forEach(b=>b.onclick=()=>O.App.view(b.dataset.target));
    O.$("carouselPrev").onclick=()=>O.Evidence.moveCarousel(-1);O.$("carouselNext").onclick=()=>O.Evidence.moveCarousel(1);
    O.$("carouselViewBtn").onclick=()=>{const r=O.Evidence.currentCarousel();if(r)O.Viewer.open(r.id)};O.$("carouselEditBtn").onclick=()=>{const r=O.Evidence.currentCarousel();if(r)O.Editor.open(r.id)};O.$("carouselFerBtn").onclick=()=>{const r=O.Evidence.currentCarousel();if(r)O.Fer.startReview(r.id)};
    O.$$('[data-filter]').forEach(b=>b.onclick=()=>{O.filter=b.dataset.filter;O.$$('[data-filter]').forEach(x=>x.classList.toggle("active",x===b));O.carouselIndex=0;O.Evidence.renderAll()});
    O.$$('[data-review-filter]').forEach(b=>b.onclick=()=>{O.reviewFilter=b.dataset.reviewFilter;O.carouselIndex=0;O.Evidence.renderAll()});
    O.$("searchInput").oninput=e=>{O.search=e.target.value;O.carouselIndex=0;O.Evidence.renderAll()};O.$("selectLatestBtn").onclick=()=>{O.carouselIndex=0;O.Evidence.renderCarousel()};
    O.$("viewerEditBtn").onclick=()=>O.Editor.open(O.viewerId);O.$("viewerMapBtn").onclick=()=>{const r=O.records.find(x=>x.id===O.viewerId),url=r&&O.mapsUrl(r);if(url)open(url,"_blank")};
    O.$("editForm").onsubmit=e=>{e.preventDefault();O.Editor.save(true)};O.$("deleteEvidenceBtn").onclick=()=>O.Editor.remove();O.$("recalcMunicipalBtn").onclick=()=>O.Editor.recalc();O.$("editWithFerBtn").onclick=()=>{const id=O.editId;O.modal("editModal",false);if(id)O.Fer.startReview(id)};
    O.$("editDepartment").oninput=()=>O.Editor.refreshTerritoryLists();O.$("editProvince").oninput=()=>O.Editor.refreshTerritoryLists();O.$("editParty").oninput=()=>{const r=O.Editor.current();if(r){r.party=O.clean(O.$("editParty").value);O.Editor.paintDestination(r)}};
    O.$$('[data-close]').forEach(b=>b.onclick=()=>O.modal(b.dataset.close,false));O.$$(".modal").forEach(m=>m.onclick=e=>{if(e.target===m)O.modal(m.id,false)});
    O.$("startRouteBtn").onclick=()=>O.Route.start();O.$("finishRouteBtn").onclick=()=>O.Route.finish();
    O.$("exportExcelBtn").onclick=()=>O.Reports.excel();O.$("exportBackupBtn").onclick=()=>O.Reports.backup();
    O.$("ferFab").onclick=()=>O.Fer.open(true);O.$("ferClose").onclick=()=>O.Fer.open(false);O.$("ferMicBtn").onclick=()=>O.Fer.toggleVoice();O.$("ferSendBtn").onclick=()=>{const t=O.$("ferInput").value;O.$("ferInput").value="";O.Fer.command(t)};O.$("ferInput").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();O.$("ferSendBtn").click()}};
    document.addEventListener("visibilitychange",()=>{if(document.hidden){O.Camera.pause();O.Route.stopWatch()}else{if(O.view==="camera")O.Camera.ensure();if(O.Route.current?.active)O.Route.startWatch()}});
    window.addEventListener("beforeunload",()=>{O.Camera.stop();O.Route.stopWatch()});
  }
  async function boot(){
    O.Editor.populateLists();bind();setInterval(()=>{const d=new Date();O.$("hudTime").textContent=O.time(d);O.$("hudDate").textContent=O.fullDate(d)},1000);
    const ok=await O.DB.open();if(ok)O.records=O.RecordModel.sort((await O.DB.load()).map(O.RecordModel.normalize));else{try{O.records=O.RecordModel.sort((JSON.parse(localStorage.getItem("oneshotRecordsLite")||"[]")||[]).map(O.RecordModel.normalize));O.toast("Base principal no disponible · usando respaldo lite")}catch(_){O.records=[]}}
    O.Evidence.renderAll();O.Deliveries.render();O.Reports.paint();O.GPS.paint();O.Route.paint();if(O.Route.current?.active)O.Route.startWatch();
    if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js").catch(()=>{});
    setTimeout(()=>O.$("splash").classList.add("hide"),850);setTimeout(()=>O.Camera.start(),1050);setTimeout(()=>O.Fer.say(`ONE SHOT 2 listo. Encontré ${O.records.length} evidencias.`,false),1400)
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
})();