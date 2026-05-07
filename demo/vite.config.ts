import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: './src',
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: resolve(__dirname, './src/index.html'),
        video: resolve(__dirname, './src/video.html'),
        image: resolve(__dirname, './src/image.html'),
      },
    },
  },
});
