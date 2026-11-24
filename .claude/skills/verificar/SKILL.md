---
name: verificar
description: "Run the project's full validation (`npm run check`: types, lint, tests, tokens, database, format) and report only the result. Use before declaring any change done, when asked to 'verifica', 'corre el check', 'valida el cambio', 'run the checks', or after finishing edits to src/, functions/, supabase/ or scripts/."
model: haiku
context: fork
allowed-tools: Bash, Read, Grep
---

Run `npm run check` from the repo root. Do not edit anything.

- Passes: reply exactly `✅ Check aprobado`.
- Fails: reply only with the failing step name and one line per error as `archivo:línea — mensaje`. No full logs, no suggestions.
