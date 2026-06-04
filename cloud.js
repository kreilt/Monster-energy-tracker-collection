/*
   cloud.js — облачный слой (Firebase). Подключается как ES-модуль и
   общается с app.js через window.MonsterCloud.

   Отвечает за инициализацию Firebase (Auth + Firestore с офлайн-кэшем),
   вход через Google и по email-ссылке, выбор persistence по галочке
   «запомнить меня», и за CloudStore с тем же интерфейсом, что LocalStore.
   При сбое инициализации (нет сети) app.js откатывается в локальный режим.
*/

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";

let auth=null, db=null, fb=null; // fb = собранные функции SDK

async function loadSDK(){
  const appMod  = await import(`${SDK}/firebase-app.js`);
  const authMod = await import(`${SDK}/firebase-auth.js`);
  const fsMod   = await import(`${SDK}/firebase-firestore.js`);
  return { appMod, authMod, fsMod };
}

async function init(config){
  const { appMod, authMod, fsMod } = await loadSDK();
  const app = appMod.initializeApp(config);

  // Firestore с офлайн-кэшем (несколько вкладок). Если не вышло — обычный.
  try{
    db = fsMod.initializeFirestore(app, {
      localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() })
    });
  }catch(e){
    db = fsMod.getFirestore(app);
  }

  auth = authMod.getAuth(app);

  // сложим нужные функции в один объект, чтобы дальше звать коротко
  fb = {
    // auth
    GoogleAuthProvider: authMod.GoogleAuthProvider,
    signInWithPopup: authMod.signInWithPopup,
    signInWithRedirect: authMod.signInWithRedirect,
    getRedirectResult: authMod.getRedirectResult,
    onAuthStateChanged: authMod.onAuthStateChanged,
    signOut: authMod.signOut,
    setPersistence: authMod.setPersistence,
    browserLocalPersistence: authMod.browserLocalPersistence,
    browserSessionPersistence: authMod.browserSessionPersistence,
    sendSignInLinkToEmail: authMod.sendSignInLinkToEmail,
    isSignInWithEmailLink: authMod.isSignInWithEmailLink,
    signInWithEmailLink: authMod.signInWithEmailLink,
    // firestore
    doc: fsMod.doc,
    getDoc: fsMod.getDoc,
    setDoc: fsMod.setDoc,
    onSnapshot: fsMod.onSnapshot,
    serverTimestamp: fsMod.serverTimestamp
  };

  return { auth, db, fb };
}

// ---------- персистентность (запоминать вход или нет) ----------
async function applyPersistence(remember){
  try{
    await fb.setPersistence(auth, remember ? fb.browserLocalPersistence : fb.browserSessionPersistence);
  }catch(e){ console.warn("persistence:", e); }
}

// ---------- вход Google ----------
async function signInGoogle(remember){
  await applyPersistence(remember);
  const provider = new fb.GoogleAuthProvider();
  try{
    await fb.signInWithPopup(auth, provider);
  }catch(e){
    // на некоторых мобильных popup блокируется → редирект
    if(e && (e.code==="auth/popup-blocked" || e.code==="auth/operation-not-supported-in-this-environment" || e.code==="auth/cancelled-popup-request")){
      await fb.signInWithRedirect(auth, provider);
    }else{
      throw e;
    }
  }
}

// ---------- вход по ссылке на почту ----------
const EMAIL_KEY = "monster-emailforsignin";
function actionUrl(){
  // ссылка возврата = текущая страница (app.html). Должна быть в Authorized domains.
  return location.origin + location.pathname;
}
async function sendEmailLink(email, remember){
  localStorage.setItem(EMAIL_KEY, email);
  localStorage.setItem(EMAIL_KEY+"-remember", remember ? "1":"0");
  await fb.sendSignInLinkToEmail(auth, email, { url: actionUrl(), handleCodeInApp: true });
}
async function completeEmailLinkIfPresent(){
  if(!fb.isSignInWithEmailLink(auth, location.href)) return false;
  let email = localStorage.getItem(EMAIL_KEY);
  if(!email){ email = window.prompt("Подтверди свою почту для входа:") || ""; }
  const remember = localStorage.getItem(EMAIL_KEY+"-remember")!=="0";
  await applyPersistence(remember);
  await fb.signInWithEmailLink(auth, email, location.href);
  localStorage.removeItem(EMAIL_KEY);
  // убрать длинные параметры ссылки из адреса
  history.replaceState({}, document.title, actionUrl());
  return true;
}

// ---------- профиль пользователя в простом виде ----------
function userInfo(u){
  if(!u) return null;
  return { uid:u.uid, name:u.displayName||"", email:u.email||"", photo:u.photoURL||"" };
}

