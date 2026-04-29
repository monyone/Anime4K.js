import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
const entryPages = ['index.html', 'video.html', 'image.html']

function flattenEntryHtml(): Plugin {
  return {
    name: 'flatten-entry-html',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (url === '/' || entryPages.some((p) => url === `/${p}`)) {
          const file = url === '/' ? 'index.html' : url.slice(1)
          req.url = `/entry/${file}`
        }
        next()
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), flattenEntryHtml()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: resolve(__dirname, './entry/index.html'),
        video: resolve(__dirname, './entry/video.html'),
        image: resolve(__dirname, './entry/image.html'),
      },
    },
  },
});
