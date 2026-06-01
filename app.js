/*
   Monster Energy Tracker — логика приложения.

   UI работает через единый интерфейс `store`, у которого две реализации:
   LocalStore (localStorage, ниже) и CloudStore (Firebase, в cloud.js).
   Это позволяет переключать источник данных не трогая UI.

   Интерфейс store:
     mode        "local" | "cloud"
     user        {name,email,photo} | null
     init()      подготовка (async)
     isTried(slug) / toggleTried(slug,v)
     getImage(slug) / setImage(slug,d) / clearImage(slug)
     allTried() / allImages()
     importBulk({tried,images},merge)
     onChange(cb)   подписка на изменения данных
     onStatus(cb)   подписка на статус синхронизации ("ok"/"saving"/"offline")
     signOut()
*/

(function(){
"use strict";

// общие утилиты
const RNAME = {1:"Обычный",2:"Необычный",3:"Редкий",4:"Очень редкий",5:"Легендарный"};
const SNAME = {new:"Новинка",lim:"Лимитка",disc:"Снят с пр-ва",alc:"Алкоголь",reg:"Региональный"};

function slugify(s){
  return s.toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function escapeHtml(s){return (s||"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function shortPH(name){ return name.replace(/Monster Energy|Monster|Energy|Java|Juice/gi,"").replace(/\s+/g," ").trim() || name; }

const DATA = (window.MONSTER_DATA||[]).map(d=>({...d, slug:slugify(d.n)}));

// LocalStore — данные хранятся только в этом браузере (localStorage)
function LocalStore(){
  const K_TRIED="monster-tried-v1";
  const K_IMG="monster-imgoverrides-v1";
  let tried=new Set(JSON.parse(localStorage.getItem(K_TRIED)||"[]"));
  let images=JSON.parse(localStorage.getItem(K_IMG)||"{}");
  const changeCbs=[], statusCbs=[];

  function saveTried(){ localStorage.setItem(K_TRIED, JSON.stringify([...tried])); }
  function saveImg(){
    try{ localStorage.setItem(K_IMG, JSON.stringify(images)); }
    catch(e){ alert("Не удалось сохранить фото — в браузере кончилось место."); }
  }
  function ping(){ statusCbs.forEach(cb=>cb("ok")); }

  return {
    mode:"local",
    user:null,
    async init(){ ping(); },
    isTried:(s)=>tried.has(s),
    toggleTried(s,v){ if(v) tried.add(s); else tried.delete(s); saveTried(); ping(); },
    getImage:(s)=>images[s]||null,
    setImage(s,d){ images[s]=d; saveImg(); ping(); },
    clearImage(s){ delete images[s]; saveImg(); ping(); },
    allTried:()=>[...tried],
    allImages:()=>({...images}),
    importBulk({tried:t,images:im},merge){
      if(merge){ (t||[]).forEach(s=>tried.add(s)); Object.assign(images,im||{}); }
      else{ tried=new Set(t||[]); images=im||{}; }
      saveTried(); saveImg(); changeCbs.forEach(cb=>cb()); ping();
    },
    onChange(cb){ changeCbs.push(cb); },
    onStatus(cb){ statusCbs.push(cb); },
    signOut(){ /* в локальном режиме выход = возврат к экрану входа */ }
  };
}

// CloudStore (Firebase) реализован в cloud.js и приходит через window.MonsterCloud.

// UI-слой — работает с любым store через общий интерфейс
let store=null;
const F={q:"",line:"",rarity:"",region:"",status:""};
const collapsed=new Set();
let pendingSlug=null;

const $=(id)=>document.getElementById(id);

function imgSrc(d){ return store.getImage(d.slug) || ("images/"+d.slug+".jpg"); }

function fillFilters(){
  const lines=[...new Set(DATA.map(d=>d.l))];
  const regs=[...new Set(DATA.map(d=>d.g))].sort();
  lines.forEach(l=>{const o=document.createElement("option");o.value=l;o.textContent=l;$("fLine").appendChild(o);});
  regs.forEach(r=>{const o=document.createElement("option");o.value=r;o.textContent=r;$("fRegion").appendChild(o);});
}

function passes(d){
  if(F.line && d.l!==F.line) return false;
  if(F.rarity && String(d.r)!==F.rarity) return false;
  if(F.region && d.g!==F.region) return false;
  if(F.status==="done" && !store.isTried(d.slug)) return false;
  if(F.status==="todo" && store.isTried(d.slug)) return false;
  if(F.q){
    const q=F.q.toLowerCase();
    if(!(d.n.toLowerCase().includes(q)||(d.t||"").toLowerCase().includes(q)||d.l.toLowerCase().includes(q))) return false;
  }
  return true;
}

function cardHTML(d){
  const done=store.isTried(d.slug);
  const custom=!!store.getImage(d.slug);
  const photoQ=encodeURIComponent(d.n+" monster energy can");
  const tags=[];
  tags.push(`<span class="rb r${d.r}" style="font-size:10px;padding:2px 7px">${RNAME[d.r]}</span>`);
  tags.push(`<span class="tag">${d.g}</span>`);
  if(d.s && SNAME[d.s]) tags.push(`<span class="tag st-${d.s}">${SNAME[d.s]}</span>`);
  return `
  <div class="card ${done?'done':''} ${d.s==='alc'?'alc':''} ${custom?'custom':''}" data-slug="${d.slug}">
    <div class="thumb" style="--c:${d.c}" data-full="${escapeHtml(d.n)}" data-q="${photoQ}">
      <div class="ph">${escapeHtml(shortPH(d.n))}<small>${d.l}</small></div>
      <img loading="lazy" src="${imgSrc(d)}" alt="${escapeHtml(d.n)}" onerror="this.style.display='none'">
    </div>
    <div class="body">
      <div class="name">${escapeHtml(d.n)}</div>
      <div class="taste">${escapeHtml(d.t||"")}</div>
      <div class="tags">${tags.join("")}</div>
      <div class="row2">
        <label class="chk"><input type="checkbox" ${done?'checked':''} data-slug="${d.slug}"> попробовал</label>
        <a class="photo" href="https://www.google.com/search?tbm=isch&q=${photoQ}" target="_blank" rel="noopener">🔍 фото</a>
        <button class="editbtn" data-edit="${d.slug}">✎ фото</button>
        <button class="revertbtn" data-revert="${d.slug}">↺</button>
      </div>
    </div>
  </div>`;
}

function render(){
  const visible=DATA.filter(passes);
  const order=[...new Set(DATA.map(d=>d.l))];
  let html="",shown=0;
  order.forEach(line=>{
    const items=visible.filter(d=>d.l===line);
    if(!items.length) return;
    shown+=items.length;
    const doneN=items.filter(d=>store.isTried(d.slug)).length;
    const col=collapsed.has(line)?'collapsed':'';
    html+=`<div class="group ${col}" data-line="${escapeHtml(line)}">
      <div class="ghead" data-line="${escapeHtml(line)}">
        <span class="arr">▼</span><h2>${escapeHtml(line)}</h2><span class="cnt">${doneN}/${items.length}</span>
      </div>
      <div class="grid">${items.map(cardHTML).join("")}</div>
    </div>`;
  });
  $("list").innerHTML=html;
  $("empty").style.display=shown?"none":"block";
  updateProgress();
}

function updateProgress(){
  const total=DATA.length, done=DATA.filter(d=>store.isTried(d.slug)).length;
  const pct=total?Math.round(done/total*100):0;
  $("progfill").style.width=pct+"%";
  $("progtxt").innerHTML=`Попробовано: <b>${done}</b> из ${total} &nbsp;·&nbsp; ${pct}%`;
}

function setStatus(s){
  const el=$("syncDot"), txt=$("syncTxt");
  el.className="syncdot "+(s==="saving"?"saving":s==="offline"?"offline":"ok");
  txt.textContent = store.mode==="local"
    ? "локально"
    : (s==="saving"?"сохраняю…":s==="offline"?"офлайн":"синхронизировано");
}

// ---------- события трекера ----------
function wireApp(){
  $("list").addEventListener("change",e=>{
    const cb=e.target.closest("input[type=checkbox]"); if(!cb) return;
    store.toggleTried(cb.dataset.slug, cb.checked);
    const card=cb.closest(".card"); card.classList.toggle("done",cb.checked);
    const group=card.closest(".group");
    const items=[...group.querySelectorAll(".card")];
    group.querySelector(".cnt").textContent=`${items.filter(c=>store.isTried(c.dataset.slug)).length}/${items.length}`;
    updateProgress();
    if(F.status) render();
  });

  $("list").addEventListener("click",e=>{
    const edit=e.target.closest("[data-edit]");
    if(edit){ pendingSlug=edit.dataset.edit; $("photoFile").click(); return; }
    const rev=e.target.closest("[data-revert]");
    if(rev){ store.clearImage(rev.dataset.revert); render(); return; }
    const head=e.target.closest(".ghead");
    if(head){
      const line=head.dataset.line;
      if(collapsed.has(line)) collapsed.delete(line); else collapsed.add(line);
      head.closest(".group").classList.toggle("collapsed"); return;
    }
    const thumb=e.target.closest(".thumb");
    if(thumb){
      const img=thumb.querySelector("img"), full=thumb.dataset.full, q=thumb.dataset.q;
      const mi=$("modalImg"), mc=$("modalCap");
      if(img && img.style.display!=="none" && img.complete && img.naturalWidth>0){ mi.src=img.src; mi.style.display=""; }
      else{ mi.style.display="none"; }
      mc.innerHTML=`${escapeHtml(full)}<br><a href="https://www.google.com/search?tbm=isch&q=${q}" target="_blank" rel="noopener">Открыть в Google Картинках →</a>`;
      $("modal").classList.add("open");
    }
  });
  $("modal").addEventListener("click",()=>$("modal").classList.remove("open"));

  // выбор + сжатие своего фото
  $("photoFile").addEventListener("change",e=>{
    const f=e.target.files[0]; e.target.value="";
    if(!f||!pendingSlug) return;
    const slug=pendingSlug; pendingSlug=null;
    const r=new FileReader();
    r.onload=()=>{
      const im=new Image();
      im.onload=()=>{
        const max=520; let w=im.width,h=im.height;
        if(w>h&&w>max){h=Math.round(h*max/w);w=max;} else if(h>=w&&h>max){w=Math.round(w*max/h);h=max;}
        const c=document.createElement("canvas"); c.width=w;c.height=h;
        c.getContext("2d").drawImage(im,0,0,w,h);
        store.setImage(slug, c.toDataURL("image/jpeg",0.82)); render();
      };
      im.onerror=()=>alert("Не удалось прочитать изображение.");
      im.src=r.result;
    };
    r.readAsDataURL(f);
  });

  // фильтры
  $("search").addEventListener("input",e=>{F.q=e.target.value;render();});
  $("fLine").addEventListener("change",e=>{F.line=e.target.value;render();});
  $("fRarity").addEventListener("change",e=>{F.rarity=e.target.value;render();});
  $("fRegion").addEventListener("change",e=>{F.region=e.target.value;render();});
  $("fStatus").addEventListener("change",e=>{F.status=e.target.value;render();});

  $("expand").addEventListener("click",function(){
    const lines=[...new Set(DATA.map(d=>d.l))];
    if(collapsed.size<lines.length){ lines.forEach(l=>collapsed.add(l)); this.textContent="Развернуть всё"; }
    else{ collapsed.clear(); this.textContent="Свернуть всё"; }
    render();
  });

  // экспорт / импорт (галочки + фото)
  $("export").addEventListener("click",()=>{
    const data={app:"monster-tracker",version:2,date:new Date().toISOString(),
      tried:store.allTried(), images:store.allImages()};
    const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="monster-progress.json"; a.click();
  });
  $("importBtn").addEventListener("click",()=>$("importFile").click());
  $("importFile").addEventListener("change",e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const d=JSON.parse(r.result);
        const arr=Array.isArray(d)?d:(d.tried||[]);
        const imgs=(d&&d.images)?d.images:{};
        if(!Array.isArray(arr)) throw 0;
        const merge=confirm("OK = объединить с тем, что уже есть.\nОтмена = заменить.");
        store.importBulk({tried:arr,images:imgs}, merge);
        render();
        alert("Импортировано: "+arr.length+" галочек, "+Object.keys(imgs).length+" фото.");
      }catch(_){ alert("Не удалось прочитать файл прогресса."); }
    };
    r.readAsText(f); e.target.value="";
  });

  $("logoutBtn").addEventListener("click",()=>{
    store.signOut();
    showLogin();
  });
}

function renderAccount(){
  const who=$("whoBox");
  if(store.user){
    who.innerHTML = (store.user.photo?`<img src="${store.user.photo}" alt="">`:"")
      + `<span>${escapeHtml(store.user.name||store.user.email||"Аккаунт")}</span>`;
  }else{
    who.innerHTML = `<span>Локальный режим (без входа)</span>`;
  }
  $("footer").innerHTML = store.mode==="local"
    ? "Локальный режим: данные хранятся только в этом браузере. Подключи облако (firebase-config.js) — появится вход и синхронизация между устройствами. Перенос: «⬇ Экспорт» здесь и «⬆ Импорт» на другом устройстве."
    : "Облачный режим: галочки и фото синхронизируются между твоими устройствами автоматически.";
}

// ---------- переключение экранов ----------
function showLogin(){
  $("appView").style.display="none";
  $("loginView").style.display="flex";
}
async function showApp(){
  $("loginView").style.display="none";
  $("appView").style.display="block";
  renderAccount();
  // подписываемся ровно один раз на каждый экземпляр store
  if(!store._wired){
    store._wired=true;
    store.onStatus(setStatus);
    store.onChange(()=>render());
  }
  await store.init();
  setStatus("ok");
  render();
}

// PWA: регистрация service worker, установка, офлайн-кэш фото
let deferredInstall=null;

function registerSW(){
  if(!("serviceWorker" in navigator)) return;
  // SW работает только по http(s); при открытии файла (file://) тихо пропускаем
  if(location.protocol==="file:"){
    console.info("Открыто как файл (file://) — офлайн-кэш и установка доступны только при запуске через веб-сервер/хостинг.");
    return;
  }
  navigator.serviceWorker.register("service-worker.js").then(reg=>{
    // если есть ожидающий новый SW — активировать сразу
    if(reg.waiting) reg.waiting.postMessage("skipWaiting");
    // ловим появление новой версии и просим её активироваться
    reg.addEventListener("updatefound",()=>{
      const nw=reg.installing;
      if(nw) nw.addEventListener("statechange",()=>{
        if(nw.state==="installed" && navigator.serviceWorker.controller){
          nw.postMessage("skipWaiting");
        }
      });
    });
  }).catch(err=>console.warn("SW не зарегистрирован:",err));

  // когда новый SW взял управление — один раз перезагрузить страницу за свежим кодом
  let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(reloaded) return; reloaded=true; location.reload();
  });
}

