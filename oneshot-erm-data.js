window.ONE_SHOT_DATA={parties:["ALIANZA PARA EL PROGRESO","FUERZA POPULAR","PARTIDO MORADO","SOMOS PERÚ","RENOVACIÓN POPULAR"],candidates:[]};

/* ONE SHOT · first-load runtime recovery.
   Una PWA controlada recibe el runtime consolidado desde el Service Worker.
   En la primera visita, antes de existir controlador, este cargador lee DYNAMIC en orden. */
(()=>{
'use strict';
const CURRENT_SENTINEL=()=>!!(window.ONE_V651_EDIT_CORE&&window.ONE_V651_DOMAIN&&window.ONE_V651_MUNICIPAL&&window.ONE_V6415_TERRITORY_OPS);
const loadScript=src=>new Promise((resolve,reject)=>{if([...document.scripts].some(s=>{try{return new URL(s.src,location.href).pathname===new URL(src,location.href).pathname}catch(_){return false}}))return resolve();const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));document.body.appendChild(s);});
async function recover(){if(CURRENT_SENTINEL())return;try{const r=await fetch(`service-worker.js?runtime-recovery=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error('service-worker no disponible');const source=await r.text(),m=source.match(/const\s+DYNAMIC\s*=\s*(\[[\s\S]*?\]);/);if(!m)throw new Error('No encontré el manifiesto DYNAMIC');const files=JSON.parse(m[1]);for(const file of files)await loadScript(file);window.dispatchEvent(new CustomEvent('oneshot-runtime-recovered',{detail:{count:files.length}}));}catch(e){console.warn('ONE SHOT runtime recovery',e);}}
try{document.title='ONE SHOT · Evidencia de campo';}catch(_){}
window.addEventListener('load',()=>setTimeout(recover,140),{once:true});
})();
