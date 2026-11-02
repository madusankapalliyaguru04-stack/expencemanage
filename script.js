const CE=[["🍽️","කෑම"],["🚌","ගමන්"],["🛒","සාප්පු"],["💡","බිල්පත්"],["🏠","නිවස"],["💊","සෞඛ්‍ය"],["🎬","විනෝදය"],["📚","අධ්‍යාපන"]];
const CI=[["💼","වැටුප"],["🎁","තෑගි"],["📈","ව්‍යාපාර"],["💰","වෙනත්"]];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let tx=[],type="e",cat=0,view="home",mo=new Date();mo.setDate(1);
const KEY="expenses_v1";
const EN={'මගේ වියදම්':'My Expenses','මෙම මාසයේ ශේෂය':'This month’s balance','ආදායම':'Income','වියදම':'Expense','මෑත ගනුදෙනු':'Recent transactions','මුදල (Rs.)':'Amount (Rs.)','වර්ගය':'Category','සටහන':'Note','දිනය':'Date','සුරකින්න':'Save','ඉතිහාසය':'History','එක් කරන්න':'Add','සාරාංශ':'Summary','මුල':'Home','වර්ග අනුව වියදම':'Spending by category','දත්ත':'Data','දත්ත උපස්ථ කරන්න (බාගත)':'Back up data (download)','උපස්ථයෙන් ආපසු ගන්න':'Restore from backup','සියලු දත්ත මකන්න':'Delete all data','කෑම':'Food','ගමන්':'Transport','සාප්පු':'Shopping','බිල්පත්':'Bills','නිවස':'Home','සෞඛ්‍ය':'Health','විනෝදය':'Fun','අධ්‍යාපන':'Education','වැටුප':'Salary','තෑගි':'Gifts','ව්‍යාපාර':'Business','වෙනත්':'Other','දත්ත සුරැකීමට නොහැකි විය':'Could not save data','කරුණාකර නිවැරදි මුදලක් ඇතුළත් කරන්න':'Enter a valid amount','සුරකින ලදී':'Saved','මකා දමන ලදී':'Deleted','උපස්ථ ගොනුව සකස් විය':'Backup file created','දත්ත ආපසු ගන්නා ලදී':'Data restored','ගොනුව වලංගු නැත':'Invalid file','දත්ත මකා දමන ලදී':'All data deleted','මෙම ගනුදෙනුව මකන්නද?':'Delete this transaction?','සියලු දත්ත ස්ථිරවම මැකේ. ඉදිරියට යන්නද?':'This permanently deletes all data. Continue?','තවම ගනුදෙනු නැත.<br>පහළ “එක් කරන්න” ඔබා පළමු වියදම සටහන් කරන්න.':'No transactions yet.<br>Tap “Add” below to log your first expense.','මෙම මාසයේ ගනුදෙනු නැත.':'No transactions this month.','වියදම් දත්ත නැත.':'No spending data.','උදා: දවල් කෑම':'e.g. Lunch'};
let lang="si";try{lang=localStorage.getItem("lang")||"si"}catch(e){}
function tr(s){return lang=="en"&&EN[s]?EN[s]:s}
const LOC=()=>lang=="en"?"en-US":"si-LK";
const orig=new WeakMap();
function applyLang(){
 document.documentElement.lang=lang;
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=w.nextNode()){if(n.parentNode.closest("script,#hList,#mList,#sBars,#aCats,#toast,#today"))continue;if(!orig.has(n))orig.set(n,n.nodeValue);const o=orig.get(n),k=o.trim();n.nodeValue=lang=="en"&&EN[k]?o.replace(k,EN[k]):o}
 $("#aNote").placeholder=tr("උදා: දවල් කෑම");
 document.title=tr("මගේ වියදම්");
 $("#lang").textContent=lang=="en"?"සිං":"EN";
 $("#today").textContent=new Date().toLocaleDateString(LOC(),{weekday:"long",month:"long",day:"numeric"});
 cats();render();
}
function load(){try{tx=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){tx=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(tx))}catch(e){toast("දත්ත සුරැකීමට නොහැකි විය")}}
const money=n=>"Rs. "+Number(n).toLocaleString("en-US",{maximumFractionDigits:2});
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const mkey=d=>ymd(d).slice(0,7);
function toast(m){const el=$("#toast");el.textContent=tr(m);el.classList.add("on");setTimeout(()=>el.classList.remove("on"),1800)}
function icon(t){const l=t.type=="e"?CE:CI;return(l[t.cat]||l[0])[0]}
function cname(t){const l=t.type=="e"?CE:CI;return tr((l[t.cat]||l[0])[1])}
function itemHTML(t){return`<div class="item"><div class="ic">${icon(t)}</div><div class="m"><b>${esc(t.note||cname(t))}</b><span>${cname(t)} • ${t.date}</span></div><div class="amt ${t.type}">${t.type=="e"?"−":"+"}${money(t.amt)}</div><button class="del" data-id="${t.id}" aria-label="මකන්න">✕</button></div>`}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
const sorted=l=>[...l].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
function inMonth(d){return tx.filter(t=>t.date.startsWith(mkey(d)))}
function sums(l){let i=0,e=0;l.forEach(t=>t.type=="i"?i+=t.amt:e+=t.amt);return{i,e}}
function render(){
  const now=new Date(),cur=inMonth(now),s=sums(cur);
  $("#hBal").textContent=money(s.i-s.e);$("#hIn").textContent=money(s.i);$("#hEx").textContent=money(s.e);
  const r=sorted(tx).slice(0,6);
  $("#hList").innerHTML=r.length?r.map(itemHTML).join(""):'<div class="empty">'+tr('තවම ගනුදෙනු නැත.<br>පහළ “එක් කරන්න” ඔබා පළමු වියදම සටහන් කරන්න.')+'</div>';
  const lbl=mo.toLocaleDateString(LOC(),{year:"numeric",month:"long"});
  $("#mLbl").textContent=lbl;$("#sLbl").textContent=lbl;
  const ml=sorted(inMonth(mo));
  $("#mList").innerHTML=ml.length?ml.map(itemHTML).join(""):'<div class="empty">'+tr('මෙම මාසයේ ගනුදෙනු නැත.')+'</div>';
  const ex=inMonth(mo).filter(t=>t.type=="e"),tot=ex.reduce((a,t)=>a+t.amt,0),by={};
  ex.forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amt);
  const ks=Object.keys(by).sort((a,b)=>by[b]-by[a]);
  $("#sBars").innerHTML=ks.length?ks.map(k=>`<div class="bar"><div class="t"><span>${CE[k][0]} ${tr(CE[k][1])}</span><span>${money(by[k])}</span></div><div class="tr"><div class="f" style="width:${by[k]/tot*100}%"></div></div></div>`).join(""):'<div class="empty">'+tr('වියදම් දත්ත නැත.')+'</div>';
}
function cats(){const l=type=="e"?CE:CI;if(cat>=l.length)cat=0;$("#aCats").innerHTML=l.map((c,i)=>`<button class="${i==cat?"on":""}" data-c="${i}"><span>${c[0]}</span>${tr(c[1])}</button>`).join("")}
function go(v){view=v;$$(".view").forEach(e=>e.classList.toggle("on",e.id=="v-"+v));$$("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v==v));$("main").scrollTop=0;render()}
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.v)go(b.dataset.v);
  else if(b.dataset.t){type=b.dataset.t;$$(".seg button").forEach(x=>x.classList.toggle("on",x==b));cats()}
  else if(b.dataset.c){cat=+b.dataset.c;cats()}
  else if(b.dataset.m){mo.setMonth(mo.getMonth()+ +b.dataset.m);render()}
  else if(b.dataset.id){if(confirm(tr("මෙම ගනුදෙනුව මකන්නද?"))){tx=tx.filter(t=>t.id!=b.dataset.id);save();render();toast("මකා දමන ලදී")}}
});
$("#aSave").onclick=()=>{
  const a=parseFloat($("#aAmt").value);
  if(!(a>0)){toast("කරුණාකර නිවැරදි මුදලක් ඇතුළත් කරන්න");$("#aAmt").focus();return}
  tx.push({id:Date.now(),type,cat,amt:a,note:$("#aNote").value.trim(),date:$("#aDate").value||ymd(new Date())});
  save();$("#aAmt").value="";$("#aNote").value="";toast("සුරකින ලදී");go("home");
};
function theme(t){document.documentElement.dataset.theme=t;$("#theme").textContent=t=="dark"?"☀️":"🌙";try{localStorage.setItem("theme",t)}catch(e){}}
$("#theme").onclick=()=>theme(document.documentElement.dataset.theme=="dark"?"light":"dark");
$("#exp").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(tx)],{type:"application/json"}));a.download="expenses-backup.json";a.click();toast("උපස්ථ ගොනුව සකස් විය")};
$("#impB").onclick=()=>$("#imp").click();
$("#imp").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d))throw 0;tx=d;save();render();toast("දත්ත ආපසු ගන්නා ලදී")}catch(x){toast("ගොනුව වලංගු නැත")}};r.readAsText(f)};
$("#clr").onclick=()=>{if(confirm(tr("සියලු දත්ත ස්ථිරවම මැකේ. ඉදිරියට යන්නද?"))){tx=[];save();render();toast("දත්ත මකා දමන ලදී")}};
let t0="light";try{t0=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light")}catch(e){}
theme(t0);load();cats();$("#aDate").value=ymd(new Date());
$("#lang").onclick=()=>{lang=lang=="en"?"si":"en";try{localStorage.setItem("lang",lang)}catch(e){}applyLang()};
applyLang();
render();
