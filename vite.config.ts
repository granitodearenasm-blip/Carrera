import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas absolutas bajo /eventos/hanguk-run/: el sitio también se muestra en trellum.io/eventos/hanguk-run
  // (Trellum lo reenvía a este proyecto de Pages), y /panel necesita encontrar sus archivos en ambos.
  base: '/eventos/hanguk-run/',
  plugins: [react(), tailwindcss()],
});
