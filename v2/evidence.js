"use strict";
(()=> {
  const O=window.OS2;
  O.Evidence={
    visible(){
      const now=Date.now(),q=O.norm(O.search);
      return O.records.filter(r=>{
        const t=new Date(r.createdAt||`${r.fecha}T${r.hora||"00:00:00"}`).getTime();
        const period=O.filter==="all"||O.filter==="today"&&String(r.fecha||"")===O.date()||O.filter==="week"&&Number.isFinite(t)&&now-t<=7*86400000;
        if(!period)return false;
        const rs=O.reviewState(r),rf=O.reviewFilter;
        if(rf==="pending"&&rs!=="PENDIENTE")return false;if(rf==="location"&&rs!=="REVISAR_UBICACION")return false;if(rf==="ready"&&rs!=="REVISADA")return false;
        if(!q)return true;
        return [r.photoCode,r.party,r.district,r.type,r.captureAddress,r.observation,r.municipality].some(v=>O.norm(v).includes(q));
      })
    },
    counts(){const c={pending:0,location:0,ready:0,all:O.records.length};for(const r of O.records){const s=O.reviewState(r);s==="REVISADA"?c.ready++:s==="REVISAR_UBICACION"?c.location++:c.pending++}return c},
    renderAll(){this.renderStats();this.renderCarousel();this.renderList()},
    renderStats(){const c=this.counts();O.$("pendingCount").textContent=c.pending;O.$("locationCount").textContent=c.location;O.$("readyCount").textContent=c.ready;O.$("allCount").textContent=c.all;O.$("evidenceSubtitle").textContent=`${c.all} registradas · ${c.ready} listas`;O.$$('[data-review-filter]').forEach(b=>b.classList.toggle("active",b.dataset.reviewFilter===O.reviewFilter))},
    currentCarousel(){const data=this.visible();if(!data.length)return null;O.carouselIndex=Math.max(0,Math.min(O.carouselIndex,data.length-1));return data[O.carouselIndex]},
    renderCarousel(){
      const r=this.currentCarousel(),data=this.visible(),img=O.$("carouselImage");
      if(!r){img.removeAttribute("src");O.$("carouselTitle").textContent="Sin evidencias";O.$("carouselMeta").textContent="Toma una foto para comenzar.";O.$("carouselChips").innerHTML="";O.$("carouselPrev").disabled=true;O.$("carouselNext").disabled=true;return}
      img.src=O.imageOf(r);O.$("carouselTitle").textContent=r.party||"Sin organización identificada";O.$("carouselMeta").textContent=`${r.photoCode} · ${r.fecha} ${r.hora} · ${r.captureAddress||"Ubicación pendiente"}`;
      O.$("carouselChips").innerHTML=[O.safeType(r),O.reviewLabel(r),r.district||"Distrito pendiente"].map(x=>`<span>${O.esc(x)}</span>`).join("");O.$("carouselPrev").disabled=data.length<2;O.$("carouselNext").disabled=data.length<2
    },
    moveCarousel(dir){const data=this.visible();if(!data.length)return;O.carouselIndex=(O.carouselIndex+dir+data.length)%data.length;this.renderCarousel()},
    renderList(){
      const data=this.visible(),box=O.$("evidenceList"),empty=O.$("emptyEvidence");empty.classList.toggle("show",data.length===0);
      box.innerHTML=data.map(r=>`<article class="eCard" data-id="${O.esc(r.id)}"><img src="${O.esc(O.imageOf(r))}" alt="${O.esc(r.photoCode)}"><div class="eCardBody"><h3>${O.esc(r.party||"Sin organización")}</h3><p>${O.esc(r.photoCode)} · ${O.esc(r.fecha)} ${O.esc(r.hora)}</p><p>${O.esc(r.district||r.captureAddress||"Ubicación pendiente")}</p><div class="eCardMeta"><span>${O.esc(O.safeType(r))}</span><span>${O.esc(O.reviewLabel(r))}</span>${r.municipality?`<span>🏛 ${O.esc(r.municipality)}</span>`:""}</div><div class="eCardActions"><button data-action="view">Ver</button><button data-action="edit">Editar</button><button data-action="fer">Fer</button></div></div></article>`).join("");
      O.$$('[data-action]',box).forEach(btn=>btn.onclick=e=>{const card=e.currentTarget.closest("[data-id]"),id=card.dataset.id,a=e.currentTarget.dataset.action;if(a==="view")O.Viewer.open(id);else if(a==="edit")O.Editor.open(id);else O.Fer.startReview(id)})
    }
  };

  O.Viewer={
    open(id){
      const r=O.records.find(x=>x.id===id);if(!r)return;O.viewerId=id;O.$("viewerTitle").textContent=r.party||"Evidencia";O.$("viewerSubtitle").textContent=r.photoCode;O.$("viewerImage").src=O.imageOf(r);
      const capture=[r.captureAddress,r.department,r.province,r.district].filter(Boolean).join(" · "),muni=r.municipality?`${r.municipality} · ${r.municipalMayor||"Alcalde pendiente"}`:"Destino municipal pendiente";
      O.$("viewerBody").innerHTML=[
        ["Tipo / revisión",`${O.safeType(r)} · ${O.reviewLabel(r)}`],
        ["Ubicación de captura",capture||"Pendiente"],
        ["Destino municipal",muni],
        ["Dirección municipal",r.municipalAddress||"Pendiente"],
        ["Destino político",r.party||"Pendiente"],
        ["Observación",r.observation||"—"]
      ].map(x=>`<div class="viewerRow"><span>${O.esc(x[0])}</span><b>${O.esc(x[1])}</b></div>`).join("");O.$("viewerMapBtn").disabled=!O.mapsUrl(r);O.modal("viewerModal",true)
    }
  };

  O.Editor={
    current(){return O.records.find(x=>x.id===O.editId)||null},
    open(id){
      const r=O.records.find(x=>x.id===id);if(!r)return;O.editId=id;O.$("editCode").textContent=r.photoCode||"Evidencia";O.$("editImage").src=O.imageOf(r);O.$("editParty").value=r.party||"";O.$("editType").value=O.safeType(r);O.$("editStatus").value=["Activo","Retirada","Modificada","Pendiente"].includes(r.status)?r.status:"Pendiente";O.$("editDepartment").value=r.department||"";O.$("editProvince").value=r.province||"";O.$("editDistrict").value=r.district||"";O.$("editObservation").value=r.observation||"";this.paintDestination(r);O.modal("viewerModal",false);O.modal("editModal",true)
    },
    populateLists(){
      O.$("partyList").innerHTML=O.partyNames().map(x=>`<option value="${O.esc(x)}"></option>`).join("");
      const deps=[...new Set(O.municipalRows.map(m=>m.department))].sort();O.$("departmentList").innerHTML=deps.map(x=>`<option value="${O.esc(x)}"></option>`).join("");
      this.refreshTerritoryLists()
    },
    refreshTerritoryLists(){
      const dep=O.norm(O.$("editDepartment")?.value),pro=O.norm(O.$("editProvince")?.value);
      const rows=O.municipalRows.filter(m=>(!dep||O.norm(m.department)===dep));
      const pros=[...new Set(rows.map(m=>m.province))].sort();O.$("provinceList").innerHTML=pros.map(x=>`<option value="${O.esc(x)}"></option>`).join("");
      const drows=rows.filter(m=>(!pro||O.norm(m.province)===pro));const ds=[...new Set(drows.map(m=>m.district))].sort();O.$("districtList").innerHTML=ds.map(x=>`<option value="${O.esc(x)}"></option>`).join("")
    },
    paintDestination(r=this.current()){
      if(!r)return;O.$("captureAddressPreview").textContent=r.captureAddress||"Ubicación pendiente";O.$("municipalityPreview").textContent=r.municipality||"Pendiente";O.$("mayorPreview").textContent=r.municipalMayor?`${r.municipalMayorRole||"ALCALDE"} · ${r.municipalMayor}`:"Sin match municipal";O.$("municipalAddressPreview").textContent=r.municipalAddress||"";O.$("partyDestinationPreview").textContent=r.party||"Pendiente"
    },
    draftFromForm(){
      const r=this.current();if(!r)return null;r.party=O.clean(O.$("editParty").value);r.type=O.safeType({type:O.$("editType").value});r.status=O.$("editStatus").value;r.department=O.clean(O.$("editDepartment").value);r.province=O.clean(O.$("editProvince").value);r.district=O.clean(O.$("editDistrict").value);r.observation=O.clean(O.$("editObservation").value);O.Directory.apply(r);r.reviewStatus=O.reviewState(r);this.paintDestination(r);return r
    },
    recalc(){const r=this.draftFromForm();if(!r)return;this.refreshTerritoryLists();this.paintDestination(r);O.toast(r.municipality?`Destino: ${r.municipality}`:"Sin match exacto · revisa Departamento, Provincia y Distrito")},
    async save(close=true){
      const r=this.draftFromForm();if(!r)return;r.reviewedAt=O.reviewState(r)==="REVISADA"?new Date().toISOString():r.reviewedAt||"";await O.DB.put(r);if(close)O.modal("editModal",false);O.Evidence.renderAll();O.Deliveries.render();O.Reports.paint();O.Route.paint();O.Fer?.setState("success");O.toast("Cambios guardados");return r
    },
    async remove(){const r=this.current();if(!r||!confirm(`¿Eliminar ${r.photoCode}?`))return;await O.DB.remove(r.id);O.records=O.records.filter(x=>x.id!==r.id);O.modal("editModal",false);O.carouselIndex=0;O.Evidence.renderAll();O.Deliveries.render();O.Reports.paint();O.Route.paint();O.toast("Evidencia eliminada")}
  };

  O.Deliveries={
    group(records,keyFn){const m=new Map();for(const r of records){const k=keyFn(r);if(!k)continue;if(!m.has(k))m.set(k,[]);m.get(k).push(r)}return [...m.entries()].sort((a,b)=>b[1].length-a[1].length)},
    render(){
      if(!O.$("municipalGroups"))return;const ready=O.records.filter(O.deliveryReady),blocked=O.records.length-ready.length;O.$("municipalReadyCount").textContent=ready.filter(r=>r.municipality).length;O.$("partyReadyCount").textContent=ready.filter(r=>r.party).length;O.$("deliveryBlockedCount").textContent=blocked;
      const mg=this.group(ready,r=>r.municipality),pg=this.group(ready,r=>r.party);
      O.$("municipalGroups").innerHTML=mg.map(([name,list])=>{const r=list[0];return`<div class="deliveryGroup"><div><b>${O.esc(name)}</b><small>${O.esc(r.municipalMayor||"")} · ${O.esc(r.municipalAddress||"")}</small><span class="status">LISTA PARA OFICIO</span></div><strong>${list.length}</strong></div>`}).join("")||'<div class="emptyState show"><span>Aún no hay evidencias listas con destino municipal.</span></div>';
      O.$("partyGroups").innerHTML=pg.map(([name,list])=>`<div class="deliveryGroup"><div><b>${O.esc(name)}</b><small>Solicitar sustento de gasto de propaganda</small><span class="status">LISTA PARA SOLICITUD</span></div><strong>${list.length}</strong></div>`).join("")||'<div class="emptyState show"><span>Aún no hay evidencias listas por organización.</span></div>'
    }
  };
})();