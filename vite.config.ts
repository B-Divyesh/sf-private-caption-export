import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const staticRoutes = ['demo', 'workspace', 'privacy', 'terms', 'notices'];

export default defineConfig({
  build: {
    outDir: 'dist/site',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  },
  server: { strictPort: true },
  plugins: [{
    name: 'emit-static-routes',
    writeBundle() {
      const output = resolve(__dirname, 'dist/site');
      for (const route of staticRoutes) {
        const directory = resolve(output, route);
        mkdirSync(directory, { recursive: true });
        copyFileSync(resolve(output, 'index.html'), resolve(directory, 'index.html'));
      }
    }
  }]
});
