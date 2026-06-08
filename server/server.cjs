// ── Mal & Alım Takip — yerel sunucu ───────────────────────────────
// Çift tıkla → bu sunucu başlar, tarayıcı açılır. Veri TARAYICIDA değil,
// diskte gerçek bir dosyada (veriler.json) tutulur + her kayıtta tarihli
// otomatik yedek alınır. Sadece Node yerleşik modülleri kullanır.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { exec } = require("node:child_process");

const PORT = Number(process.env.PORT) || 4178;

// Veri klasörü: kullanıcı ana dizininde, erişilebilir ve kalıcı
const DATA_DIR = process.env.MALTAKIP_DIR || path.join(os.homedir(), "MalAlimTakip");
const DATA_FILE = path.join(DATA_DIR, "veriler.json");
const BACKUP_DIR = path.join(DATA_DIR, "yedekler");
const KEEP_BACKUPS = 60;

// Uygulama HTML'i: pakette sabit string olarak gömülüdür (build sırasında
// üretilir); geliştirme/paketlenmemiş halde dist/index.html'den okunur.
let INDEX_HTML = null;
try {
  INDEX_HTML = require("./index.generated.cjs");
} catch {
  /* geliştirme: aşağıda dist'ten okunur */
}
function getIndexHtml() {
  if (INDEX_HTML) return INDEX_HTML;
  return fs.readFileSync(path.join(__dirname, "..", "dist", "index.html"), "utf8");
}

function ensureDirs() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function readData() {
  try {
    return fs.readFileSync(DATA_FILE, "utf8");
  } catch {
    return null;
  }
}

function writeData(text) {
  ensureDirs();
  fs.writeFileSync(DATA_FILE, text);
  // tarihli otomatik yedek (kazara bozulmaya karşı geçmişe dönülebilir)
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  fs.writeFileSync(path.join(BACKUP_DIR, `veriler-${stamp}.json`), text);
  pruneBackups();
}

function pruneBackups() {
  try {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("veriler-") && f.endsWith(".json"))
      .sort();
    while (files.length > KEEP_BACKUPS) {
      fs.unlinkSync(path.join(BACKUP_DIR, files.shift()));
    }
  } catch {
    /* yoksay */
  }
}

const server = http.createServer((req, res) => {
  const url = (req.url || "/").split("?")[0];

  if (url === "/api/data") {
    if (req.method === "GET") {
      const text = readData();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(text || JSON.stringify({ empty: true }));
      return;
    }
    if (req.method === "PUT" || req.method === "POST") {
      let body = "";
      req.on("data", (c) => {
        body += c;
        if (body.length > 80 * 1024 * 1024) req.destroy(); // ~80MB güvenlik sınırı
      });
      req.on("end", () => {
        try {
          JSON.parse(body); // doğrula
          writeData(body);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "bad-json" }));
        }
      });
      return;
    }
    res.writeHead(405);
    res.end();
    return;
  }

  // Uygulamayı kapat (sayfadaki "Kapat" düğmesi)
  if (url === "/api/quit" && (req.method === "POST" || req.method === "GET")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    console.log("Kapatma isteği alındı — çıkılıyor.");
    setTimeout(() => process.exit(0), 200);
    return;
  }

  // Diğer her yol → uygulamayı sun
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(getIndexHtml());
});

function openBrowser(target) {
  const cmd =
    process.platform === "darwin"
      ? `open "${target}"`
      : process.platform === "win32"
      ? `start "" "${target}"`
      : `xdg-open "${target}"`;
  exec(cmd, () => {});
}

ensureDirs();

server.on("error", (e) => {
  // Zaten çalışıyorsa (port dolu): yeni sunucu açma, var olanı tarayıcıda aç
  if (e.code === "EADDRINUSE") {
    console.log(`Zaten çalışıyor — tarayıcı açılıyor: http://localhost:${PORT}`);
    openBrowser(`http://localhost:${PORT}`);
    process.exit(0);
  }
  console.error(e);
  process.exit(1);
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log("Mal & Alım Takip çalışıyor.");
  console.log("  Adres      : " + url);
  console.log("  Veri dosyası: " + DATA_FILE);
  console.log("  Yedekler    : " + BACKUP_DIR);
  console.log("\nKapatmak için bu pencereyi kapatın.");
  openBrowser(url);
});
