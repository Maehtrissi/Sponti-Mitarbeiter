import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.VITE_CRM_MODE === 'independent' ? '/' : '/Sponti-Mitarbeiter/',
    plugins: [react(), tailwindcss(), {
      name: 'independent-crm-html',
      transformIndexHtml(html: string) {
        if (process.env.VITE_CRM_MODE !== 'independent') return html;
        return html.replace(/<link[^>]+https:\/\/fonts\.[^>]+>/g, '')
          .replace(/<title>.*?<\/title>/, '<title>Sponti CRM</title>');
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {'/api': 'http://127.0.0.1:5000'},
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
