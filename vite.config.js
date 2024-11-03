// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Exclude 'api' directory from Vite's processing
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      // Exclude 'api' from the build
      external: ['api'],
    },
  },
  // Ensure Vite's dev server doesn't serve the 'api' directory
  server: {
    fs: {
      strict: true,
      allow: ['./', './src', './public'],
      deny: ['./api'],
    },
  },
});
