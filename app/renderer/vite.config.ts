import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname),
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/renderer'),
    emptyOutDir: true,
    sourcemap: mode !== 'production'
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1'
  }
}));
