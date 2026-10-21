import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.ADMIN_USERNAME': JSON.stringify(env.ADMIN_USERNAME || env.VITE_ADMIN_USERNAME || ''),
      'import.meta.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || ''),
      'import.meta.env.MONGODB_URI': JSON.stringify(env.MONGODB_URI || env.VITE_MONGODB_URI || ''),
    },
    envPrefix: ['VITE_', 'ADMIN_', 'MONGODB_'],
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
