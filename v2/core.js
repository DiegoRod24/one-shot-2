"use strict";
(()=> {
  const O=window.OS2=window.OS2||{};
  Object.assign(O,{
    version:"2.0.0-alpha.2",build:"os2-field-intelligence-02",
    dbName:"oneshotEvidenceDB_v2",storeName:"records",db:null,records:[],
    view:"camera",filter:"today",reviewFilter:"all",search:"",carouselIndex:0,
    gps:null,stream:null,facing:"environment",lastId:null,viewerId:null,editId:null,
    settings:{company:"ONPE",process:"ERM",nearbyRadiusM:20},
    partyCatalog:Array.isArray(window.ONE_PARTY_CATALOG_V631)?window.ONE_PARTY_CATALOG_V631:[],
    municipalRows:(Array.isArray(window.ONE_MUNICIPAL_DIRECTORY_ROWS)?window.ONE_MUNICIPAL_DIRECTORY_ROWS:[]).map(x=>({ubigeo:x[0]||"",department:x[1]||"",province:x[2]||"",district:x[3]||"",role:x[4]||"",mayor:x[5]||"",address:x[6]||"",cityCode:x[7]||"",phone:x[8]||"",email:x[9]||""}))
  });
  O.$=id=>document.getElementById(id);
  O.$$=(q,r=document)=>Array.from(r.querySelectorAll(q));
  O.norm=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toUpperCase().replace(/\s+/g," ");
  O.clean=v=>{const s=String(v??"").trim();return !s||["31","UNDEFINED","NULL","N/A","NA","USAR SUGERENCIAS"].includes(O.norm(s))?"":s};
  O.esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  O.date=d=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Lima",year:"numeric",month:"2-digit",day:"2-digit"}).format(d||new Date());
  O.time=d=>new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(d||new Date());
  O.fullDate=d=>new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",weekday:"short",day:"2-digit",month:"short",year:"numeric"}).format(d||new Date()).replace(/\./g,"");
  O.uid=()=>crypto.randomUUID?.()||`os2-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  O.photoCode=()=>`OS2-${O.date().replaceAll("-","")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  O.verifyCode=()=>Math.random().toString(36).slice(2,10).toUpperCase();
  O.toast=(msg,ms=2400)=>{const e=O.$("toast");if(!e)return;e.textContent=msg;e.classList.add("show");clearTimeout(O.toastTimer);O.toastTimer=setTimeout(()=>e.classList.remove("show"),ms)};
  O.modal=(id,open=true)=>{const e=O.$(id);if(!e)return;e.classList.toggle("open",open);e.setAttribute("aria-hidden",open?"false":"true")};
  O.mapsUrl=r=>{const a=Number(r?.gps?.latitude),b=Number(r?.gps?.longitude);return Number.isFinite(a)&&Number.isFinite(b)?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a},${b}`)}`:""};
  O.haversine=(a,b)=>{if(!a||!b)return 0;const R=6371000,toRad=x=>x*Math.PI/180,dLat=toRad(b.latitude-a.latitude),dLon=toRad(b.longitude-a.longitude),la1=toRad(a.latitude),la2=toRad(b.latitude);const q=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(q))};
  O.allowedTypes=new Set(["PANEL","BANNER","PINTA"]);
  O.safeType=r=>{const raw=O.norm(r?.type||r?.evidenceType||r?.tipoEvidencia);return O.allowedTypes.has(raw)?raw:"PENDIENTE"};
  O.reviewState=r=>{
    const complete=!!O.clean(r?.party)&&O.allowedTypes.has(O.safeType(r));
    const hasTerritory=!!O.clean(r?.department)&&!!O.clean(r?.province)&&!!O.clean(r?.district);
    const hasMunicipality=!!O.clean(r?.municipality);
    if(!complete)return"PENDIENTE";
    if(!hasTerritory||!hasMunicipality||Number(r?.gps?.accuracy??r?.accuracy??0)>80)return"REVISAR_UBICACION";
    return"REVISADA";
  };
  O.reviewLabel=r=>O.reviewState(r)==="REVISADA"?"REVISADA":O.reviewState(r)==="REVISAR_UBICACION"?"REVISAR UBICACIÓN":"FALTA REVISAR";
  O.deliveryReady=r=>O.reviewState(r)==="REVISADA";
  O.imageOf=r=>r?.stampedImage||r?.image||"";
  O.idProx=r=>{const a=Number(r?.gps?.latitude),b=Number(r?.gps?.longitude);return Number.isFinite(a)&&Number.isFinite(b)?`${a.toFixed(4)}-${b.toFixed(4)}`:""};
  O.nomenclature=r=>[String(r?.fecha||"").split("-").reverse().join("-"),String(r?.hora||"").replace(/:/g,"."),O.clean(r?.party),O.clean(r?.department),O.clean(r?.province),O.clean(r?.district),O.safeType(r)].filter(Boolean).join("_").replace(/[\\/:*?"<>|]/g," ").replace(/\s+/g," ").trim();
  O.partyNames=()=>[...new Set(O.partyCatalog.map(x=>O.clean(x.name)).filter(Boolean))];

  O.Directory={
    byUbigeo:new Map(),byTerritory:new Map(),
    key:(d,p,s)=>`${O.norm(d)}|${O.norm(p)}|${O.norm(s)}`,
    init(){
      this.byUbigeo.clear();this.byTerritory.clear();
      for(const m of O.municipalRows){this.byUbigeo.set(String(m.ubigeo||""),m);this.byTerritory.set(this.key(m.department,m.province,m.district),m)}
    },
    municipalityName(m){if(!m)return"";return /PROVINCIAL/i.test(m.role||"")?`Municipalidad Provincial de ${m.province}`:`Municipalidad Distrital de ${m.district}`},
    match(r){
      const ub=String(r?.ubigeo||"").replace(/\D/g,"").slice(0,6);
      let m=ub.length===6?this.byUbigeo.get(ub):null,source=m?"UBIGEO":"";
      if(!m&&r?.department&&r?.province&&r?.district){m=this.byTerritory.get(this.key(r.department,r.province,r.district));source=m?"DEPARTAMENTO + PROVINCIA + DISTRITO":""}
      return{m:m||null,source:source||"SIN MATCH"};
    },
    apply(r){
      if(!r)return null;const {m,source}=this.match(r);
      if(m){
        r.ubigeo=m.ubigeo;r.department=O.clean(r.department)||m.department;r.province=O.clean(r.province)||m.province;r.district=O.clean(r.district)||m.district;
        r.municipality=this.municipalityName(m);r.municipalMayor=m.mayor;r.municipalMayorRole=m.role;r.municipalAddress=m.address;r.municipalPhone=m.phone;r.municipalEmail=m.email;
        r.municipalMatchSource=source;r.municipalMatchConfidence=source==="UBIGEO"?"ALTA":"MEDIA";r.municipalMatchedAt=new Date().toISOString();
      }else{
        r.municipality="";r.municipalMayor="";r.municipalMayorRole="";r.municipalAddress="";r.municipalPhone="";r.municipalEmail="";r.municipalMatchSource="SIN MATCH";r.municipalMatchConfidence="BAJA";
      }
      return m;
    }
  };

  O.RecordModel={
    normalize(raw){
      const r={...(raw||{})};r.id=r.id||r.evidenceId||r.photoCode||O.uid();r.photoCode=r.photoCode||r.codigoFoto||r.code||r.id;r.verifyCode=r.verifyCode||r.verifier||r.codigoVerificacion||"";
      r.image=r.image||r.originalImage||r.original||r.photo||r.dataUrl||"";r.stampedImage=r.stampedImage||r.evidenceImage||r.watermarkedImage||r.markedImage||"";
      r.createdAt=r.createdAt||r.iso||new Date().toISOString();r.fecha=r.fecha||r.date||String(r.createdAt).slice(0,10);r.hora=r.hora||r.time||"";
      r.captureAddress=O.clean(r.captureAddress||r.address||r.ubicacion||r.direccionCaptura)||"Ubicación pendiente";r.address=r.captureAddress;
      r.party=O.clean(r.party||r.partido||r.nota);const rawType=O.norm(r.type||r.evidenceType||r.tipoEvidencia);if(rawType&&!O.allowedTypes.has(rawType)&&rawType!=="PENDIENTE")r.legacyType=r.legacyType||rawType;r.type=O.allowedTypes.has(rawType)?rawType:"PENDIENTE";
      r.status=O.clean(r.status||r.estado)||"Pendiente";r.observation=O.clean(r.observation||r.observacion);
      r.department=O.clean(r.department||r.region||r.departamento);r.province=O.clean(r.province||r.provincia);r.district=O.clean(r.district||r.distrito);r.ubigeo=String(r.ubigeo||"").replace(/\D/g,"").slice(0,6);
      if(!r.gps){const lat=Number(r.latitude??r.lat),lon=Number(r.longitude??r.lon);if(Number.isFinite(lat)&&Number.isFinite(lon))r.gps={latitude:lat,longitude:lon,accuracy:Number(r.accuracy)||null}}
      r.accuracy=r.accuracy??r.gps?.accuracy??null;r.altitude=r.altitude??r.gps?.altitude??null;
      r.municipalDeliveryStatus=O.clean(r.municipalDeliveryStatus)||"PENDIENTE";r.partyDeliveryStatus=O.clean(r.partyDeliveryStatus)||"PENDIENTE";r.process=O.clean(r.process||r.electionProcess||r.proceso)||"ERM";
      O.Directory.apply(r);r.reviewStatus=O.reviewState(r);r.updatedAt=r.updatedAt||r.createdAt;return r;
    },
    sort(list){return [...(list||[])].sort((a,b)=>String(b.createdAt||`${b.fecha} ${b.hora}`).localeCompare(String(a.createdAt||`${a.fecha} ${a.hora}`)))}
  };

  O.DB={
    open(){return new Promise(resolve=>{try{const q=indexedDB.open(O.dbName,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(O.storeName))q.result.createObjectStore(O.storeName,{keyPath:"id"})};q.onsuccess=()=>{O.db=q.result;resolve(true)};q.onerror=()=>resolve(false)}catch(_){resolve(false)}})},
    store(mode="readonly"){return O.db?.transaction(O.storeName,mode).objectStore(O.storeName)},
    load(){return new Promise(resolve=>{if(!O.db)return resolve([]);const q=this.store().getAll();q.onsuccess=()=>resolve(q.result||[]);q.onerror=()=>resolve([])})},
    put(r){return new Promise(resolve=>{if(!O.db)return resolve(false);r.updatedAt=new Date().toISOString();const q=this.store("readwrite").put(r);q.onsuccess=()=>resolve(true);q.onerror=()=>resolve(false)})},
    remove(id){return new Promise(resolve=>{if(!O.db)return resolve(false);const q=this.store("readwrite").delete(id);q.onsuccess=()=>resolve(true);q.onerror=()=>resolve(false)})}
  };

  O.Directory.init();
})();