import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // Göreli yollar — yerelde dosyadan (file://) ve her yolda çalışır
  base: "./",
  plugins: [react(), viteSingleFile()],
  server: { port: 5173, open: true },
  build: {
    // Her şeyi tek bir index.html içine göm → çift tıkla yerelde açılır
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
  },
});
