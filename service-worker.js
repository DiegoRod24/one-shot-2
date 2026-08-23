const CACHE="oneshot-v6.6.10-editor-freeze-hotfix-01";
const RUNTIME_BUNDLE="./__oneshot_runtime_v6610.js";

// Arranque: cámara, evidencia y edición manual. Fer/voz siguen fuera del runtime crítico.
const DYNAMIC=[
  "one-bootstrap-v643.js","one-platform-v620.js",
  "municipal-data-v630-01.js","municipal-data-v630-02.js","municipal-data-v630-03.js","municipal-data-v630-04.js","municipal-data-v630-05.js","municipal-data-v630-metro.js",
  "party-catalog-v6410.js",
  "one-v646-core.js","one-v646-evidence.js","one-v646-map.js","one-v647-core.js","one-v6411-orientation.js","one-v6414-health-runtime.js",
  "one-v6416-evidence-recovery.js","one-v6416-media-legacy-bridge.js","one-v6416-runtime-meta.js",
  "one-v651-assets.js","one-v651-domain.js","one-v651-municipal.js","one-v653-mobile-ux.js"
];

const LAZY=[
  "one-v646-reports.js","one-v6411-reports.js","one-v651-reports-ui.js",
  "one-v6413-corridor.js","one-v6413-corridor-reports.js","one-v6415-territory-ops.js","one-v653-field-findings.js"
];
const ASSETS=["./","index.html","styles.css","app.js","version.json","manifest.json","oneshot-erm-data.js",...DYNAMIC,"one-v661-idle-loader.js","one-v662-fer-off.js","one-v664-editor-stable.js","one-v664-editor-stable.css","one-v667-mobile-batch.js","one-v668-mobile-editor-polish.js","one-v669-local-partidario.js","oneshot-logo.svg","oneshot-mark.png","oneshot-mark-transparent.png","icon-192.png","icon-512.png"];

async function buildRuntimeBundle(cache){const parts=[];for(const file of DYNAMIC){let r=await cache.match(file);if(!r){r=await fetch(file,{cache:"reload"});if(!r.ok)throw new Error(`Runtime ${file}: ${r.status}`);await cache.put(file,r.clone())}parts.push(await r.text())}const bundle=new Response(parts.join("\n"),{headers:{"Content-Type":"application/javascript; charset=utf-8","Cache-Control":"public, max-age=31536000, immutable"}});await cache.put(RUNTIME_BUNDLE,bundle.clone());return bundle}
async function runtimeBundle(cache){return(await cache.match(RUNTIME_BUNDLE))||buildRuntimeBundle(cache)}
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(ASSETS);await buildRuntimeBundle(c)})())});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith("oneshot-")).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener("message",e=>{if(e.data?.type==="SKIP_WAITING")self.skipWaiting();if(e.data?.type==="CLEAR_CACHES")e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("oneshot-")).map(k=>caches.delete(k)))))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;const isVersion=u.pathname.endsWith("version.json"),isData=u.pathname.endsWith("oneshot-erm-data.js"),isFieldAsset=u.pathname.includes("/assets/parties/"),isLazy=LAZY.some(x=>u.pathname.endsWith(`/${x}`)||u.pathname.endsWith(x));if(isData){e.respondWith((async()=>{const c=await caches.open(CACHE),dataPromise=fetch(e.request,{cache:"no-store"}).catch(()=>c.match(e.request)),bundlePromise=runtimeBundle(c),[data,bundle]=await Promise.all([dataPromise,bundlePromise]);if(!data)throw new Error("oneshot-erm-data.js no disponible");return new Response(`${await data.text()}\n${await bundle.text()}`,{headers:{"Content-Type":"application/javascript; charset=utf-8","Cache-Control":"no-store"}})})());return}if(isFieldAsset||isLazy){e.respondWith((async()=>{const c=await caches.open(CACHE),hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request,{cache:"reload"});if(r.ok)await c.put(e.request,r.clone());return r})());return}e.respondWith((isVersion?fetch(e.request,{cache:"no-store"}):fetch(e.request)).then(r=>{if(!isVersion&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{})}return r}).catch(()=>caches.match(e.request)))});
