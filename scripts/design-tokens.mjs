// Escribe src/shared/design/tokens.css (@theme de Tailwind 4) desde src/shared/design/tokens.ts, la única
// fuente de los tokens. `npm run tokens` lo escribe; `npm run check:tokens` falla si quedó desactualizado.
// Node lee el TypeScript directo (type stripping): por eso tokens.ts no tiene imports.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = fileURLToPath(new URL('..', import.meta.url));
const target = `${root}src/shared/design/tokens.css`;
const { color, saekdong, font, text, radius, stroke, shadow, motion, layer } = await import('../src/shared/design/tokens.ts');

const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const round = (n) => Math.round(n * 10000) / 10000;
const px = (n) => `${round(n / 16)}rem`;
const family = (f) => `'${f.family}', ${f.fallback}`;
const colors = (theme) => Object.entries(color[theme]).map(([role, value]) => `--color-${kebab(role)}: ${value};`);
/** De `min` px en una pantalla de 360 px a `max` px desde 1440 px. */
const fluid = (min, max) => {
  if (!max) return px(min);
  const slope = (max - min) / (1440 - 360);
  return `clamp(${px(min)}, ${px(min - slope * 360)} + ${round(slope * 100)}vw, ${px(max)})`;
};

const theme = [
  `--font-sans: ${family(font.ui)};`,
  `--font-display: ${family(font.display)};`,
  `--font-ko: ${family(font.ko)};`,
  ...colors('light'),
  ...saekdong.map((c, i) => `--color-saek-${i + 1}: ${c};`),
  ...Object.entries(text).flatMap(([name, s]) => [
    `--text-${kebab(name)}: ${fluid(s.size, s.max)};`,
    `--text-${kebab(name)}--line-height: ${s.lineHeight};`,
    `--text-${kebab(name)}--letter-spacing: ${s.tracking}em;`,
    `--text-${kebab(name)}--font-weight: ${s.weight};`,
  ]),
  ...Object.entries(radius).map(([name, value]) => `--radius-${name}: ${value}px;`),
  ...Object.entries(shadow).map(([name, s]) => `--shadow-${name}: ${s.x}px ${s.y}px 0 0 var(--color-stamp);`),
  ...Object.entries(motion.easing).map(([name, value]) => `--ease-${name}: ${value};`),
];
const runtime = [
  ...Object.entries(stroke).map(([name, value]) => `--stroke-${name}: ${value}px;`),
  ...Object.entries(text).map(([name, s]) => `--wdth-${kebab(name)}: ${s.width};`),
  ...Object.entries(motion.duration).map(([name, value]) => `--duration-${name}: ${value}ms;`),
  ...Object.entries(layer).map(([name, value]) => `--layer-${name}: ${value};`),
];

const css = `/* Generado por scripts/design-tokens.mjs desde tokens.ts: no editar. Ejecuta \`npm run tokens\`. */

@theme {
  ${theme.join('\n  ')}
}

:root {
  ${runtime.join('\n  ')}
}

[data-theme='dark'] {
  ${colors('dark').join('\n  ')}
}
`;

const formatted = await prettier.format(css, { parser: 'css', printWidth: 180 });
if (process.argv.includes('--check')) {
  const current = readFileSync(target, 'utf8');
  if (current !== formatted) {
    console.error('tokens.css está desactualizado: ejecuta `npm run tokens`.');
    process.exit(1);
  }
  console.log('tokens.css al día');
} else {
  writeFileSync(target, formatted);
  console.log('tokens.css escrito');
}
