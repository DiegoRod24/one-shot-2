/* ONE SHOT v6.4.6 · CANONICAL ERM REPORT */
(()=>{
'use strict';
if(window.ONE_V646_REPORTS)return;
const BUILD='oneshot-v6.4.6-stability-ux-repair-01';
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const junk=new Set(['31','UNDEFINED','NULL','N/A','NA','USAR SUGERENCIAS']);
const clean=v=>{const s=String(v??'').trim();return !s||junk.has(N(s))?'':s;};
const rules=()=>window.ONE_V646_CORE?.FieldRules;
const captureAddress=r=>rules()?.captureAddress(r)||clean(r?.captureAddress||r?.address);
const safeType=r=>rules()?.safeType(r)||(['PANEL','BANNER','PINTA'].includes(N(r?.type))?N(r.type):'PENDIENTE');
const reviewLabel=r=>rules()?.reviewLabel(r)||clean(r?.reviewStatus)||'FALTA REVISAR';
const idProx=r=>rules()?.idProx(r)||'';
const nomenclature=r=>rules()?.nomenclature(r)||'';
const mapUrl=r=>{try{return Reports.mapsUrl(r);}catch(_){const a=Number(r?.gps?.latitude),b=Number(r?.gps?.longitude);return Number.isFinite(a)&&Number.isFinite(b)?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a},${b}`)}`:'';}};
const styleHead=(ws,color='FF082B64')=>{const row=ws.getRow(1);row.height=30;row.font={bold:true,color:{argb:'FFFFFFFF'},size:10};row.fill={type:'pattern',pattern:'solid',fgColor:{argb:color}};row.alignment={vertical:'middle',horizontal:'center',wrapText:true};row.border={bottom:{style:'medium',color:{argb:'FF2F6BFF'}}};};
const hyperlink=(cell,text,url,center=false)=>{if(url){cell.value={text:String(text??''),hyperlink:url};cell.font={color:{argb:'FF1D64C8'},underline:true};}else cell.value=text??'';cell.alignment={vertical:'middle',horizontal:center?'center':'left',wrapText:true};};
const imageData=r=>r?.stampedImage||r?.rescuedImage||r?.image||'';
const imageInfo=data=>new Promise(resolve=>{try{const im=new Image();im.onload=()=>resolve({width:im.naturalWidth||1,height:im.naturalHeight||1});im.onerror=()=>resolve({width:4,height:3});im.src=data;}catch(_){resolve({width:4,height:3});}});
const extension=data=>/^data:image\/png/i.test(String(data||''))?'png':'jpeg';

async function addPhoto(wb,ws,rowNo,r){
  const data=imageData(r);if(!data||!String(data).includes(','))return;
  try{
    const base64=String(data).split(',')[1],dim=await imageInfo(data),aspect=Math.max(.15,Math.min(8,dim.width/dim.height)),boxW=188,boxH=126;let w=boxW,h=w/aspect;if(h>boxH){h=boxH;w=h*aspect;}
    const id=wb.addImage({base64,extension:extension(data)});ws.addImage(id,{tl:{col:1.08,row:rowNo-0.93},ext:{width:w,height:h},editAs:'oneCell'});
  }catch(e){console.warn('ONE SHOT v6.4.6 foto Excel',r?.photoCode,e);}
}

function proximityCounts(data){const counts={};for(const r of data){const k=idProx(r);if(k)counts[k]=(counts[k]||0)+1;}return counts;}

async function makeExcel(){
  if(!window.ExcelJS)throw new Error('ExcelJS no está disponible');
  const data=(Evidence.selectedForReport?.()||[]).slice();if(!data.length)throw new Error('No hay evidencias para exportar');
  for(const r of data){try{window.ONE_V646_CORE?.Municipal?.apply(r,{touch:false});}catch(_){}}
  const prox=proximityCounts(data),wb=new ExcelJS.Workbook();wb.creator='ONE SHOT';wb.lastModifiedBy='ONE SHOT v6.4.6';wb.created=new Date();

  /* 1. Hoja compatible con el consolidado ERM real. */
  const ws=wb.addWorksheet('Todo',{views:[{state:'frozen',ySplit:1}]});
  ws.columns=[
    {header:'ID',key:'id',width:7},{header:'Foto',key:'foto',width:27},{header:'Fecha',key:'fecha',width:13},{header:'Hora',key:'hora',width:12},
    {header:'Ubicación',key:'ubicacion',width:46},{header:'Empresa',key:'empresa',width:18},{header:'Nota',key:'nota',width:34},{header:'Lat/Long',key:'latlong',width:29},
    {header:'Clima',key:'clima',width:13},{header:'Altitud',key:'altitud',width:13},{header:'Zona',key:'zona',width:20},{header:'Nomenclatura',key:'nomenclatura',width:68},
    {header:'Latitud',key:'lat',width:18},{header:'Longitud',key:'lon',width:18},{header:'Región',key:'region',width:18},{header:'Provincia',key:'provincia',width:20},
    {header:'Distrito',key:'distrito',width:22},{header:'Dirección',key:'direccion',width:42},{header:'Alcalde',key:'alcalde',width:34},{header:'Tipo',key:'tipo',width:14},
    {header:'Fórmula',key:'formula',width:68},{header:'ID_Prox',key:'idprox',width:25},{header:'Duplicado',key:'duplicado',width:14},{header:'Proceso',key:'proceso',width:12}
  ];styleHead(ws);ws.autoFilter={from:'A1',to:'X1'};
  for(let i=0;i<data.length;i++){
    const r=data[i],rowNo=i+2,lat=Number(r?.gps?.latitude),lon=Number(r?.gps?.longitude),gps=Number.isFinite(lat)&&Number.isFinite(lon),url=mapUrl(r),proxId=idProx(r),nom=nomenclature(r);
    const row=ws.addRow({
      id:i+1,foto:'',fecha:r.fecha||'',hora:r.hora||'',ubicacion:captureAddress(r),empresa:clean(r.company||r.empresa),nota:clean(r.party),latlong:gps?`${lat.toFixed(6)}, ${lon.toFixed(6)}`:'',
      clima:clean(r.weather||r.clima)||'-',altitud:r.altitude!=null&&Number.isFinite(Number(r.altitude))?`${Math.round(Number(r.altitude))} m`:'-',zona:clean(r.zone||r.zona),nomenclatura:nom,
      lat:gps?lat:'',lon:gps?lon:'',region:clean(r.department||r.region),provincia:clean(r.province),distrito:clean(r.district),direccion:clean(r.municipalAddress),alcalde:clean(r.municipalMayor),tipo:safeType(r),
      formula:nom,idprox:proxId,duplicado:proxId&&prox[proxId]>1?'Posible':'Único',proceso:clean(r.electionProcess||r.process)||State.settings.activeProcess||'ERM'
    });
    row.height=96;row.alignment={vertical:'middle',wrapText:true};if(i%2===0)row.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF8FAFD'}};
    hyperlink(ws.getCell(rowNo,5),captureAddress(r)||'Ubicación pendiente',url);hyperlink(ws.getCell(rowNo,8),gps?`${lat.toFixed(6)}, ${lon.toFixed(6)}`:'',url,true);hyperlink(ws.getCell(rowNo,13),gps?lat:'',url,true);hyperlink(ws.getCell(rowNo,14),gps?lon:'',url,true);
    await addPhoto(wb,ws,rowNo,r);
  }
  ws.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,paperSize:9,margins:{left:.25,right:.25,top:.45,bottom:.45,header:.2,footer:.2}};
  ws.headerFooter={oddHeader:'&L&14&BONE SHOT&RConsolidado de evidencias ERM',oddFooter:'&LUna toma. Evidencia real.&C&P de &N&R&D &T'};

  /* 2. Seguimiento: la misma evidencia tiene destino municipal y político. */
  const follow=wb.addWorksheet('SEGUIMIENTO_ENTREGAS',{views:[{state:'frozen',ySplit:1}]});
  follow.columns=[
    {header:'CÓDIGO',key:'code',width:25},{header:'PARTIDO / DESTINO POLÍTICO',key:'party',width:34},{header:'TIPO',key:'type',width:14},{header:'REGIÓN',key:'dep',width:18},{header:'PROVINCIA',key:'pro',width:20},{header:'DISTRITO',key:'dis',width:22},{header:'UBIGEO',key:'ub',width:12},
    {header:'MUNICIPALIDAD DESTINO',key:'mun',width:36},{header:'ALCALDE / ENCARGADO',key:'mayor',width:34},{header:'DIRECCIÓN MUNICIPAL',key:'maddr',width:42},{header:'TELÉFONO',key:'phone',width:20},{header:'CORREO',key:'mail',width:42},
    {header:'FUENTE MATCH',key:'source',width:30},{header:'CONFIANZA',key:'conf',width:14},{header:'REVISIÓN',key:'review',width:21},{header:'PROXIMIDAD',key:'prox',width:15},{header:'MAPA CAPTURA',key:'map',width:18}
  ];styleHead(follow,'FF173E76');follow.autoFilter={from:'A1',to:'Q1'};
  data.forEach((r,i)=>{const url=mapUrl(r),p=idProx(r),row=follow.addRow({code:r.photoCode||'',party:clean(r.party),type:safeType(r),dep:clean(r.department||r.region),pro:clean(r.province),dis:clean(r.district),ub:/^\d{6}$/.test(String(r.ubigeo||''))?String(r.ubigeo):'',mun:clean(r.municipality),mayor:clean(r.municipalMayor),maddr:clean(r.municipalAddress),phone:clean(r.municipalPhone),mail:clean(r.municipalEmail),source:clean(r.municipalMatchSource),conf:clean(r.municipalMatchConfidence),review:reviewLabel(r),prox:p&&prox[p]>1?'Posible':'Único',map:url?'Abrir ubicación':''});if(url)hyperlink(follow.getCell(i+2,17),'📍 Abrir ubicación',url,true);row.alignment={vertical:'middle',wrapText:true};});

  /* 3. Datos técnicos: auditable, sin ensuciar la entrega. */
  const tech=wb.addWorksheet('DATOS_TECNICOS',{views:[{state:'frozen',ySplit:1}]});
  tech.columns=[
    {header:'CÓDIGO',key:'code',width:25},{header:'ID',key:'id',width:38},{header:'CREADO',key:'created',width:25},{header:'FECHA',key:'date',width:13},{header:'HORA',key:'time',width:13},{header:'FUENTE HORARIA',key:'timeSource',width:20},
    {header:'DIRECCIÓN CAPTURA',key:'captureAddress',width:48},{header:'LATITUD',key:'lat',width:18},{header:'LONGITUD',key:'lon',width:18},{header:'PRECISIÓN',key:'accuracy',width:13},{header:'ALTITUD',key:'altitude',width:13},{header:'RUMBO',key:'heading',width:14},
    {header:'RESOLUCIÓN',key:'resolution',width:18},{header:'ORIENTACIÓN FOTO',key:'photoOrientation',width:20},{header:'ORIENTACIÓN EQUIPO',key:'deviceOrientation',width:20},{header:'LENTE',key:'camera',width:28},{header:'ZOOM',key:'zoom',width:10},
    {header:'SHA-256 ORIGINAL',key:'sourceHash',width:68},{header:'SHA-256 MARCADA',key:'stampedHash',width:68},{header:'VERIFICADOR',key:'verify',width:18},{header:'UBIGEO',key:'ubigeo',width:12},{header:'FUENTE MUNICIPAL',key:'source',width:30},{header:'CONFIANZA MATCH',key:'confidence',width:18},
    {header:'MUNICIPALIDAD',key:'municipality',width:36},{header:'ALCALDE / ENCARGADO',key:'mayor',width:34},{header:'DIRECCIÓN MUNICIPAL',key:'maddr',width:42},{header:'PARTIDO',key:'party',width:34},{header:'TIPO',key:'type',width:14},{header:'TIPO LEGACY',key:'legacy',width:18},
    {header:'ESTADO FÍSICO',key:'status',width:16},{header:'ESTADO REVISIÓN',key:'review',width:22},{header:'REVISOR',key:'reviewer',width:24},{header:'ROUTE ID',key:'route',width:38},{header:'MISSION ID',key:'mission',width:38},{header:'FECHA REVISIÓN',key:'reviewedAt',width:25},{header:'APP BUILD',key:'build',width:40}
  ];styleHead(tech,'FF263B5F');tech.autoFilter={from:'A1',to:`${tech.getColumn(tech.columnCount).letter}1`};
  data.forEach(r=>tech.addRow({code:r.photoCode||'',id:r.id||'',created:r.createdAt||'',date:r.fecha||'',time:r.hora||'',timeSource:r.timeSource||'',captureAddress:captureAddress(r),lat:r.gps?.latitude??'',lon:r.gps?.longitude??'',accuracy:r.accuracy??r.gps?.accuracy??'',altitude:r.altitude??r.gps?.altitude??'',heading:r.heading??r.gps?.heading??'',resolution:r.sourceWidth&&r.sourceHeight?`${r.sourceWidth} × ${r.sourceHeight}`:'',photoOrientation:r.photoOrientationDerived||r.photoOrientation||'',deviceOrientation:r.deviceOrientation||'',camera:r.cameraLabel||r.cameraFacing||'',zoom:r.cameraZoom!=null?`${Number(r.cameraZoom).toFixed(1)}x`:'',sourceHash:r.sourceHash||'',stampedHash:r.stampedHash||'',verify:r.verifyCode||'',ubigeo:/^\d{6}$/.test(String(r.ubigeo||''))?String(r.ubigeo):'',source:clean(r.municipalMatchSource),confidence:clean(r.municipalMatchConfidence),municipality:clean(r.municipality),mayor:clean(r.municipalMayor),maddr:clean(r.municipalAddress),party:clean(r.party),type:safeType(r),legacy:clean(r.legacyTypeV646||r.legacyTypeV643),status:clean(r.status),review:reviewLabel(r),reviewer:clean(r.reviewedBy||r.reviewer),route:r.routeId||'',mission:r.missionId||'',reviewedAt:r.reviewedAt||'',build:window.RuntimeVersion?.currentBuild?.()||BUILD}));

  /* 4. Lugares e historial se conservan porque ya forman parte del flujo aprendido. */
  const places=wb.addWorksheet('LUGARES',{views:[{state:'frozen',ySplit:1}]});places.columns=[{header:'CÓDIGO PUNTO',key:'code',width:18},{header:'TIPO',key:'type',width:18},{header:'NOMBRE',key:'name',width:30},{header:'UBICACIÓN',key:'address',width:44},{header:'LAT/LONG',key:'coords',width:28},{header:'ESTADO',key:'status',width:15},{header:'PRIMERA VISITA',key:'first',width:20},{header:'ÚLTIMA VISITA',key:'last',width:20},{header:'EVIDENCIAS',key:'count',width:12},{header:'MAPA',key:'map',width:18}];styleHead(places);
  const used=new Set(data.map(r=>r.placeId).filter(Boolean));(State.places||[]).filter(p=>!used.size||used.has(p.id)).forEach((p,i)=>{const lat=Number(p.latitude),lon=Number(p.longitude),ok=Number.isFinite(lat)&&Number.isFinite(lon),url=ok?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`:'',row=places.addRow({code:p.code||'',type:p.type||'',name:p.name||'',address:p.address||'',coords:ok?`${lat.toFixed(6)}, ${lon.toFixed(6)}`:'',status:p.status||'',first:p.firstSeen||'',last:p.lastSeen||'',count:State.records.filter(r=>r.placeId===p.id).length,map:url?'Abrir ubicación':''});if(url)hyperlink(places.getCell(i+2,10),'📍 Abrir ubicación',url,true);row.alignment={vertical:'middle',wrapText:true};});
  const hist=wb.addWorksheet('HISTORIAL',{views:[{state:'frozen',ySplit:1}]});hist.columns=[{header:'PUNTO',key:'place',width:18},{header:'FECHA',key:'date',width:13},{header:'HORA',key:'time',width:12},{header:'PROCESO',key:'process',width:14},{header:'RELACIÓN',key:'relation',width:18},{header:'TIPO',key:'type',width:14},{header:'PARTIDO',key:'party',width:34},{header:'CÓDIGO FOTO',key:'photo',width:25},{header:'OBSERVACIÓN',key:'obs',width:36}];styleHead(hist,'FF173E76');data.forEach(r=>hist.addRow({place:r.placeCode||r.placeId||'',date:r.fecha||'',time:r.hora||'',process:r.electionProcess||'',relation:r.relationType||r.relation||'',type:safeType(r),party:clean(r.party),photo:r.photoCode||'',obs:clean(r.observation)}));

  const meta=wb.addWorksheet('METADATOS');meta.addRows([
    ['Producto','ONE SHOT'],['Versión','v6.4.6 · STABILITY + UX REPAIR'],['Build',window.RuntimeVersion?.currentBuild?.()||BUILD],['Generado',new Date().toISOString()],
    ['Tipos operativos','PANEL · BANNER · PINTA'],['Regla ubicación','Ubicación = lugar real donde se capturó la propaganda.'],['Regla municipal','Dirección = sede de la municipalidad destinataria. Nunca reemplaza la ubicación de captura.'],
    ['Match municipal','Prioridad: UBIGEO exacto; luego Departamento + Provincia + Distrito exactos y únicos.'],['Alcalde','Proviene exclusivamente del directorio municipal, nunca del candidato político.'],['Proximidad','Posible = evidencia cercana; no significa duplicado confirmado.'],
    ['Base local','oneshotEvidenceDB_v2'],['Regla de integridad','La foto original no se destruye; correcciones se guardan como derivadas con historial.']
  ]);meta.getColumn(1).width=24;meta.getColumn(2).width=110;

  const out=await wb.xlsx.writeBuffer();return new File([out],`ONE_SHOT_ENTREGA_${Dates.date()}_v6_4_6.xlsx`,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}

let tries=0;
function start(){
  if(window.__ONE_V646_REPORTS_STARTED)return;
  if(typeof Reports==='undefined'||typeof Evidence==='undefined'||typeof State==='undefined'||!window.ONE_V646_CORE){if(tries++<90)setTimeout(start,120);return;}
  window.__ONE_V646_REPORTS_STARTED=true;
  Reports.makeExcel=makeExcel;Reports.__v646CanonicalExcel=true;Reports.invalidate?.();
  /* El workaround global deja de ser parte de la arquitectura activa. */
  try{delete window.candidato;}catch(_){}
}
window.ONE_V646_REPORTS={BUILD,start,makeExcel};
window.addEventListener('load',()=>setTimeout(start,520),{once:true});if(document.readyState==='complete')setTimeout(start,520);
})();