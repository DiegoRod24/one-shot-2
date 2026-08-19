window.ONE_SHOT_DATA={parties:["ALIANZA PARA EL PROGRESO","FUERZA POPULAR","PARTIDO MORADO","SOMOS PERÚ","RENOVACIÓN POPULAR"],candidates:[]};

/* ONE SHOT · first-load runtime recovery.
   En una PWA ya controlada, el Service Worker concatena los módulos dinámicos a este archivo.
   En la primera visita todavía no existe controlador; este cargador recupera esos mismos módulos
   DESPUÉS de app.js, sin mantener hotfixes históricos escondidos dentro del archivo de datos. */
(()=>{
'use strict';
const CURRENT_SENTINEL=()=>!!(window.ONE_V6413_CORRIDOR&&window.ONE_V6412_FER_VOICE&&window.ONE_V6411_MUNICIPAL);
const loadScript=src=>new Promise((resolve,reject)=>{if([...document.scripts].some(s=>{try{return new URL(s.src,location.href).pathname===new URL(src,location.href).pathname}catch(_){return false}}))return resolve();const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>resolve();s.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));document.body.appendChild(s);});
async function recover(){if(CURRENT_SENTINEL())return;try{const r=await fetch(`service-worker.js?runtime-recovery=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error('service-worker no disponible');const source=await r.text(),m=source.match(/const\s+DYNAMIC\s*=\s*(\[[\s\S]*?\]);/);if(!m)throw new Error('No encontré el manifiesto DYNAMIC');const files=JSON.parse(m[1]);for(const file of files)await loadScript(file);window.dispatchEvent(new CustomEvent('oneshot-runtime-recovered',{detail:{count:files.length}}));}catch(e){console.warn('ONE SHOT runtime recovery',e);}}
try{document.title='ONE SHOT · Evidencia de campo';}catch(_){}
window.addEventListener('load',()=>setTimeout(recover,420),{once:true});
})();
