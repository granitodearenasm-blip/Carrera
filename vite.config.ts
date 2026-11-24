import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas absolutas: Cloudflare Pages sirve el sitio en la raíz y /panel necesita encontrar sus archivos.
  base: '/',
  plugins: [react(), tailwindcss()],
});
