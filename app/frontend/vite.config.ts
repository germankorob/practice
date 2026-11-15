import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

// The API base is read at build/runtime from VITE_API_BASE.
// Defaults to the backend's compose port.
export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
  build: {
    // Две страницы: само приложение и публичная страница прогресса.
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        progress: resolve(root, "progress.html"),
      },
    },
  },
});
