#!/usr/bin/env bash

set -euo pipefail

TEMPLATE_REPO="https://github.com/nestjs/typescript-starter.git"
PROJECT_NAME="${1:-nestjs-app}"
PACKAGE_NAME="${2:-@sdkconsultoria/nestjs-base@latest}"
PNPM_VERSION="${PNPM_VERSION:-9}"
NODE_IMAGE="${NODE_IMAGE:-node:24-bookworm}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-chore: bootstrap project from Nest starter + @sdkconsultoria/nestjs-base}"
BOOTSTRAP_COMMIT_MESSAGE="${BOOTSTRAP_COMMIT_MESSAGE:-chore: apply @sdkconsultoria/nestjs-base bootstrap}"

if ! command -v git >/dev/null 2>&1; then
  printf 'Error: git is required but not installed.\n' >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  printf 'Error: docker is required but not installed.\n' >&2
  exit 1
fi

if [ -e "$PROJECT_NAME" ]; then
  printf 'Error: target path "%s" already exists.\n' "$PROJECT_NAME" >&2
  exit 1
fi

printf 'Cloning NestJS starter into "%s"...\n' "$PROJECT_NAME"
git clone --depth 1 "$TEMPLATE_REPO" "$PROJECT_NAME"

printf 'Resetting template git history...\n'
rm -rf "$PROJECT_NAME/.git"
git init -b main "$PROJECT_NAME" >/dev/null

ABS_PROJECT_PATH="$(realpath "$PROJECT_NAME")"
HOST_UID="$(id -u)"
HOST_GID="$(id -g)"

INJECT_SCRIPTS_NODE=$(cat <<'NODESCRIPT'
const fs = require("fs");
const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.scripts = {
  ...(pkg.scripts || {}),
  "containers:install": "ia-containers-install",
  "env:install": "ia-env-install",
  "git:hooks:install": "ia-git-hooks-install",
  "nest:clean-demo": "ia-nest-clean-demo",
  "opencode:install": "ia-opencode-install",
  "observability:install": "ia-observability-install",
  "shared:cleanup": "ia-shared-cleanup",
  "skills:install": "ia-opencode-install",
  "testcontainers:install": "ia-testcontainers-install",
  "project:bootstrap": "pnpm run opencode:install && pnpm run containers:install && pnpm run env:install && pnpm run observability:install && pnpm run testcontainers:install && pnpm run git:hooks:install && pnpm run nest:clean-demo && pnpm run shared:cleanup"
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
NODESCRIPT
)

printf 'Installing dependencies and bootstrap tooling in Docker (%s)...\n' "$NODE_IMAGE"
docker run --rm -v "$ABS_PROJECT_PATH:/workspace" -w /workspace "$NODE_IMAGE" bash -lc "
  set -euo pipefail
  PNPM_CMD='npx -y pnpm@${PNPM_VERSION}'

  \$PNPM_CMD install
  \$PNPM_CMD add '$PACKAGE_NAME'

  echo '${INJECT_SCRIPTS_NODE}' | node -

  chown -R ${HOST_UID}:${HOST_GID} /workspace
"

printf 'Creating first commit...\n'
git -C "$PROJECT_NAME" add .
git -C "$PROJECT_NAME" -c user.name="SDK Consultoria Bootstrap" -c user.email="bootstrap@sdkconsultoria.local" commit -m "$COMMIT_MESSAGE" >/dev/null

printf 'Running @sdkconsultoria/nestjs-base bootstrap commands...\n'
docker run --rm -v "$ABS_PROJECT_PATH:/workspace" -w /workspace "$NODE_IMAGE" bash -lc "
  set -euo pipefail
  PNPM_CMD='npx -y pnpm@${PNPM_VERSION}'

  \$PNPM_CMD exec ia-opencode-install
  \$PNPM_CMD exec ia-containers-install
  \$PNPM_CMD exec ia-env-install
  \$PNPM_CMD exec ia-observability-install
  \$PNPM_CMD exec ia-testcontainers-install
  \$PNPM_CMD exec ia-git-hooks-install
  \$PNPM_CMD exec ia-nest-clean-demo
  \$PNPM_CMD exec ia-shared-cleanup

  chown -R ${HOST_UID}:${HOST_GID} /workspace
"

if ! git -C "$PROJECT_NAME" diff --quiet || ! git -C "$PROJECT_NAME" diff --cached --quiet; then
  printf 'Creating bootstrap commit...\n'
  git -C "$PROJECT_NAME" add .
  git -C "$PROJECT_NAME" -c user.name="SDK Consultoria Bootstrap" -c user.email="bootstrap@sdkconsultoria.local" commit -m "$BOOTSTRAP_COMMIT_MESSAGE" >/dev/null
else
  printf 'No bootstrap changes detected after first commit.\n'
fi

printf '\nDone. Project ready at: %s\n' "$ABS_PROJECT_PATH"
printf 'Next: cd "%s" && pnpm start:dev\n' "$PROJECT_NAME"
