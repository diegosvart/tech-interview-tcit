# Git – Flujo de trabajo y comandos

Esta guía define cómo usamos Git en este proyecto: modelo de ramas, PR/merges, mensajes de commit y los comandos más utilizados. Los ejemplos están pensados para Windows PowerShell (los comandos git son los mismos en cualquier shell).

## Objetivos
- Historia limpia y explicable (PR pequeños, commits claros)
- Integración continua predecible (checks obligatorios, ramas protegidas)
- Entregables trazables (tags versionados en `main`)

## Modelo de ramas (Gitflow ligero)
- `main`: rama de producción. Solo entra código liberado. Se taguea (vX.Y.Z).
- `develop`: rama de integración de la próxima versión. Base por defecto para desarrollo.
- `feature/*`: trabajo de nuevas funcionalidades desde `develop`.
- `release/*`: estabilización previa a una liberación. Nace de `develop`, se mergea en `main` y se retro‑mergea a `develop`.
- `hotfix/*`: correcciones urgentes sobre producción. Nace de `main`, se mergea a `main` y a `develop`.

Convenciones de nombre:
- feature/<ticket>-<slug> (ej. `feature/123-posts-crud`)
- release/<version> (ej. `release/0.1.0`)
- hotfix/<issue>-<slug> (ej. `hotfix/456-fix-null-post-id`)

## Mensajes de commit (Conventional Commits)
Formato: `<type>(<scope>): <subject>`
- types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`, `perf`, `style`, `revert`
- scopes sugeridos: `server`, `client`, `repo`, `ci`, `db`, etc.

Ejemplos:
- `feat(server): add posts create endpoint`
- `fix(client): handle empty list state`
- `chore(repo): add editorconfig and gitignore`
- `docs(api): update OpenAPI with pagination`

## Checklist: Antes de abrir el PR

Verifica estos puntos para agilizar la revisión y evitar retrabajo:

- Up-to-date con la base (develop o main según corresponda)
	- `git fetch origin` y `git rebase origin/develop` (o `origin/main` para hotfix)
- Lint, typecheck y tests pasan localmente
	- Ejecuta los scripts correspondientes (cuando existan): `npm run lint`, `npm run typecheck`, `npm test`
- Alcance acotado y enfocado
	- Evita “mega PRs”. Si es grande, divídelo por feature vertical.
- Mensajes de commit claros (Conventional Commits)
	- Usa tipos: feat/fix/docs/chore/refactor/test/ci/build/...
- Documentación y contrato actualizados cuando aplique
	- OpenAPI actualizado (`openapi.json`) si cambió la API
	- README/docs relevantes ajustados
- Sin secretos ni datos sensibles
	- Revisa accidentalmente `.env`, claves o dumps en cambios
- Nombre de rama correcto
	- `feature/<ticket>-<slug>`, `hotfix/<issue>-<slug>`, `release/<version>`
- Descripción del PR completa
	- Qué cambia, por qué, cómo probar (pasos), riesgos, capturas si ayuda
- Checks de CI verdes tras publicar el PR
	- Si fallan, corrige y actualiza la rama

- Protecciones de rama cumplidas (ver sección "Protecciones de rama")
	- PR obligatorio, ≥1 aprobación, checks requeridos en verde, base up‑to‑date
- Convención de commits aplicada
	- Mensajes siguiendo Conventional Commits para facilitar el changelog y el historial

## Flujo de trabajo (paso a paso)

Preparación (una vez): crear `develop` a partir de `main` y empujarla
```powershell
git checkout -b develop
git push -u origin develop
```

Feature típico (desde develop)
```powershell
# 1) Crear rama
git checkout develop
git pull --rebase origin develop
git checkout -b feature/123-posts-crud

# 2) Trabajar y commitear incrementalmente
git add -A
git commit -m "feat(server): add Post entity and service skeleton"

# 3) Mantenerse actualizado con develop
git fetch origin
git rebase origin/develop
# si hay conflictos: resolver, luego
git rebase --continue

# 4) Publicar rama
git push -u origin HEAD

# 5) Abrir PR → base: develop | merge strategy: squash (recomendado)
# 6) Tras aprobación y checks verdes, mergear por squash
# 7) Eliminar rama remote si procede
```

Release (congelar y estabilizar)
```powershell
# Crear rama de release desde develop
git checkout develop
git pull --rebase origin develop
git checkout -b release/0.1.0
git push -u origin release/0.1.0

# Correcciones puntuales en release/*
git add -A
git commit -m "chore(release): bump version and changelog"
git push

# PR 1: release → main (merge commit recomendado para preservar historia)
# Tag en main después de merge
git checkout main
git pull --rebase origin main
git tag -a v0.1.0 -m "Release 0.1.0"
git push origin v0.1.0

# PR 2: release → develop (llevar cambios de vuelta)
```

Hotfix (parche urgente en producción)
```powershell
git checkout main
git pull --rebase origin main
git checkout -b hotfix/456-fix-null-post-id

# Cambios y commit
git add -A
git commit -m "fix(server): avoid null id on post creation"
git push -u origin HEAD

# PR 1: hotfix → main (merge)
# Tag opcional en main si amerita vX.Y.Z+1

