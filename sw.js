importScripts('core.js');
const V='expenses-v3',FILES=['./','index.html','core.js','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// Offline-first: serve from cache instantly, refresh the cache in the background when online.
self.addEventListener('fetch',e=>{
  const rq=e.request;
  if(rq.method!=='GET'||new URL(rq.url).origin!==location.origin)return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(rq,{ignoreSearch:true});
    const net=fetch(rq).then(res=>{if(res.ok)c.put(rq,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||(await c.match('index.html'))||new Response('Offline',{status:503});
  }));
});
self.addEventListener('periodicsync',e=>{if(e.tag==='month-end')e.waitUntil(runCheck(self.registration))});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./?v=stat')));
});
