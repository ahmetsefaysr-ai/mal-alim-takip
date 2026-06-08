// ── Yerel dosya saklama (File System Access API) ──────────────────
// Veriyi tarayıcı hafızası yerine diskte gerçek bir .json dosyasında tutar.
// Dosya tutamacı (handle) IndexedDB'de saklanır → sonraki açılışta yeniden bağlanır.

const DB_NAME = "mal-takip-fs";
const STORE = "handles";
const KEY = "data-file";

export const fsaSupported = () =>
  typeof window !== "undefined" &&
  "showSaveFilePicker" in window &&
  "showOpenFilePicker" in window;

// ── IndexedDB (tutamaç saklamak için) ──
function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbReq(mode, fn) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const os = tx.objectStore(STORE);
    let out;
    const r = fn(os);
    if (r) r.onsuccess = () => (out = r.result);
    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error);
  });
}

export const getSavedHandle = () => idbReq("readonly", (os) => os.get(KEY)).then((v) => v || null);
export const saveHandle = (h) => idbReq("readwrite", (os) => os.put(h, KEY));
export const clearSavedHandle = () => idbReq("readwrite", (os) => os.delete(KEY));

// ── İzin ──
export async function verifyPermission(handle, write = true) {
  const opts = { mode: write ? "readwrite" : "read" };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  if ((await handle.requestPermission(opts)) === "granted") return true;
  return false;
}

// ── Dosya seçiciler (kullanıcı tıklaması gerektirir) ──
export async function pickExistingFile() {
  const [handle] = await window.showOpenFilePicker({
    multiple: false,
    types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
  });
  return handle;
}

export function createNewFile(suggestedName = "mal-takip-veriler.json") {
  return window.showSaveFilePicker({
    suggestedName,
    types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
  });
}

// ── Oku / Yaz ──
export async function readJSON(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

export async function writeJSON(handle, data) {
  const w = await handle.createWritable();
  await w.write(JSON.stringify(data, null, 2));
  await w.close();
}
