import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas relativas: el contenido de dist/ funciona en la raíz del dominio o en cualquier carpeta del hosting.
  base: './',
  plugins: [react(), tailwindcss()],
  // El chunk grande es Firestore: se descarga aparte, solo cuando alguien llega al paso 2 de la inscripción.
  build: { chunkSizeWarningLimit: 650 },
});
