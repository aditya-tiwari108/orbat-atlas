import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { platform } from './data/platform';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'platform-brand',
      transformIndexHtml: (html) =>
        html
          .replace('%PLATFORM_TITLE%', `${platform.name} · ${platform.tagline}`)
          .replace('%PLATFORM_DESCRIPTION%', platform.description),
    },
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  server: { host: '0.0.0.0' },
  build: { outDir: 'dist' },
});
