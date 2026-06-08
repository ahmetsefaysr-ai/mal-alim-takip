// ── Sunucu (yerel disk) ile senkron ───────────────────────────────
// Uygulama yerel sunucu tarafından sunulduğunda veri /api/data üzerinden
// diske yazılır. Sunucu yoksa (ör. dosya doğrudan açıldıysa) fetch başarısız
// olur ve uygulama tarayıcı önbelleğiyle (localStorage) çalışmaya devam eder.

const API = "/api/data";

export async function fetchServerData() {
  const res = await fetch(API, { cache: "no-store" });
  if (!res.ok) throw new Error("server-get");
  return res.json();
}

export async function saveServerData(data) {
  const res = await fetch(API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("server-put");
  return res.json();
}

// Yerel sunucuyu (uygulamayı) kapatır
export async function quitServer() {
  await fetch("/api/quit", { method: "POST" });
}
