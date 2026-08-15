/* ONE SHOT v6.3.1 · PARTY LOGOS + CLEAN REPORT */
(()=>{
'use strict';
if(window.ONE_V631_CORE)return;
const BUILD='oneshot-v6.3.1-party-logos-clean-report-01';
const ALLOWED_TYPES=new Set(['PANEL','MURAL','BANNER']);
const JUNK=new Set(['31','USAR SUGERENCIAS','UNDEFINED','NULL','N/A','NA','-']);
const N=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
const clean=v=>{const s=String(v??'').trim();return !s||JUNK.has(N(s))?'':s;};
const reviewState=r=>{
  try{return window.ONE_V63_CORE?.state?.(r)||r?.reviewStatus||'PENDIENTE';}catch(_){return r?.reviewStatus||'PENDIENTE';}
};
const reviewLabel=r=>{const s=reviewState(r);return s==='REVISADA'?'REVISADA':s==='REVISAR_UBICACION'?'REVISAR UBICACIÓN':'FALTA REVISAR';};
const safeType=r=>ALLOWED_TYPES.has(N(r?.type))?N(r.type):'PENDIENTE';
const getCatalog=()=>Array.isArray(window.ONE_PARTY_CATALOG_V631)?window.ONE_PARTY_CATALOG_V631:[];
const P={
  sprite:'party-logos-v631.webp',
  cols:10,rows:8,tile:64,
  safePart(v){return clean(v).replace(/[\\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim();},
  sanitizeRecord(r){
    if(!r)return false;
    let changed=false;const removed={};
    ['party','candidate','candidateType','observation','reviewer'].forEach(f=>{const v=String(r[f]??'').trim();if(v&&JUNK.has(N(v))){removed[f]=v;r[f]='';changed=true;}});
    if(r.type&&!ALLOWED_TYPES.has(N(r.type))&&N(r.type)!=='PENDIENTE'&&!r.legacyTypeV631)r.legacyTypeV631=r.type;
    if(changed){r.cleanupAuditV631=Array.isArray(r.cleanupAuditV631)?r.cleanupAuditV631:[];r.cleanupAuditV631.push({at:new Date().toISOString(),removed});if(r.cleanupAuditV631.length>20)r.cleanupAuditV631=r.cleanupAuditV631.slice(-20);}
    window.ONE_V63_CORE?.apply?.(r,{touch:false});
    return changed;
  },
  item(name){const n=N(name);return getCatalog().find(x=>N(x.name)===n)||null;},
  logoStyle(item){if(!item)return'';const c=item.i%P.cols,r=Math.floor(item.i/P.cols);return `background-image:url('${P.sprite}');background-size:${P.cols*P.tile}px ${P.rows*P.tile}px;background-position:-${c*P.tile}px -${r*P.tile}px`;},
  css(){
    if(document.getElementById('v631css'))return;
    const s=document.createElement('style');s.id='v631css';s.textContent=`
      #guidedEditor.v631PartyMode .guidedAnswerArea{overflow:visible}
      #guidedEditor.v631PartyMode #guidedChoices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;max-height:43vh;overflow:auto;padding:3px}
      #guidedEditor.v631PartyMode #guidedChoices button{min-height:104px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;line-height:1.12;border-radius:16px}
      #guidedEditor.v631PartyMode #guidedChoices button.v631NoLogo{min-height:58px}
      .v631PartyLogo{width:64px;height:64px;border-radius:13px;background-color:#fff;background-repeat:no-repeat;box-shadow:inset 0 0 0 1px #d8e2ee;flex:0 0 auto}
      .v631PartyName{font-size:10px;font-weight:900;color:inherit;display:block;max-width:100%}
      .v631PartySearch{display:flex;gap:8px;margin:0 0 9px}
      .v631PartySearch input{width:100%;border:1px solid #cddaea;border-radius:13px;padding:11px 12px;font:inherit}
      .v631PartyCount{display:block;color:#718096;font-size:10px;margin:-3px 0 8px}
      @media(max-width:700px){#guidedEditor.v631PartyMode #guidedChoices{grid-template-columns:repeat(2,minmax(0,1fr));max-height:47vh}}
    `;document.head.appendChild(s);
  },
  mergeReference(){
    if(!window.ONEAssistant)return;
    ONEAssistant.reference=ONEAssistant.reference||{};
    const vals=[...(ONEAssistant.reference.parties||[]),...getCatalog().map(x=>x.name)];
    const seen=new Set();ONEAssistant.reference.parties=vals.filter(v=>{const k=N(v);if(!k||seen.has(k))return false;seen.add(k);return true;});
  },
  ensureSelect(){
    const e=document.getElementById('editParty');if(!e)return;
    const current=e.value||'';
    const existing=new Set(Array.from(e.options).map(o=>N(o.value||o.textContent)));
    getCatalog().forEach(x=>{if(existing.has(N(x.name)))return;const o=document.createElement('option');o.value=x.name;o.textContent=x.name;e.appendChild(o);existing.add(N(x.name));});
    if(current)e.value=current;
  },
  injectSearch(){
    const editor=document.getElementById('guidedEditor'),box=document.getElementById('guidedChoices');
    if(!editor||!box)return;
    const isParty=window.GuidedEditor?.current?.()?.key==='party';
    editor.classList.toggle('v631PartyMode',!!isParty);
    document.getElementById('v631PartySearch')?.remove();
    document.getElementById('v631PartyCount')?.remove();
    if(!isParty)return;
    const wrap=document.createElement('div');wrap.id='v631PartySearch';wrap.className='v631PartySearch';wrap.innerHTML='<input id="v631PartySearchInput" autocomplete="off" placeholder="🔎 Buscar partido o movimiento">';
    box.before(wrap);
    const count=document.createElement('small');count.id='v631PartyCount';count.className='v631PartyCount';count.textContent=`${box.querySelectorAll('[data-guided-value]').length} organizaciones disponibles`;
    box.before(count);
    const inp=document.getElementById('v631PartySearchInput');
    inp?.addEventListener('input',()=>{
      const q=N(inp.value);let visible=0;
      box.querySelectorAll('[data-guided-value]').forEach(b=>{const ok=!q||N(b.dataset.guidedLabel||b.textContent).includes(q);b.style.display=ok?'':'none';if(ok)visible++;});
      count.textContent=q?`${visible} coincidencia${visible===1?'':'s'}`:`${box.querySelectorAll('[data-guided-value]').length} organizaciones disponibles`;
    });
  },
  decorate(){
    const box=document.getElementById('guidedChoices');if(!box||window.GuidedEditor?.current?.()?.key!=='party')return;
    box.querySelectorAll('[data-guided-value]').forEach(b=>{
      const name=b.dataset.guidedLabel||b.dataset.guidedValue||b.textContent.trim(),item=P.item(name);
      if(!item){b.classList.add('v631NoLogo');return;}
      b.innerHTML=`<span class="v631PartyLogo" style="${P.logoStyle(item)}"></span><span class="v631PartyName">${String(name).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</span>`;
    });
  },
  patchGuided(){
    if(!window.GuidedEditor||GuidedEditor.__v631)return;GuidedEditor.__v631=true;
    GuidedEditor.partyChoices=()=>{
      const out=[],seen=new Set(),push=(lab,val=lab)=>{const k=N(val);if(!k||seen.has(k))return;seen.add(k);out.push([lab,val]);};
      const suggestion=ONEAssistant?.suggestions?.party,current=document.getElementById('editParty')?.value;
      if(suggestion)push(`✨ ${suggestion}`,suggestion);
      if(current)push(current,current);
      getCatalog().forEach(x=>push(x.name,x.name));
      out.push(['No identificado','']);
      return out;
    };
    const render=GuidedEditor.render.bind(GuidedEditor);
    GuidedEditor.render=(...args)=>{const out=render(...args);setTimeout(()=>{P.injectSearch();P.decorate();},0);return out;};
    const open=Editor.open.bind(Editor);
    Editor.open=id=>{open(id);setTimeout(()=>{P.ensureSelect();P.mergeReference();if(GuidedEditor.current?.()?.key==='party'){GuidedEditor.render();}},100);};
  },
  patchReports(){
    if(!window.Reports||Reports.__v631||!Reports.makeExcel)return;Reports.__v631=true;
    const original=Reports.makeExcel.bind(Reports);
    Reports.makeExcel=async()=>{
      const data=Evidence.selectedForReport().slice();
      data.forEach(r=>P.sanitizeRecord(r));
      const file=await original();
      if(!window.ExcelJS)return file;
      try{
        const wb=new ExcelJS.Workbook();await wb.xlsx.load(await file.arrayBuffer());
        const ev=wb.getWorksheet('EVIDENCIAS');
        if(ev){
          const headers=['N°','FOTO','FECHA','HORA','UBICACIÓN','LAT/LONG','PRECISIÓN','ALTITUD','CÓDIGO','VERIFICADOR','PROCESO','TIPO','ESTADO','PARTIDO','ESTADO REVISIÓN','MUNICIPALIDAD','ALCALDE / ENCARGADO','DISTRITO','MAPA','OBSERVACIÓN'];
          headers.forEach((h,i)=>ev.getCell(1,i+1).value=h);
          data.forEach((r,i)=>{
            const row=i+2;
            ev.getCell(row,12).value=safeType(r);
            ev.getCell(row,14).value=clean(r.party);
            ev.getCell(row,15).value=reviewLabel(r);
            ev.getCell(row,16).value=clean(r.municipality);
            ev.getCell(row,17).value=clean(r.municipalMayor);
            ev.getCell(row,18).value=clean(r.district);
            const map=Reports.mapsUrl(r);ev.getCell(row,19).value=map?{text:'📍 Abrir ubicación',hyperlink:map}:'';
            ev.getCell(row,20).value=clean(r.observation);
          });
          [15,16,17].forEach(c=>{ev.getColumn(c).width=c===15?18:32;});
          ev.getColumn(18).width=20;ev.getColumn(20).width=36;
        }
        const tech=wb.getWorksheet('DATOS_TECNICOS');
        if(tech){
          const newHeaders=['ESTADO REVISIÓN','MUNICIPALIDAD','ALCALDE / ENCARGADO','CARGO MUNICIPAL','DIRECCIÓN MUNICIPAL','FUENTE MATCH','CONFIANZA MATCH'];
          newHeaders.forEach((h,j)=>{const c=37+j;tech.getCell(1,c).value=h;tech.getColumn(c).width=[18,34,32,24,42,26,18][j];});
          data.forEach((r,i)=>{
            const row=i+2;
            [27,30,31,32,33,34,35].forEach(c=>{const cell=tech.getCell(row,c);cell.value=clean(cell.value?.text??cell.value);});
            tech.getCell(row,28).value=clean(r.type);
            tech.getCell(row,30).value=clean(r.party);
            tech.getCell(row,31).value=clean(r.candidate);
            tech.getCell(row,32).value=clean(r.candidateType);
            tech.getCell(row,33).value=clean(r.district);
            tech.getCell(row,34).value=clean(r.observation);
            tech.getCell(row,35).value=clean(r.reviewer||r.reviewedBy);
            tech.getCell(row,37).value=reviewLabel(r);
            tech.getCell(row,38).value=clean(r.municipality);
            tech.getCell(row,39).value=clean(r.municipalMayor);
            tech.getCell(row,40).value=clean(r.municipalMayorRole);
            tech.getCell(row,41).value=clean(r.municipalAddress);
            tech.getCell(row,42).value=clean(r.municipalMatchSource);
            tech.getCell(row,43).value=clean(r.municipalMatchConfidence);
          });
          tech.autoFilter={from:'A1',to:'AQ1'};
        }
        const hist=wb.getWorksheet('HISTORIAL');
        if(hist){
          hist.getRow(1).values=['PUNTO','FECHA','HORA','PROCESO','RELACIÓN','TIPO ORIGINAL','PARTIDO','CANDIDATO','CÓDIGO FOTO','OBSERVACIÓN'];
          for(let row=2;row<=hist.rowCount;row++){[7,8,10].forEach(c=>{const cell=hist.getCell(row,c);cell.value=clean(cell.value?.text??cell.value);});}
        }
        const cls=wb.getWorksheet('CLASIFICACION_COMPATIBLE');
        if(cls){
          cls.getCell(1,16).value='Provincia';cls.getCell(1,19).value='Alcalde / encargado';
          const extras=['ESTADO REVISIÓN','UBIGEO','MUNICIPALIDAD','DIRECCIÓN MUNICIPAL','FUENTE MATCH'];
          extras.forEach((h,j)=>{cls.getCell(1,22+j).value=h;cls.getColumn(22+j).width=[18,12,34,42,25][j];});
          data.forEach((r,i)=>{
            const row=i+2;
            cls.getCell(row,7).value=clean(r.party);
            cls.getCell(row,9).value='';
            cls.getCell(row,11).value=clean(r.district);
            cls.getCell(row,15).value=clean(r.department||r.region);
            cls.getCell(row,16).value=clean(r.province);
            cls.getCell(row,17).value=clean(r.district);
            const nomen=[r.fecha||'',String(r.hora||'').replace(/:/g,'.'),clean(r.party),clean(r.department||r.region),clean(r.province),clean(r.district),safeType(r)].map(P.safePart).filter(Boolean).join('_');
            cls.getCell(row,12).value=nomen;
            cls.getCell(row,19).value=clean(r.municipalMayor);
            cls.getCell(row,20).value=safeType(r);
            cls.getCell(row,22).value=reviewLabel(r);
            cls.getCell(row,23).value=/^\d{6}$/.test(String(r.ubigeo||''))?String(r.ubigeo):'';
            cls.getCell(row,24).value=clean(r.municipality);
            cls.getCell(row,25).value=clean(r.municipalAddress);
            cls.getCell(row,26).value=clean(r.municipalMatchSource);
          });
          cls.autoFilter={from:'A1',to:'Z1'};
        }
        const groups=new Map();
        data.forEach(r=>{
          const key=clean(r.municipality)||'SIN DESTINO CONFIRMADO';
          if(!groups.has(key))groups.set(key,{municipality:key,mayor:clean(r.municipalMayor),role:clean(r.municipalMayorRole),address:clean(r.municipalAddress),region:clean(r.department||r.region),province:clean(r.province),district:clean(r.district),records:[]});
          groups.get(key).records.push(r);
        });
        const old=wb.getWorksheet('DESTINO_MUNICIPAL');if(old)wb.removeWorksheet(old.id);
        const dest=wb.addWorksheet('DESTINO_MUNICIPAL',{views:[{state:'frozen',ySplit:1}]});
        dest.columns=[
          {header:'MUNICIPALIDAD',key:'municipality',width:36},{header:'ALCALDE / ENCARGADO',key:'mayor',width:34},{header:'CARGO',key:'role',width:24},{header:'DIRECCIÓN MUNICIPAL',key:'address',width:44},
          {header:'REGIÓN',key:'region',width:18},{header:'PROVINCIA',key:'province',width:18},{header:'DISTRITO',key:'district',width:20},{header:'EVIDENCIAS',key:'count',width:12},{header:'REVISADAS',key:'reviewed',width:12},{header:'PENDIENTES',key:'pending',width:12},{header:'CÓDIGOS',key:'codes',width:60}
        ];
        groups.forEach(g=>dest.addRow({municipality:g.municipality,mayor:g.mayor,role:g.role,address:g.address,region:g.region,province:g.province,district:g.district,count:g.records.length,reviewed:g.records.filter(r=>reviewState(r)==='REVISADA').length,pending:g.records.filter(r=>reviewState(r)!=='REVISADA').length,codes:g.records.map(r=>r.photoCode).filter(Boolean).join(', ')}));
        const dh=dest.getRow(1);dh.font={bold:true,color:{argb:'FFFFFFFF'}};dh.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0A2E73'}};dh.alignment={vertical:'middle',horizontal:'center',wrapText:true};dest.autoFilter={from:'A1',to:'K1'};
        const meta=wb.getWorksheet('METADATOS');
        if(meta){
          meta.getCell('B1').value='v6.3.1 · PARTY LOGOS + CLEAN REPORT';
          meta.getCell('B4').value='Vista principal limpia: Estado revisión, Partido, Tipo, Municipalidad y Alcalde/encargado.';
          meta.getCell('B6').value='Compatibilidad operativa corregida: Provincia, Alcalde municipal, tipos válidos y estado de revisión.';
          meta.getCell('A8').value='Regla 6.3.1';meta.getCell('B8').value='PANEL / MURAL / BANNER son los únicos tipos válidos para cerrar una revisión. Los tipos históricos se conservan en DATOS_TECNICOS y quedan pendientes en la vista operativa.';
          meta.getCell('A9').value='Municipalidad';meta.getCell('B9').value='No se inventa un destino: sin UBIGEO o territorio estructurado suficiente, queda pendiente/revisar ubicación.';
        }
        const buf=await wb.xlsx.writeBuffer();
        return new File([buf],`ONE_SHOT_EVIDENCIAS_${Dates.date()}_v6_3_1.xlsx`,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      }catch(e){console.warn('v6.3.1 clean report fallback',e);return file;}
    };
  },
  start(){
    let n=0,t=setInterval(()=>{n++;try{
      if(typeof State!=='undefined'&&typeof GuidedEditor!=='undefined'&&typeof Editor!=='undefined'&&typeof ONEAssistant!=='undefined'&&typeof Reports!=='undefined'&&typeof Evidence!=='undefined'){
        clearInterval(t);P.css();P.mergeReference();P.ensureSelect();P.patchGuided();P.patchReports();
        let cleaned=false;State.records.forEach(r=>{if(P.sanitizeRecord(r))cleaned=true;});if(cleaned)Promise.resolve(Store.saveBatch?.(State.records)).catch(()=>{});
        State.settings.assistantName='Fer';Store.saveLite();document.title='ONE SHOT v6.3.1 · PARTY LOGOS + CLEAN REPORT';
        try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}
      }
    }catch(e){console.warn('ONE SHOT v6.3.1 init',e);}if(n>300)clearInterval(t);},20);
  }
};
window.ONE_V631_CORE=P;
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',P.start,{once:true}):P.start();
})();
