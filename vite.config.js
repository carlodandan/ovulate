import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: [
          '**/*.{js,jsx,css,html,ico,png,jpg,jpeg,webp,svg,woff,woff2,ttf,eot,xml,txt}']
      }
    }),
    Sitemap({ 
      hostname: 'https://ovulate.pages.dev/',
      readable: true,
      robots: [
        {
          userAgent: '*',
          allow: '/',
          crawlDelay: 2,
        },
      ]
    }),
    tailwindcss(),
  ],
  server: {
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  }
})