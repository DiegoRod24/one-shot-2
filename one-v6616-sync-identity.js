/* ONE SHOT v6.6.16 · SIMPLE MOBILE SYNC IDENTITY */
(()=>{
'use strict';
if(window.ONE_V6616_SYNC_IDENTITY)return;
const BUILD='oneshot-v6.6.16-sync-identity-01';
const TEAM='ONPE';
const $=id=>document.getElementById(id);

function versionTuple(v){const m=String(v||'').match(/v?(\d+)\.(\d+)\.(\d+)/i);return m?[+m[1],+m[2],+m[3]]:[0,0,0]}
function newerOrEqual(a,b){const A=versionTuple(a),B=versionTuple(b);for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]>B[i]}return true}
try{
  const applied=localStorage.getItem('oneshotAppliedBuild')||'';
  if(!applied||newerOrEqual(BUILD,applied))localStorage.setItem('oneshotAppliedBuild',BUILD);
  localStorage.setItem('oneshotRuntimeBuild',BUILD);
  localStorage.setItem('oneShotSyncTeam',TEAM);
}catch(_){}

function findLabelFor(input,patterns=[]){
  if(!input)return null;
  if(input.id){const direct=document.querySelector(`label[for="${CSS.escape(input.id)}"]`);if(direct)return direct}
  const inside=input.closest('label');if(inside)return inside;
  return [...document.querySelectorAll('label')].find(label=>patterns.some(rx=>rx.test(label.textContent||'')))||null;
}

function hideTeamField(){
  const input=$('syncTeamInput');
  if(!input)return false;
  input.value=TEAM;
  try{localStorage.setItem('oneShotSyncTeam',TEAM)}catch(_){}
  const label=findLabelFor(input,[/Equipo\s*\/\s*Brigada/i,/Equipo/i,/Brigada/i]);
  const agent=$('syncAgentInput');
  if(label&&(!agent||!label.contains(agent))){label.hidden=true;label.style.display='none'}
  else {input.hidden=true;input.style.display='none'}
  return true;
}

function ensureAgentHelp(input){
  if(!input||$('oneSyncAgentHelp'))return;
  const help=document.createElement('small');
  help.id='oneSyncAgentHelp';
  help.className='oneSyncAgentHelp';
  help.textContent='Opcional. Solo sirve para saber quién sincronizó esta evidencia; la clave autoriza el dispositivo.';
  const label=input.closest('label');
  if(label)label.appendChild(help);else input.insertAdjacentElement('afterend',help);
}

function simplifyAgent(){
  const input=$('syncAgentInput');
  if(!input)return false;
  input.required=false;
  input.removeAttribute('required');
  input.placeholder='Ej. Diego, María (opcional)';
  input.autocomplete='name';
  const label=findLabelFor(input,[/Verificador\s*\/\s*Alias/i,/Verificador/i,/Alias/i]);
  if(label){
    const textNodes=[...label.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&String(n.textContent||'').trim());
    if(textNodes.length)textNodes[0].textContent='Persona / alias (opcional) ';
    else if(!label.querySelector('.oneSyncHumanLabel')){const span=document.createElement('span');span.className='oneSyncHumanLabel';span.textContent='Persona / alias (opcional)';label.prepend(span)}
  }
  ensureAgentHelp(input);
  return true;
}

function normalizeSaveButton(){
  const btn=$('syncSaveBtn');
  if(!btn)return false;
  if(!btn.dataset.oneSyncSimple){btn.dataset.oneSyncSimple='1';btn.textContent='Guardar acceso';
    btn.addEventListener('click',()=>{
      try{
        localStorage.setItem('oneShotSyncTeam',TEAM);
        const agent=$('syncAgentInput')?.value?.trim()||'';
        localStorage.setItem('oneShotSyncAgent',agent);
      }catch(_){}
      setTimeout(()=>{try{UI?.toast?.('✓ Acceso guardado · listo para sincronizar',2200)}catch(_){}},60);
    },true);
  }
  return true;
}

function patchStatus(){
  const status=$('syncStatus');
  const key=$('syncKeyInput');
  if(!status||!key)return;
  const raw=(status.textContent||'').trim();
  if(key.value&&/Guarda la clave|Listo\.?$/i.test(raw))status.textContent='Dispositivo autorizado · listo para sincronizar.';
}

function injectStyles(){
  if($('oneSyncSimpleStyle'))return;
  const style=document.createElement('style');style.id='oneSyncSimpleStyle';style.textContent=`
    .oneSyncAgentHelp{display:block;margin-top:7px;color:#91a2bb;font-size:12px;line-height:1.35;font-weight:500}
    .oneSyncHumanLabel{display:block;margin-bottom:8px}
  `;document.head.appendChild(style);
}

function bind(){
  injectStyles();
  let found=false;
  found=hideTeamField()||found;
  found=simplifyAgent()||found;
  found=normalizeSaveButton()||found;
  patchStatus();
  return found;
}

let tries=0;
const timer=setInterval(()=>{tries++;bind();if(tries>240)clearInterval(timer)},100);
window.addEventListener('load',()=>setTimeout(bind,80),{once:true});
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-nav="sync"],#syncOpenBtn,#cloudSyncChip,#syncSaveBtn'))setTimeout(bind,80)},true);
window.ONE_V6616_SYNC_IDENTITY={BUILD,TEAM,bind};
})();
