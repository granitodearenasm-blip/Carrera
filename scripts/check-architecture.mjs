// Revisa las capas de CLAUDE.md / docs/arquitectura.md y que no haya ciclos de imports.
// `npm run check:architecture` (también parte de `npm run check`). Sin dependencias.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const toPosix = (p) => p.split(path.sep).join('/');
const rel = (p) => toPosix(path.relative(root, p));

/** Capas, de la más interna a la externa. Un módulo importa de su capa y de las listadas. */
const LAYERS = [
  { name: 'shared', dir: 'src/shared/', may: [] },
  { name: 'config', dir: 'src/config.ts', may: ['src/shared/'] },
  { name: 'services', dir: 'src/services/', may: ['src/shared/', 'src/config.ts'] },
  { name: 'features', dir: 'src/features/', may: ['src/shared/', 'src/config.ts', 'src/services/'] },
  { name: 'pages', dir: 'src/pages/', may: ['src/shared/', 'src/config.ts', 'src/services/', 'src/features/'] },
  { name: 'app', dir: 'src/app/', may: ['src/pages/', 'src/features/', 'src/shared/', 'src/config.ts', 'src/services/'] },
  { name: 'entry', dir: 'src/main.tsx', may: ['src/'] },
  // Las Pages Functions corren en Cloudflare, sin el código del navegador.
  { name: 'server', dir: 'functions/', may: [] },
];

const layerOf = (file) => LAYERS.find((l) => file === l.dir || file.startsWith(l.dir));

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    // Tests (*.test.ts) aren't part of the app: they may import the test fixtures from any layer.
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts') && !entry.name.endsWith('.test.ts')) out.push(full);
  }
  return out;
}

const EXTS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
function resolve(from, spec) {
  const base = path.resolve(path.dirname(from), spec);
  for (const ext of EXTS) if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) return base + ext;
  return null;
}

// import ... from './x' (value or type), export ... from './x', import './x', import('./x')
const IMPORT_RE = /(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[^'";]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]|import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;

const files = ['src', 'functions'].flatMap((d) => walk(path.join(root, d)));
const problems = [];
/** Value imports only, for cycles: type-only imports vanish at runtime. */
const graph = new Map();

for (const file of files) {
  const from = rel(file);
  const layer = layerOf(from);
  const text = fs.readFileSync(file, 'utf8');
  const edges = [];
  for (const m of text.matchAll(IMPORT_RE)) {
    const spec = m[3] ?? m[4];
    const typeOnly = Boolean(m[2]);
    const target = resolve(file, spec);
    if (!target) {
      problems.push(`${from}: no se encuentra "${spec}"`);
      continue;
    }
    const to = rel(target);
    if (!typeOnly && /\.(ts|tsx)$/.test(to)) edges.push(to);
    if (!layer) continue;
    const allowed = to.startsWith(layer.dir) || layer.may.some((p) => to === p || to.startsWith(p));
    if (!allowed) problems.push(`${from} (${layer.name}) no puede importar ${to}`);
  }
  graph.set(from, edges);
}

// Cycles (depth-first search over value imports).
const state = new Map();
const stack = [];
const cycles = new Set();
function visit(node) {
  state.set(node, 'open');
  stack.push(node);
  for (const next of graph.get(node) ?? []) {
    if (state.get(next) === 'open') {
      const loop = stack.slice(stack.indexOf(next)).concat(next);
      cycles.add(loop.join(' → '));
    } else if (!state.has(next)) visit(next);
  }
  stack.pop();
  state.set(node, 'done');
}
for (const node of graph.keys()) if (!state.has(node)) visit(node);
for (const c of cycles) problems.push(`ciclo de imports: ${c}`);

if (problems.length) {
  console.error(`Arquitectura: ${problems.length} problema(s)\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`Arquitectura correcta: ${files.length} archivos, sin imports entre capas prohibidos ni ciclos.`);
