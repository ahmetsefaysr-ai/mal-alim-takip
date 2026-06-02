// Basit çevrimdışı önbellek — stale-while-revalidate.
// Vite çıktı dosyaları hash'lendiği için sabit liste yerine
// istenen aynı-köken GET'lerini çalışma anında önbelleğe alır.
const CACHE = "mal-takip-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Yalnızca aynı kökeni önbelleğe al (ör. Google Fonts ağa bırakılır)
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);

      if (cached) {
        e.waitUntil(network); // arka planda tazele
        return cached;
      }
      const res = await network;
      if (res) return res;

      // Çevrimdışı + önbellekte yok: gezinme isteklerinde app kabuğunu ver
      if (req.mode === "navigate") {
        const shell = (await cache.match("./")) || (await cache.match("index.html"));
        if (shell) return shell;
      }
      return new Response("", { status: 504, statusText: "offline" });
    })
  );
});
