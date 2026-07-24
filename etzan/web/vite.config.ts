import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The base path is supplied at build time (the deploy workflow derives it from
// the repository name) so BrowserRouter deep links resolve on GitHub Pages
// project sites. It defaults to "/" for local dev and custom domains.
//
// onnxruntime-web is excluded from dep pre-bundling so its wasm assets resolve.
// recharts is split into its own chunk: it is large and only the sleep and
// dashboard routes need it, so bundling it into the entry chunk delayed first
// paint on every route including the landing page.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
        },
      },
    },
  },
});
