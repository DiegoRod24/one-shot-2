/* ONE SHOT v6.4.11 · CONFIRMED MUNICIPAL EXPORT */
(()=>{
'use strict';
if(window.ONE_V6411_REPORTS)return;
const BUILD='oneshot-v6.4.11-critical-ui-municipal-repair-01';
let tries=0;
const FIELDS=['municipality','municipalMayor','municipalMayorRole','municipalAddress','municipalPhone','municipalEmail','municipalMatchSource','municipalMatchConfidence'];
const confirmed=r=>window.ONE_V6411_MUNICIPAL?.confirmed?.(r)===true||r?.municipalConfirmed===true;
function patch(){if(typeof Reports==='undefined'||!Reports.makeExcel||Reports.__v6411ConfirmedMunicipal)return;Reports.__v6411ConfirmedMunicipal=true;const previous=Reports.makeExcel.bind(Reports);Reports.makeExcel=async(...args)=>{const data=(Evidence.selectedForReport?.()||[]).slice(),backups=[];for(const r of data){if(confirmed(r))continue;const b={r,values:{}};for(const f of FIELDS){b.values[f]=r[f];r[f]='';}backups.push(b);try{if(window.ONE_V646_CORE?.FieldRules)r.reviewStatus=ONE_V646_CORE.FieldRules.reviewState(r);}catch(_){}}try{return await previous(...args);}finally{for(const b of backups)for(const f of FIELDS)b.r[f]=b.values[f];}};}
function start(){if(window.__ONE_V6411_REPORTS_STARTED)return;if(typeof Reports==='undefined'||typeof Evidence==='undefined'){if(tries++<120)setTimeout(start,120);return;}window.__ONE_V6411_REPORTS_STARTED=true;patch();try{localStorage.setItem('oneshotRuntimeBuild',BUILD);localStorage.setItem('oneshotAppliedBuild',BUILD);}catch(_){}}
window.ONE_V6411_REPORTS={BUILD,start,patch,confirmed};window.addEventListener('load',()=>setTimeout(start,2400),{once:true});if(document.readyState==='complete')setTimeout(start,2400);
})();