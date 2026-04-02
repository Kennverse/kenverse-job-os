// vite.main.config.ts — Main process (Electron backend)
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/main/index.ts"),
        preload: resolve(__dirname, "src/main/preload.ts"),
      },
      formats: ["cjs"],
    },
    outDir: "dist/main",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [
        "electron",
        "better-sqlite3",
        "node-cron",
        /^node:.*/,
        "path",
        "fs",
        "crypto",
        "os",
        "events",
        "stream",
        "util",
        "child_process",
      ],
      output: {
        entryFileNames: "[name].js",
      },
    },
    target: "node18",
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@main": resolve(__dirname, "src/main"),
    },
  },
});