function wirePWA(){
  // событие готовности к установке (Chrome/Edge/Android)
  window.addEventListener("beforeinstallprompt",(e)=>{
    e.preventDefault(); deferredInstall=e;
    const b=$("installBtn"); if(b) b.style.display="";
  });
  window.addEventListener("appinstalled",()=>{
    deferredInstall=null;
    const b=$("installBtn"); if(b) b.style.display="none";
  });

  const ib=$("installBtn");
  if(ib) ib.addEventListener("click",async()=>{
    if(!deferredInstall){
      alert("Если кнопка не сработала: в Chrome открой меню ⋮ → «Установить приложение» / «Добавить на главный экран».");
      return;
    }
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall=null; ib.style.display="none";
  });

  // «📥 Фото офлайн» — прогреть кэш всеми фото, чтобы работало без сети
  const cb=$("cacheBtn");
  if(cb) cb.addEventListener("click",()=>cacheAllPhotos(cb));
}

async function cacheAllPhotos(btn){
  if(location.protocol==="file:"){
    alert("Сейчас приложение открыто как файл. Офлайн-кэш фото включится, когда приложение будет на хостинге/сервере. "+
          "Прямо сейчас фото и так лежат локально в папке images/ и работают.");
    return;
  }
  const urls=DATA.map(d=>"images/"+d.slug+".jpg");
  const total=urls.length; let done=0, fail=0;
  const orig=btn.textContent; btn.disabled=true;
  const tick=()=>{ btn.textContent=`📥 ${done+fail}/${total}…`; };
  tick();
  // грузим пачками, чтобы не завалить сеть
  const BATCH=8;
  for(let i=0;i<urls.length;i+=BATCH){
    const part=urls.slice(i,i+BATCH);
    await Promise.all(part.map(u=>
      fetch(u,{cache:"reload"}).then(r=>{ r.ok?done++:fail++; }).catch(()=>{ fail++; })
    ));
    tick();
  }
  btn.disabled=false;
  btn.textContent=orig;
  alert(`Готово. Фото в офлайн-кэше: ${done} из ${total}`+(fail?`, не удалось: ${fail}`:"")+
        ".\nТеперь они открываются без интернета.");
}

