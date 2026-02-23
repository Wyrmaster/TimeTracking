import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import tailwindvite from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [tailwindvite(), react()],

  server: {
    port: 46008,
    strictPort: true,
    proxy: {
      '^/api': {
        target: 'http://localhost:5000',
      },
    },
  },
}));
