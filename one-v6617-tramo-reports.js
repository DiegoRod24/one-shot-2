/* ONE SHOT v6.6.17 · TRAMOS POSTES · EXCEL EXTENSION */
(()=>{
'use strict';
if(window.ONE_V6617_TRAMO_REPORTS)return;
const BUILD='oneshot-v6.6.17-tramo-reports-01';
const all=()=>{const h=Array.isArray(State?.settings?.propagandaCorridors)?State.settings.propagandaCorridors:[],a=State?.settings?.currentPropagandaCorridor;return a?[a,...h]:h};
const byId=()=>new Map(all().map(c=>[String(c.id||''),c]));
const quality=c=>c?.countQuality||c?.countMode||'';
const qLabel=q=>q==='EXACTO'?'EXACTO':q==='APROXIMADO'||q==='ESTIMADO'?'APROXIMADO':q==='NO_CONTADO'?'NO CONTABILIZADO':String(q||'');
async function extend(file){
  if(!file||!window.ExcelJS)return file;
  const wb=new ExcelJS.Workbook();await wb.xlsx.load(await file.arrayBuffer());const ws=wb.getWorksheet('TRAMOS_PROPAGANDA');if(!ws)return file;
  const map=byId(),headers=['POSTES','CARTELES','CALIDAD_CONTEO','SUBTIPO_REPETITIVO','ID_RECORRIDO'];
  headers.forEach((h,i)=>{const cell=ws.getCell(1,18+i);cell.value=h;cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF8A3B12'}};cell.alignment={vertical:'middle',horizontal:'center',wrapText:true}});
  ws.getColumn(18).width=12;ws.getColumn(19).width=12;ws.getColumn(20).width=22;ws.getColumn(21).width=24;ws.getColumn(22).width=26;
  for(let row=2;row<=ws.rowCount;row++){
    const id=String(ws.getCell(row,1).value||''),c=map.get(id);if(!c)continue;
    const posters=Number.isFinite(Number(c.posterCount))?Number(c.posterCount):Number(c.countMode==='ESTIMADO'?c.estimatedCount:c.observedCount)||0;
    const poles=Number.isFinite(Number(c.poleCount))?Number(c.poleCount):0;
    ws.getCell(row,18).value=poles||'';ws.getCell(row,19).value=posters||'';ws.getCell(row,20).value=qLabel(quality(c));ws.getCell(row,21).value=String(c.repetitiveSubtype||c.type||'');ws.getCell(row,22).value=String(c.routeId||'');
  }
  ws.autoFilter={from:'A1',to:'V1'};
  const meta=wb.getWorksheet('METADATOS');if(meta){meta.addRow(['Conteo postes/carteles','POSTES y CARTELES se registran por separado. CALIDAD_CONTEO distingue exacto, aproximado o no contabilizado.']);meta.addRow(['Tramo carteles/postes','Punto A + recorrido GPS + punto B + fotos muestra. El tramo representa una evidencia lineal; no se crean fotos ficticias por cada poste.']);}
  const out=await wb.xlsx.writeBuffer();const name=(file.name||'ONE_SHOT.xlsx').replace(/\.xlsx$/i,'_TRAMOS.xlsx');return new File([out],name,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
let tries=0;
function start(){
  if(window.ONE_V6617_TRAMO_REPORTS?.started)return;
  try{window.ONE_V6413_CORRIDOR_REPORTS?.start?.()}catch(_){}
  if(typeof Reports==='undefined'||!Reports.makeExcel||!Reports.__v6413CorridorSheets){if(tries++<220)return void setTimeout(start,100);return;}
  window.ONE_V6617_TRAMO_REPORTS.started=true;
  if(!Reports.__v6617TramoPostes){Reports.__v6617TramoPostes=true;const old=Reports.makeExcel.bind(Reports);Reports.makeExcel=async(...args)=>extend(await old(...args));try{Reports.invalidate?.()}catch(_){}}
}
window.ONE_V6617_TRAMO_REPORTS={BUILD,start,extend,started:false};window.addEventListener('load',()=>setTimeout(start,4200),{once:true});if(document.readyState==='complete')setTimeout(start,200);
})();