# PR 2: hotfix → develop (sin perder el fix en la próxima versión)
```

## Mini‑resumen: ciclo corto por incremento

Usa esta secuencia concisa para cada incremento del proyecto (p. ej., “Archivos raíz y templates”, “Estructura de directorios”, etc.). Mantén PRs pequeños y enfocados.

1) Crear rama desde `develop`
```powershell
git checkout develop
git pull --rebase origin develop
git checkout -b feature/002-archivos-raiz-y-templates   # ajusta el nombre/ID
```

2) Cambios, stage y commit (Conventional Commits)
```powershell
git add -A
git commit -m "chore(root): add editorconfig, gitignore, docker-compose"
# Ejemplo para estructura:
# git commit -m "chore(structure): create client/server skeleton"
```

3) Actualizar con `develop` y publicar
```powershell
git fetch origin
git rebase origin/develop
git push -u origin HEAD   # si reescribiste historia: git push --force-with-lease
```

4) Abrir PR → base: `develop`
- Título/descr.: qué cambia, por qué, cómo probar
- Revisa que los checks de CI estén en verde y resuelve comentarios

5) Merge y limpieza
```powershell
# Tras el squash merge en GitHub
git checkout develop
git pull --rebase origin develop
git branch -d feature/002-archivos-raiz-y-templates
git push origin --delete feature/002-archivos-raiz-y-templates
```

## Estrategias de merge
- PRs de feature → develop: squash merge (historia legible, 1 commit por feature)
- release → main: merge commit (preservar commits de estabilización)
- hotfix → main y develop: merge normal

## Reglas de PR
- Pequeños y enfocados (< ~300 líneas dif si es posible)
- Descripción clara: objetivo, cambios, cómo probar
- Checks en verde: lint, typecheck, tests
- Revisión 1+ aprobada

## Comandos frecuentes
```powershell
# Estado y diferencias
git status
git diff
git diff --cached

# Stage/commit
git add -A
git restore --staged <path>
git commit -m "<type>(<scope>): <subject>"

# Ramas
git branch -a
git checkout -b <new-branch>
git switch <branch>

# Sincronización
git fetch --all --prune
git pull --rebase origin <branch>
git push -u origin HEAD

# Rebase/merge
git rebase origin/develop
git rebase --continue
git merge --no-ff <branch>

# Limpieza
git branch -d <local-branch>
git push origin --delete <remote-branch>

# Tags
git tag -a v0.1.0 -m "Release 0.1.0"
git push origin v0.1.0

# Stash (trabajo en progreso)
git stash push -m "wip: something"
git stash list
git stash pop
```

## Buenas prácticas
- Hacer rebase sobre `origin/develop` antes de abrir/actualizar PR para simplificar el merge
- Commits atómicos y mensajes claros (Conventional Commits)
- Evitar PRs gigantes; dividir por feature vertical
- Proteger `main` y `develop` (sin push directo; solo PR)
- Activar checks obligatorios en CI

## Troubleshooting rápido
- “Mi PR tiene commits viejos”: `git fetch` y `git rebase origin/develop`, resuelve conflictos, push con `--force-with-lease` si fue necesario reescribir tu rama feature
- “Entró un hotfix a main y no lo tengo”: `git checkout develop && git pull --rebase && git merge origin/main` o espera al PR de hotfix → develop

## Protecciones de rama (GitHub)

Ramas protegidas: `main` y `develop`.

Reglas recomendadas y justificación:
- Requerir PR antes de merge (no direct pushes)
	- Justificación: obliga a revisión y a ejecutar checks, evita errores humanos en ramas críticas.
- Requerir 1–2 aprobaciones de revisión
	- Justificación: mejora la calidad y el conocimiento compartido. Para equipos pequeños, 1 aprobación es suficiente.
- Requerir status checks en verde antes de merge
	- Justificación: garantiza que lint, typecheck y tests pasen. Configurar como obligatorios los jobs del CI (por ejemplo: `lint`, `typecheck`, `test`).
- Requerir que la rama esté actualizada con la base (up-to-date) antes de merge
	- Justificación: reduce conflictos post-merge; valida el estado real que se integrará.
- Exigir resolución de conversaciones/threads antes de merge
	- Justificación: evita dejar feedback crítico sin atender.
- Restringir quién puede pushar a `main` y `develop`
	- Justificación: sólo el bot de CI (si aplica) y mantenedores; el resto vía PR.
- Bloquear force‑push y borrado de rama
	- Justificación: protege la historia; los rebase locales siguen siendo posibles en branches de feature.
- Estrategias de merge permitidas por rama
	- `develop`: permitir sólo squash merge para features → historia lineal y un commit por feature.
	- `main`: permitir merge commit desde release/* para preservar los commits de estabilización; deshabilitar squash directo a `main` (salvo casos excepcionales).

Cómo configurarlo (vía interfaz de GitHub):
1. Repo → Settings → Branches → Branch protection rules → Add rule
2. Branch name pattern:
	 - `main` (primera regla)
	 - `develop` (segunda regla)
3. Marca las opciones:
	 - Require a pull request before merging (1–2 approvals) *
	 - Require status checks to pass before merging (selecciona los jobs del CI) *
	 - Require branches to be up to date before merging
	 - Dismiss stale pull request approvals when new commits are pushed (opcional)
	 - Require conversation resolution before merging
	 - Restrict who can push to matching branches (opcional)
	 - Do not allow bypassing the above settings
	 - Disable force pushes y Prevent branch deletions
4. En Settings → General → Merge button:
	 - Habilitar Squash merging (para `develop`)
	 - Habilitar Merge commit (para releases a `main`)
	 - Deshabilitar Rebase merge (opcional, para mantener linealidad)

Nota: si usas GitHub Actions, asegúrate de que los nombres de jobs en el workflow coincidan con los “required checks” configurados.

## Fuentes y referencias

- Git – Rebase (Pro Git Book): https://git-scm.com/book/en/v2/Git-Branching-Rebasing
- Git – Branching Workflows (Pro Git Book): https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows
- GitHub Docs – About pull requests: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests
- GitHub Docs – About protected branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- Conventional Commits – Especificación: https://www.conventionalcommits.org/
- Gitflow (artículo original): https://nvie.com/posts/a-successful-git-branching-model/