// CloudStore — тот же интерфейс, что LocalStore в app.js
function makeCloudStore(user){
  const uid = user.uid;
  const ref = fb.doc(db, "users", uid);

  let tried = new Set();
  let images = {};
  let loaded = false;
  let dirty = false;        // есть несохранённые локальные правки
  const changeCbs=[], statusCbs=[];
  let saveTimer=null;

  function emitChange(){ changeCbs.forEach(cb=>cb()); }
  function emitStatus(s){ statusCbs.forEach(cb=>cb(s)); }

  // вычисляем статус по реальному состоянию сети и наличию несохранённых записей,
  // а НЕ по fromCache (иначе свежий вход из кэша ложно показывает «офлайн»)
  function statusFrom(meta){
    if(meta && meta.hasPendingWrites) return "saving";
    if(!navigator.onLine) return "offline";
    return "ok";
  }

  // подпись произвольного состояния (чтобы сравнивать и не перерисовывать зря)
  function sigOf(t, im){
    let s = [...t].sort().join("|") + "##";
    const keys = Object.keys(im).sort();
    for(const k of keys){ s += k + ":" + (im[k]?im[k].length:0) + ";"; }
    return s;
  }
  function dataSig(){ return sigOf(tried, images); }
  let lastSig = null;

  // живое обновление. includeMetadataChanges:true — чтобы ловить подтверждение
  // сервера (переход hasPendingWrites true→false) и обновлять индикатор.
  const unsubSnap = fb.onSnapshot(ref, { includeMetadataChanges:true }, (snap)=>{
    // Пока есть несохранённые локальные правки (dirty) — НЕ принимаем данные из
    // снимка, иначе старое облачное состояние затрёт изменение (например,
    // удалённое фото вернётся). Берём только статус синхронизации.
    if(dirty){ emitStatus(statusFrom(snap.metadata)); return; }
    const d = snap.data() || {};
    tried = new Set(Array.isArray(d.tried)? d.tried : []);
    images = (d.images && typeof d.images==="object") ? d.images : {};
    loaded = true;
    const sig = dataSig();
    if(sig !== lastSig){ lastSig = sig; emitChange(); } // перерисовка только при реальном изменении данных
    emitStatus(statusFrom(snap.metadata));
  }, (err)=>{
    console.warn("onSnapshot error:", err);
    emitStatus(navigator.onLine ? "ok" : "offline");
  });

  // реагируем на пропадание/возврат сети, даже без событий снапшота
  const onOnline  = ()=>emitStatus("ok");
  const onOffline = ()=>emitStatus("offline");
  window.addEventListener("online",  onOnline);
  window.addEventListener("offline", onOffline);

  // снять все подписки этого store (вызывается при выходе)
  function dispose(){
    try{ unsubSnap(); }catch(_){}
    window.removeEventListener("online",  onOnline);
    window.removeEventListener("offline", onOffline);
  }

  function scheduleSave(){
    dirty = true;           // появилась несохранённая правка
    emitStatus("saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 400); // дебаунс, чтобы не писать на каждый клик
  }
  async function persist(){
    // фиксируем состояние на момент записи, чтобы понять — не появилось ли новых правок
    const snapTried=[...tried], snapImages={...images};
    const sigAtSave = sigOf(snapTried, snapImages);
    try{
      // Пишем документ ЦЕЛИКОМ, без merge: merge для вложенной карты images НЕ
      // удаляет снятые ключи (из-за этого удалённое фото возвращалось). Клиент
      // всегда держит полное актуальное состояние, поэтому пишем его целиком.
      await fb.setDoc(ref, {
        tried:snapTried, images:snapImages, email:user.email||"", updatedAt: fb.serverTimestamp()
      });
      // снимаем dirty только если за время записи не появилось новых правок
      if(dataSig()===sigAtSave){ dirty=false; lastSig=sigAtSave; }
      emitStatus(navigator.onLine ? "ok" : "offline");
    }catch(e){
      console.warn("save error:", e);
      // оставляем dirty=true — Firestore досинхронит из офлайн-кэша позже
      emitStatus(navigator.onLine ? "ok" : "offline");
    }
  }

  return {
    mode:"cloud",
    user: userInfo(user),
    async init(){ /* данные придут через onSnapshot */ },
    isTried:(s)=>tried.has(s),
    toggleTried(s,v){ if(v) tried.add(s); else tried.delete(s); scheduleSave(); },
    getImage:(s)=>images[s]||null,
    setImage(s,d){ images={...images,[s]:d}; scheduleSave(); },
    clearImage(s){ const c={...images}; delete c[s]; images=c; scheduleSave(); },
    allTried:()=>[...tried],
    allImages:()=>({...images}),
    importBulk({tried:t,images:im},merge){
      if(merge){ (t||[]).forEach(s=>tried.add(s)); images={...images,...(im||{})}; }
      else{ tried=new Set(t||[]); images=im||{}; }
      scheduleSave(); emitChange();
    },
    onChange(cb){ changeCbs.push(cb); if(loaded) cb(); },
    onStatus(cb){ statusCbs.push(cb); },
    async signOut(){ dispose(); await fb.signOut(auth); }
  };
}

// Мост в app.js
window.MonsterCloud = {
  available:false,         // станет true после успешного init
  ready:false,
  _cbAuth:null,

  async start(config){
    try{
      await init(config);
      this.available = true;
    }catch(e){
      console.warn("Firebase init не удался — останемся в локальном режиме:", e);
      this.available = false;
      return false;
    }
    // обработать возврат по email-ссылке (если зашли по ней)
    try{ await completeEmailLinkIfPresent(); }catch(e){ console.warn("email link:", e); }
    // обработать возврат после signInWithRedirect (Google на мобиле)
    try{ await fb.getRedirectResult(auth); }catch(e){ /* норм, если не было редиректа */ }

    // следить за состоянием входа
    fb.onAuthStateChanged(auth, (u)=>{
      this.ready = true;
      if(this._cbAuth) this._cbAuth(u ? makeCloudStore(u) : null);
    });
    return true;
  },

  onAuth(cb){ this._cbAuth = cb; },

  async loginGoogle(remember){ return signInGoogle(remember); },
  async loginEmail(email, remember){ return sendEmailLink(email, remember); }
};

// сообщить app.js, что модуль загрузился (на случай гонки загрузки)
window.dispatchEvent(new Event("monstercloud-loaded"));
