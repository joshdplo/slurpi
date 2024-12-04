import 'dotenv/config';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  build: {
    manifest: false,
    outDir: '../public',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: 'frontend/main.js',
      output: {
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  },
  define: {
    __NAME__: JSON.stringify(process.env.NAME),
    __WS_PORT__: JSON.stringify(process.env.WS_PORT)
  },
});