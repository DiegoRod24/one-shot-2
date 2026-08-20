const fs=require('fs'),path=require('path');
const root=process.cwd(),out=path.join(root,'www'),swPath=path.join(root,'service-worker.js');
if(!fs.existsSync(swPath))throw new Error('[ONE SHOT] Falta service-worker.js');
const sw=fs.readFileSync(swPath,'utf8');
function arrayConst(name){const m=sw.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\[[\\s\\S]*?\\]);`));if(!m)throw new Error(`[ONE SHOT] No pude leer ${name} de service-worker.js`);const text=m[1].replace(/\.\.\.DYNAMIC/g,'...DYNAMIC').replace(/\.\.\.FER_ASSETS/g,'...FER_ASSETS');if(name==='ASSETS'){const context={DYNAMIC:arrayConst('DYNAMIC'),FER_ASSETS:arrayConst('FER_ASSETS')};return Function('DYNAMIC','FER_ASSETS',`return ${text}`)(context.DYNAMIC,context.FER_ASSETS);}const a=JSON.parse(m[1]);if(!Array.isArray(a))throw new Error(`[ONE SHOT] ${name} inválido`);return a;}
function dynamicFiles(){return arrayConst('DYNAMIC');}
function lazyFiles(){return arrayConst('LAZY');}
function assetFiles(){return arrayConst('ASSETS').filter(x=>x&&x!=='./');}
const files=[...new Set([...assetFiles(),...dynamicFiles(),...lazyFiles()])];
const missing=files.filter(f=>!fs.existsSync(path.join(root,f)));if(missing.length)throw new Error(`[ONE SHOT] El runtime referencia archivos inexistentes: ${missing.join(', ')}`);
if(fs.existsSync(out))fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
function copyFile(rel){const src=path.join(root,rel),dst=path.join(out,rel);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);}
for(const f of files)copyFile(f);
function copyTree(rel){const src=path.join(root,rel);if(!fs.existsSync(src))throw new Error(`[ONE SHOT] Falta ${rel}`);for(const ent of fs.readdirSync(src,{withFileTypes:true})){const child=path.join(rel,ent.name);if(ent.isDirectory())copyTree(child);else if(ent.isFile())copyFile(child);}}
copyTree('assets/parties');copyTree('assets/fer');
const copied=files.filter(f=>fs.existsSync(path.join(out,f)));if(copied.length!==files.length)throw new Error(`[ONE SHOT] Copia incompleta: ${copied.length}/${files.length}`);
console.log(`[ONE SHOT] WebDir listo · ${dynamicFiles().length} core · ${lazyFiles().length} legacy lazy · assets/parties + assets/fer locales`);
