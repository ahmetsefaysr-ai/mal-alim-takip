// PWA ikonlarını saf Node ile üretir (harici bağımlılık yok).
// Altın gradyan zemin + simit benzeri üç beyaz halka motifi.
// Çalıştır:  node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
mkdirSync(OUT, { recursive: true });

// ── CRC32 ──
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0);
  return Buffer.concat([len, tb, data, crc]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  // satır başına filtre baytı (0 = None)
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function drawIcon(N) {
  const rgba = Buffer.alloc(N * N * 4);
  // Simit halkaları (normalize) — üstte iki, altta bir loop
  const rings = [
    [0.36, 0.44, 0.15],
    [0.64, 0.44, 0.15],
    [0.5, 0.6, 0.17],
  ].map(([cx, cy, r]) => [cx * N, cy * N, r * N]);
  const half = 0.055 * N * 0.5; // halka bandı yarı kalınlığı
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      // Diyagonal altın gradyan zemin (#b78c2e → #7d5d18)
      const t = (x + y) / (2 * (N - 1));
      let r = lerp(183, 125, t);
      let g = lerp(140, 93, t);
      let b = lerp(46, 24, t);
      // Beyaz halka kaplaması (kenar yumuşatma ile)
      let cov = 0;
      for (const [cx, cy, rad] of rings) {
        const d = Math.abs(Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - rad);
        cov = Math.max(cov, clamp01(half + 0.75 - d));
      }
      if (cov > 0) {
        r = lerp(r, 255, cov);
        g = lerp(g, 255, cov);
        b = lerp(b, 255, cov);
      }
      const i = (y * N + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = 255; // tam dolu (maskable uyumlu)
    }
  }
  return encodePng(N, N, rgba);
}

for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  writeFileSync(resolve(OUT, name), drawIcon(size));
  console.log("yazıldı:", name, size + "px");
}
