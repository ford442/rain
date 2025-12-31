import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'resources/public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
