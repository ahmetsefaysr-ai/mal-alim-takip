import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Göreli yollar — GitHub Pages alt-yolunda (/repo/) ve kökte çalışır
  base: "./",
  plugins: [react()],
  server: { port: 5173, open: true },
});
