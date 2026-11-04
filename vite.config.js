import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages project-site path. Change only if the repository name changes.
  base: '/ArCode-Persona/',
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0'
  }
});
