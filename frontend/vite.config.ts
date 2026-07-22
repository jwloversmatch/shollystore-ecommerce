import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectManifest: {
        swSrc: 'src/sw.ts',          // custom service worker source
        swDest: 'dist/sw.js',        // output file (default: dist/sw.js)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,webp}'],
      },
      manifest: {
        name: 'ShollyStore',
        short_name: 'Sholly',
        description: 'Your one-stop multi-product store',
        theme_color: '#e8622a',
        background_color: '#0A0A0B',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
});