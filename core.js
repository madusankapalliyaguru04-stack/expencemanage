function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('expdb',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbGet(k){const d=await idb();return new Promise(res=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>res(undefined)})}
async function idbSet(k,v){const d=await idb();return new Promise(res=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>res()})}
const fmtRs=n=>'Rs. '+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
function monthSummary(tx,cm,mk){
  const l=tx.filter(t=>t.date.startsWith(mk));let i=0,e=0;const by={};
  l.forEach(t=>{if(t.type=='i')i+=t.amt;else{e+=t.amt;by[t.cat]=(by[t.cat]||0)+t.amt}});
  const k=Object.keys(by).sort((a,b)=>by[b]-by[a])[0];
  const [y,m]=mk.split('-');
  const name=new Date(+y,+m-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  return{title:'Monthly summary – '+name,body:'Income '+fmtRs(i)+' • Spent '+fmtRs(e)+' • Balance '+fmtRs(i-e)+(k?'\nTop spending: '+(cm[k]||'Other')+' ('+fmtRs(by[k])+')':'')};
}
function dueKeys(now){
  const p=n=>String(n).padStart(2,'0'),y=now.getFullYear(),m=now.getMonth(),out=[];
  if(now.getDate()==new Date(y,m+1,0).getDate())out.push(y+'-'+p(m+1));
  if(now.getDate()<=3){const q=new Date(y,m-1,1);out.push(q.getFullYear()+'-'+p(q.getMonth()+1))}
  return out;
}
async function runCheck(reg){
  if(!('Notification' in self)||Notification.permission!=='granted')return false;
  const tx=(await idbGet('tx'))||[],cm=(await idbGet('catmap'))||{},done=(await idbGet('notified'))||[];
  for(const mk of dueKeys(new Date())){
    if(done.includes(mk)||!tx.some(t=>t.date.startsWith(mk)))continue;
    const s=monthSummary(tx,cm,mk);
    await reg.showNotification(s.title,{body:s.body,icon:'icon-192.png',badge:'icon-192.png',tag:'month-'+mk});
    done.push(mk);await idbSet('notified',done);return true;
  }
  return false;
}
