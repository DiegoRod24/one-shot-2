const fs=require('fs'),path=require('path');
const root=process.cwd(),out=path.join(root,'www'),swPath=path.join(root,'service-worker.js');
if(!fs.existsSync(swPath))throw new Error('[ONE SHOT] Falta service-worker.js');
const sw=fs.readFileSync(swPath,'utf8');
function dynamicFiles(){const m=sw.match(/const\s+DYNAMIC\s*=\s*(\[[\s\S]*?\]);/);if(!m)throw new Error('[ONE SHOT] No pude leer DYNAMIC de service-worker.js');const a=JSON.parse(m[1]);if(!Array.isArray(a))throw new Error('[ONE SHOT] DYNAMIC inválido');return a;}
function assetFiles(){const m=sw.match(/const\s+ASSETS\s*=\s*\[([\s\S]*?)\];/);if(!m)throw new Error('[ONE SHOT] No pude leer ASSETS de service-worker.js');return [...m[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]).filter(x=>x&&x!=='./');}
const files=[...new Set([...assetFiles(),...dynamicFiles()])];
const missing=files.filter(f=>!fs.existsSync(path.join(root,f)));if(missing.length)throw new Error(`[ONE SHOT] El runtime referencia archivos inexistentes: ${missing.join(', ')}`);
if(fs.existsSync(out))fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const f of files){const src=path.join(root,f),dst=path.join(out,f);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);}
const copied=files.filter(f=>fs.existsSync(path.join(out,f)));if(copied.length!==files.length)throw new Error(`[ONE SHOT] Copia incompleta: ${copied.length}/${files.length}`);
console.log(`[ONE SHOT] WebDir listo en www/ · ${files.length} archivos del runtime sincronizados`);
