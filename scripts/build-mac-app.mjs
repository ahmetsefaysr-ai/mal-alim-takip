// ── macOS evrensel .app paketi üretir ─────────────────────────────
// Hem Apple Silicon (arm64) hem Intel (x64) Mac'lerde çalışan tek bir
// MalAlimTakip.app üretir; çift tıkla Terminal'siz açılır. (Sadece macOS'ta
// çalışır — lipo/codesign/ditto gerektirir; GitHub Actions macOS makinesinde.)

import { execSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  chmodSync,
  rmSync,
  existsSync,
} from "node:fs";

const run = (cmd) => {
  console.log("› " + cmd);
  execSync(cmd, { stdio: "inherit" });
};

const FUSE = "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2";
const VER = process.version; // örn. v20.11.1
const APP = "MalAlimTakip.app";
const EXE = "MalAlimTakip";

if (process.platform !== "darwin") {
  console.error("Bu betik yalnızca macOS'ta çalışır.");
  process.exit(1);
}
if (!existsSync("dist/index.html")) {
  console.error("dist/index.html yok — önce `npm run build` çalıştır.");
  process.exit(1);
}

// 1) HTML'i göm, sunucuyu paketle, SEA blob'u üret (blob mimariden bağımsız)
const html = readFileSync("dist/index.html", "utf8");
writeFileSync("server/index.generated.cjs", "module.exports = " + JSON.stringify(html) + ";\n");
run("npx --yes esbuild server/server.cjs --bundle --platform=node --target=node20 --outfile=server/bundle.cjs");
run("node --experimental-sea-config sea-config.json");

// 2) İki mimari için Node ikilisi: arm64 = bu makine, x64 = nodejs.org'dan indir
copyFileSync(process.execPath, "node-arm64");
run(`curl -fsSL -o node-x64.tar.gz https://nodejs.org/dist/${VER}/node-${VER}-darwin-x64.tar.gz`);
run("tar -xzf node-x64.tar.gz");
copyFileSync(`node-${VER}-darwin-x64/bin/node`, "node-x64");

// 3) Her ikisine de blob'u göm (önce mevcut imzayı kaldır)
for (const f of ["node-arm64", "node-x64"]) {
  chmodSync(f, 0o755);
  run(`codesign --remove-signature "${f}"`);
  run(`npx --yes postject ${f} NODE_SEA_BLOB sea-prep.blob --sentinel-fuse ${FUSE} --macho-segment-name NODE_SEA`);
}

// 4) Tek evrensel ikiliye birleştir
run(`lipo -create node-arm64 node-x64 -output ${EXE}-bin`);

// 5) .app iskeleti
rmSync(APP, { recursive: true, force: true });
mkdirSync(`${APP}/Contents/MacOS`, { recursive: true });
mkdirSync(`${APP}/Contents/Resources`, { recursive: true });
copyFileSync(`${EXE}-bin`, `${APP}/Contents/MacOS/${EXE}`);
chmodSync(`${APP}/Contents/MacOS/${EXE}`, 0o755);

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Mal Alim Takip</string>
  <key>CFBundleDisplayName</key><string>Mal &amp; Alim Takip</string>
  <key>CFBundleIdentifier</key><string>com.malalimtakip.app</string>
  <key>CFBundleExecutable</key><string>${EXE}</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleVersion</key><string>2.0.0</string>
  <key>CFBundleShortVersionString</key><string>2.0.0</string>
  <key>LSMinimumSystemVersion</key><string>11.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <!-- UI'siz arka plan ajanı: Terminal/Dock açmaz; kapatma sayfadaki düğmeyle -->
  <key>LSUIElement</key><true/>
</dict>
</plist>
`;
writeFileSync(`${APP}/Contents/Info.plist`, plist);

// 6) .app'i ad-hoc imzala (evrensel)
run(`codesign --force --deep --sign - "${APP}"`);

// 7) İzinleri koruyarak zip'le (upload sırasında +x kaybolmasın)
rmSync("MalAlimTakip-mac.zip", { force: true });
run(`ditto -c -k --keepParent "${APP}" MalAlimTakip-mac.zip`);

console.log("\n✅ Hazır: MalAlimTakip-mac.zip (Apple Silicon + Intel)");
