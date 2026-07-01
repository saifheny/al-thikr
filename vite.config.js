import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['custom-icon.jpg', 'assets/*.png'],
      workbox: {
        cacheId: 'althikr-app',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'الذكر الحكيم - تطبيق القرآن الكريم',
        short_name: 'الذكر الحكيم',
        description: 'تطبيق تفاعلي للقرآن الكريم مع الاستماع والتفسير ومواقيت الصلاة',
        theme_color: '#3b5444',
        background_color: '#f7faf8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/al-thikr/',
        start_url: '/al-thikr/',
        dir: 'rtl',
        lang: 'ar',
        icons: [
          {
            src: 'custom-icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable'
          },
          {
            src: 'custom-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/al-thikr/',
})
