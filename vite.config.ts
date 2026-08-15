import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'GymTracker',
        short_name: 'GymTracker',
        description: 'Registra tus rutinas, pesos y repeticiones de gimnasio',
        lang: 'es-PE',
        display: 'standalone',
        theme_color: '#0b0c0e',
        background_color: '#0b0c0e',
        icons: [
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
