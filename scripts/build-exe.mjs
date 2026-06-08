// ── Tek tıklık çalıştırılabilir (Node gömülü) üretir ──────────────
// Önce `npm run build` ile dist/index.html üretilmiş olmalı.
// Çalıştığı işletim sistemi için ikili üretir: Windows → .exe, Mac/Linux → ikili.
// (Mac .app ve Windows .exe'yi GitHub Actions kendi makinesinde üretir.)

import { execSync } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";
const OUT = isWin ? "mal-alim-takip.exe" : "mal-alim-takip";
const FUSE = "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2";

const run = (cmd) => {
  console.log("› " + cmd);
  execSync(cmd, { stdio: "inherit" });
};

if (!existsSync("dist/index.html")) {
  console.error("dist/index.html yok — önce `npm run build` çalıştır.");
  process.exit(1);
}

// 1) Uygulama HTML'ini sunucuya sabit string olarak göm
const html = readFileSync("dist/index.html", "utf8");
writeFileSync("server/index.generated.cjs", "module.exports = " + JSON.stringify(html) + ";\n");

// 2) Sunucuyu tek dosyaya paketle (Node yerleşik modülleri hariç tutulur)
run(
  "npx --yes esbuild server/server.cjs --bundle --platform=node --target=node20 --outfile=server/bundle.cjs"
);

// 3) SEA blob'unu üret
run("node --experimental-sea-config sea-config.json");

// 4) Node ikilisini kopyala
copyFileSync(process.execPath, OUT);

// 5) Mac: mevcut imzayı kaldır
if (isMac) run(`codesign --remove-signature "${OUT}"`);

// 6) Blob'u ikiliye göm
run(
  `npx --yes postject ${OUT} NODE_SEA_BLOB sea-prep.blob --sentinel-fuse ${FUSE}` +
    (isMac ? " --macho-segment-name NODE_SEA" : "")
);

// 7) Mac: ad-hoc yeniden imzala
if (isMac) run(`codesign --sign - "${OUT}"`);

console.log("\n✅ Hazır: " + OUT);
