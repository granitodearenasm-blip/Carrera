import { defineConfig } from 'vitest/config';

// Pruebas unitarias de reglas puras (validación, tokens): `npm test`, también parte de `npm run check`.
// Se corren con scripts/test.mjs, que corrige la mayúscula de la unidad en Windows (ver ahí).
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
