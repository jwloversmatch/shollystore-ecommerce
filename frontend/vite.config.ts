import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Register the service worker and automatically reload when a new version is ready
      registerType: "autoUpdate",

      // Use your custom service worker file (src/sw.ts)
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",

      // Options for Workbox when injecting the precache manifest
      injectManifest: {
        // Files to precache
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,webp,woff2}"],
        // Increase file size limit (5 MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Optional: exclude some files if needed
        // globIgnores: ['**/node_modules/**/*', '**/stats.html'],
      },

      // PWA manifest
      manifest: {
        name: "ShollyStore – Your One‑Stop Shop for Quality Products",
        short_name: "Sholly",
        description:
          "Your one-stop multi-product store with fast delivery across Nigeria",
        theme_color: "#e8622a",
        background_color: "#0A0A0B",
        display: "standalone",
        start_url: "/",
        orientation: "any",
        scope: "/",
        lang: "en-NG",
        categories: ["shopping", "lifestyle"],
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "framer-motion": ["framer-motion"],
          "ui-icons": ["lucide-react"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          "react-helmet": ["react-helmet-async"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "esbuild",
    sourcemap: false,
    cssMinify: true,
    cssCodeSplit: true,
    target: "es2020",
  },
  css: {
    devSourcemap: false,
  },
  server: {
    open: true,
    cors: true,
  },
  preview: {
    port: 4173,
  },
});
