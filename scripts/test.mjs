// Runs Vitest from the working directory with an upper-case drive letter (`E:\…`). On Windows, Vite
// resolves files with that form; when the shell starts at `e:\…` (Git Bash, VS Code's terminal),
// Vitest ends up loading a second copy of itself and every `describe` fails. Any extra arguments go
// to Vitest: `npm test -- --watch`.
import { spawnSync } from 'node:child_process';

const cwd = process.cwd().replace(/^([a-z]):/, (_, drive) => `${drive.toUpperCase()}:`);
const windows = process.platform === 'win32';
const result = spawnSync(windows ? 'npx.cmd' : 'npx', ['vitest', 'run', ...process.argv.slice(2)], { cwd, stdio: 'inherit', shell: windows });
process.exit(result.status ?? 1);
