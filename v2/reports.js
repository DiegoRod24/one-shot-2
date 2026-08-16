"use strict";
(()=> {
  const O=window.OS2;
  O.Reports={
    paint(){if(O.$("reportCount"))O.$("reportCount").textContent=`${O.records.length} evidencias`},
    download(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},900)},
    backup(){const blob=new Blob([JSON.stringify({product:"ONE SHOT 2",version:O.version,build:O.build,exportedAt:new Date().toISOString(),records:O.records,routes:{current:O.Route.current,history:O.Route.history}},null,2)],{type:"application/json"});this.download(blob,`ONE_SHOT_2_BACKUP_${O.date()}.json`);O.toast("Respaldo generado")},
    async excel(){
      if(!window.ExcelJS){O.toast("ExcelJS no cargó. Revisa tu conexión.");return}
      if(!O.records.length){O.toast("No hay evidencias para exportar");return}
      O.toast("Generando Excel de entrega…",5000);
      const data=O.RecordModel.sort(O.records.map(r=>O.RecordModel.normalize(r))),wb=new ExcelJS.Workbook();wb.creator="ONE SHOT 2";wb.created=new Date();
      const proxCounts={};for(const r of data){const k=O.idProx(r);if(k)proxCounts[k]=(proxCounts[k]||0)+1}
      const ws=wb.addWorksheet("Todo",{views:[{state:"frozen",ySplit:1}]});
      ws.columns=[
        {header:"ID",key:"id",width:7},{header:"Foto",key:"foto",width:28},{header:"Fecha",key:"fecha",width:13},{header:"Hora",key:"hora",width:12},
        {header:"Ubicación",key:"ubicacion",width:45},{header:"Empresa",key:"empresa",width:18},{header:"Nota",key:"nota",width:36},{header:"Lat/Long",key:"latlong",width:29},
        {header:"Clima",key:"clima",width:12},{header:"Altitud",key:"altitud",width:13},{header:"Zona",key:"zona",width:20},{header:"Nomenclatura",key:"nomenclatura",width:72},
        {header:"Latitud",key:"lat",width:18},{header:"Longitud",key:"lon",width:18},{header:"Región",key:"region",width:18},{header:"Provincia",key:"provincia",width:20},
        {header:"Distrito",key:"distrito",width:22},{header:"Dirección",key:"direccion",width:42},{header:"Alcalde",key:"alcalde",width:34},{header:"Tipo",key:"tipo",width:14},
        {header:"Fórmula",key:"formula",width:72},{header:"ID_Prox",key:"idprox",width:24},{header:"Duplicado",key:"duplicado",width:14},{header:"Proceso",key:"proceso",width:12}
      ];
      const head=ws.getRow(1);head.height=30;head.font={bold:true,color:{argb:"FFFFFFFF"}};head.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF0A2E73"}};head.alignment={vertical:"middle",horizontal:"center",wrapText:true};ws.autoFilter={from:"A1",to:"X1"};
      for(let i=0;i<data.length;i++){
        const r=data[i],lat=Number(r.gps?.latitude),lon=Number(r.gps?.longitude),hasGps=Number.isFinite(lat)&&Number.isFinite(lon),coords=hasGps?`${lat.toFixed(5)}°S,${lon.toFixed(5)}°W `:"",idprox=O.idProx(r),nom=O.nomenclature(r),map=O.mapsUrl(r);
        const row=ws.addRow({id:i+1,foto:"",fecha:r.fecha,hora:r.hora,ubicacion:r.captureAddress||"",empresa:r.company||O.settings.company,nota:r.party||"",latlong:coords,clima:r.weather||"-",altitud:r.altitude!=null?`${Number(r.altitude).toFixed(1)}m`:"-",zona:r.zone||"-",nomenclatura:nom,lat:hasGps?lat:"",lon:hasGps?lon:"",region:r.department||"",provincia:r.province||"",distrito:r.district||"",direccion:r.municipalAddress||"",alcalde:r.municipalMayor||"",tipo:O.safeType(r),formula:nom,idprox,duplicado:idprox&&proxCounts[idprox]>1?"Posible":"Único",proceso:r.process||"ERM"});
        row.height=108;row.alignment={vertical:"middle",wrapText:true};
        if(map){for(const col of [5,8,13,14]){const cell=ws.getCell(row.number,col),txt=String(cell.value??"");cell.value={text:txt||"Abrir ubicación",hyperlink:map};cell.font={color:{argb:"FF1D64C8"},underline:true}}}
        try{
          const src=O.imageOf(r);if(src&&src.includes(",")){const base64=src.split(",")[1],ext=/image\/png/i.test(src.slice(0,40))?"png":"jpeg",imgId=wb.addImage({base64,extension:ext});ws.addImage(imgId,{tl:{col:1.08,row:row.number-0.91},ext:{width:174,height:96},editAs:"oneCell"})}
        }catch(_){}
      }
      ws.pageSetup={orientation:"landscape",fitToPage:true,fitToWidth:1,fitToHeight:0};

      const follow=wb.addWorksheet("SEGUIMIENTO_ENTREGAS",{views:[{state:"frozen",ySplit:1}]});
      follow.columns=[
        {header:"CÓDIGO",key:"code",width:25},{header:"PARTIDO",key:"party",width:32},{header:"TIPO",key:"type",width:14},{header:"DEPARTAMENTO",key:"department",width:18},
        {header:"PROVINCIA",key:"province",width:20},{header:"DISTRITO",key:"district",width:22},{header:"UBIGEO",key:"ubigeo",width:12},{header:"MUNICIPALIDAD DESTINO",key:"municipality",width:34},
        {header:"ALCALDE / ENCARGADO",key:"mayor",width:34},{header:"DIRECCIÓN MUNICIPAL",key:"maddress",width:42},{header:"TELÉFONO",key:"phone",width:20},{header:"CORREO",key:"email",width:42},
        {header:"ESTADO MUNICIPAL",key:"mstatus",width:20},{header:"DESTINO POLÍTICO",key:"pdest",width:34},{header:"ESTADO PARTIDO",key:"pstatus",width:20},{header:"REVISIÓN",key:"review",width:20},
        {header:"PROXIMIDAD",key:"prox",width:14},{header:"MAPA CAPTURA",key:"map",width:18}
      ];
      const fh=follow.getRow(1);fh.font={bold:true,color:{argb:"FFFFFFFF"}};fh.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF173E76"}};fh.alignment={vertical:"middle",horizontal:"center",wrapText:true};follow.autoFilter={from:"A1",to:"R1"};
      for(const r of data){
        const idprox=O.idProx(r),map=O.mapsUrl(r),row=follow.addRow({code:r.photoCode,party:r.party,type:O.safeType(r),department:r.department,province:r.province,district:r.district,ubigeo:r.ubigeo,municipality:r.municipality,mayor:r.municipalMayor,maddress:r.municipalAddress,phone:r.municipalPhone,email:r.municipalEmail,mstatus:r.municipalDeliveryStatus||"PENDIENTE",pdest:r.party,pstatus:r.partyDeliveryStatus||"PENDIENTE",review:O.reviewLabel(r),prox:idprox&&proxCounts[idprox]>1?"Posible":"Único",map:map?"Abrir ubicación":""});
        if(map){const cell=follow.getCell(row.number,18);cell.value={text:"📍 Abrir ubicación",hyperlink:map};cell.font={color:{argb:"FF1D64C8"},underline:true}}
      }

      const tech=wb.addWorksheet("DATOS_TECNICOS",{views:[{state:"frozen",ySplit:1}]});
      tech.columns=[
        {header:"CÓDIGO",key:"code",width:25},{header:"ID",key:"id",width:38},{header:"CREADO",key:"created",width:25},{header:"LATITUD",key:"lat",width:18},{header:"LONGITUD",key:"lon",width:18},
        {header:"PRECISIÓN",key:"accuracy",width:13},{header:"ALTITUD",key:"altitude",width:13},{header:"ORIENTACIÓN",key:"heading",width:14},{header:"RESOLUCIÓN",key:"resolution",width:18},{header:"CÁMARA",key:"camera",width:18},
        {header:"DIRECCIÓN CAPTURA",key:"captureAddress",width:45},{header:"UBIGEO",key:"ubigeo",width:12},{header:"MATCH MUNICIPAL",key:"match",width:30},{header:"CONFIANZA",key:"confidence",width:14},
        {header:"MUNICIPALIDAD",key:"municipality",width:34},{header:"ALCALDE",key:"mayor",width:34},{header:"DIRECCIÓN MUNICIPAL",key:"maddress",width:42},{header:"PARTIDO",key:"party",width:32},
        {header:"TIPO",key:"type",width:14},{header:"TIPO LEGACY",key:"legacyType",width:16},{header:"REVISIÓN",key:"review",width:20},{header:"ROUTE ID",key:"route",width:38},{header:"APP",key:"app",width:24},{header:"BUILD",key:"build",width:30}
      ];
      for(const r of data)tech.addRow({code:r.photoCode,id:r.id,created:r.createdAt,lat:r.gps?.latitude??"",lon:r.gps?.longitude??"",accuracy:r.accuracy??r.gps?.accuracy??"",altitude:r.altitude??r.gps?.altitude??"",heading:r.gps?.heading??r.heading??"",resolution:r.sourceWidth&&r.sourceHeight?`${r.sourceWidth} × ${r.sourceHeight}`:"",camera:r.cameraLabel||r.cameraFacing||"",captureAddress:r.captureAddress,ubigeo:r.ubigeo,match:r.municipalMatchSource,confidence:r.municipalMatchConfidence,municipality:r.municipality,mayor:r.municipalMayor,maddress:r.municipalAddress,party:r.party,type:O.safeType(r),legacyType:r.legacyType||"",review:O.reviewLabel(r),route:r.routeId||"",app:r.appVersion||"Legacy",build:r.appBuild||""});
      const th=tech.getRow(1);th.font={bold:true,color:{argb:"FFFFFFFF"}};th.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF263B5F"}};th.alignment={vertical:"middle",horizontal:"center",wrapText:true};tech.autoFilter={from:"A1",to:"X1"};

      const meta=wb.addWorksheet("METADATOS");
      meta.addRows([
        ["Producto","ONE SHOT 2"],["Versión",O.version],["Build",O.build],["Generado",new Date().toISOString()],
        ["Flujo","Captura en calle → clasificación PANEL/BANNER/PINTA → territorio → match municipal → destino municipal + destino político → entrega."],
        ["Regla 1","Ubicación es el lugar donde se tomó la foto. Dirección es la sede municipal del destinatario y nunca reemplaza la ubicación de captura."],
        ["Regla 2","Municipalidad/alcalde se obtienen por UBIGEO o por Departamento + Provincia + Distrito."],
        ["Regla 3","La misma evidencia puede enviarse a la municipalidad para verificación de permisos y al partido para sustento de gasto."],
        ["Directorio",`DIRECTORIO cargado: ${O.municipalRows.length} registros`],["Base local",O.dbName]
      ]);
      meta.getColumn(1).width=24;meta.getColumn(2).width=110;

      const buf=await wb.xlsx.writeBuffer(),blob=new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});this.download(blob,`ONE_SHOT_2_ENTREGA_${O.date()}.xlsx`);O.Fer?.setState("success");O.Fer?.say("Excel de entrega listo. La ubicación de captura y la dirección municipal quedaron separadas.",false);O.toast("Excel de entrega listo")
    }
  };
})();