// ---------- инициализация ----------
function wireLegal(){
  const open=()=>$("legalModal").classList.add("open");
  const close=()=>$("legalModal").classList.remove("open");
  const b=$("legalBtn"); if(b) b.addEventListener("click",open);
  const bl=$("legalBtnLogin"); if(bl) bl.addEventListener("click",open);
  const c=$("legalClose"); if(c) c.addEventListener("click",close);
  const m=$("legalModal"); if(m) m.addEventListener("click",close);
  const cp=$("copyEmail");
  if(cp) cp.addEventListener("click",async()=>{
    const email="pogodin4olezhkaffff@gmail.com";
    let ok=false;
    // способ 1: современный Clipboard API (нужен https/localhost)
    if(navigator.clipboard && window.isSecureContext){
      try{ await navigator.clipboard.writeText(email); ok=true; }catch(_){}
    }
    // способ 2 (запасной): скрытое поле + execCommand — работает и на file://
    if(!ok){
      try{
        const ta=document.createElement("textarea");
        ta.value=email; ta.style.position="fixed"; ta.style.opacity="0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        ok=document.execCommand("copy");
        document.body.removeChild(ta);
      }catch(_){}
    }
    // способ 3 (если совсем нельзя): выделить почту, чтобы скопировать руками
    if(!ok){
      const el=$("legalEmail");
      if(el){ const r=document.createRange(); r.selectNodeContents(el);
        const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
    }
    cp.textContent = ok ? "✓ Скопировано" : "Выделено — нажми Ctrl+C";
    setTimeout(()=>{ cp.textContent="📋 Скопировать"; }, 2000);
  });
}

function boot(){
  fillFilters();
  wireApp();
  wireLegal();
  wirePWA();
  registerSW();

  const cfg=window.FIREBASE_CONFIG;
  const cloudConfigured = cfg && typeof cfg==="object" && cfg.apiKey;
  const fileMode = location.protocol==="file:";
  const badge=$("modeBadge");
  const rememberCb=$("rememberCb");

  $("localBtn").addEventListener("click",enterLocal);

  // ===== ОБЛАЧНЫЙ РЕЖИМ (config есть, открыто по http(s), мост загружен) =====
  if(cloudConfigured && !fileMode && window.MonsterCloud){
    badge.textContent="☁ облачный режим"; badge.className="modebadge cloud";
    $("loginNote").textContent="Войди, чтобы галочки и фото синхронизировались между устройствами.";

    const cloud=window.MonsterCloud;

    cloud.onAuth((cloudStore)=>{
      if(cloudStore){ store=cloudStore; showApp(); }
      else{
        if(store && store.mode==="local") return; // пользователь сам выбрал локально
        showLogin();
      }
    });

    cloud.start(cfg).then(ok=>{
      if(!ok){
        badge.textContent="● локальный режим (нет связи с облаком)"; badge.className="modebadge local";
        wireLocalLoginButtons();
        showLogin();
      }
    });

    $("googleBtn").addEventListener("click",async()=>{
      try{ await cloud.loginGoogle(rememberCb.checked); }
      catch(e){ alert("Не удалось войти через Google: "+((e&&e.message)||e)); }
    });
    $("emailBtn").addEventListener("click",async()=>{
      const email=($("emailInput").value||"").trim();
      if(!email||!email.includes("@")){ alert("Введи корректный e-mail."); return; }
      try{
        await cloud.loginEmail(email, rememberCb.checked);
        $("loginNote").innerHTML="📧 Письмо со ссылкой для входа отправлено на <b>"+escapeHtml(email)+"</b>.<br>"+
          "Открой письмо на ЭТОМ устройстве и нажми ссылку. Проверь «Спам».";
      }catch(e){ alert("Не удалось отправить письмо: "+((e&&e.message)||e)); }
    });
    return;
  }

  // ===== ЛОКАЛЬНЫЙ РЕЖИМ =====
  if(cloudConfigured && fileMode){
    badge.textContent="● локальный режим (открыто как файл)"; badge.className="modebadge local";
    $("loginNote").innerHTML="Облако подключено, но вход работает только по адресу http(s) "+
      "(хостинг или локальный сервер), не из файла. Пока можно пользоваться локально.";
  }else{
    badge.textContent="● локальный режим (облако не подключено)"; badge.className="modebadge local";
    $("loginNote").innerHTML="Облако не настроено. Можно пользоваться локально — данные сохранятся в этом браузере.";
  }
  wireLocalLoginButtons();

  if(localStorage.getItem("monster-entered-local")==="1"){ enterLocal(); }
  else{ showLogin(); }
}

// в локальном режиме кнопки Google/почта просто заводят локально
function wireLocalLoginButtons(){
  $("googleBtn").addEventListener("click",enterLocal);
  $("emailBtn").addEventListener("click",enterLocal);
}

function enterLocal(){
  localStorage.setItem("monster-entered-local","1");
  store=LocalStore();
  store.user=null;
  showApp();
}

document.addEventListener("DOMContentLoaded",boot);
})();
