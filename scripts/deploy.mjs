// Compila lo ya commiteado, lo despliega en Cloudflare Pages y comprueba que el sitio sirve la versión nueva.
// Correr después de hacer commit (ver docs/publicar.md): se niega a desplegar con cambios sin commit,
// así lo que sale publicado siempre es un commit. Igual que el de Trellum.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PROYECTO = 'hanguk-run';
// ✏️ Cuando tengan dominio propio, cámbialo aquí (por ejemplo https://hangukrun.mx/)
const SITIO = process.env.SITIO ?? `https://${PROYECTO}.pages.dev/`;
const BUNDLE = /assets\/index-[A-Za-z0-9_-]+\.js/;

const run = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', ...opts });
const paso = (titulo) => console.log(`\n== ${titulo}`);

paso('Árbol de trabajo');
const sucio = run('git status --porcelain --untracked-files=no -- src functions public index.html package.json package-lock.json vite.config.ts').split('\n').filter(Boolean);
if (sucio.length) {
  console.error(`Hay cambios sin commit que no se publicarían:\n${sucio.join('\n')}`);
  process.exit(1);
}
const commit = run('git log --oneline -1').trim();
console.log(commit);

paso('Build');
run('npm run build', { stdio: 'inherit' });
const local = readFileSync('dist/index.html', 'utf8').match(BUNDLE)?.[0];

paso('Despliegue');
const salida = run(`npx wrangler pages deploy dist --project-name ${PROYECTO} --branch main`, { stdio: ['inherit', 'pipe', 'inherit'] });
process.stdout.write(salida);
const vista = salida.match(/https:\/\/\S+\.pages\.dev/)?.[0] ?? '(no encontrada)';

paso('Comprobación');
// El dominio puede tardar unos segundos en servir el despliegue nuevo.
let enVivo = null;
for (let i = 0; i < 10 && enVivo !== local; i++) {
  if (i) await new Promise((r) => setTimeout(r, 3000));
  enVivo = (await (await fetch(SITIO, { cache: 'no-store' })).text()).match(BUNDLE)?.[0] ?? null;
}

console.log(`\nCommit:       ${commit}`);
console.log(`Vista previa: ${vista}`);
console.log(`Bundle:       local ${local}, en ${SITIO} ${enVivo}`);
if (enVivo !== local) {
  console.error(`${SITIO} todavía no sirve el bundle nuevo.`);
  process.exit(1);
}
console.log(`${SITIO} ya tiene la versión nueva.`);
