#!/usr/bin/env bash

set -euo pipefail

TEMPLATE_REPO="https://github.com/nestjs/typescript-starter.git"
PROJECT_NAME="${1:-nestjs-app}"
PACKAGE_NAME="${2:-@aurotek/nestjs-base@latest}"
NODE_IMAGE="${NODE_IMAGE:-node:20-bookworm}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-chore: bootstrap project from Nest starter + @aurotek/nestjs-base}"

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
git clone "$TEMPLATE_REPO" "$PROJECT_NAME"

printf 'Resetting template git history...\n'
rm -rf "$PROJECT_NAME/.git"
git init -b main "$PROJECT_NAME" >/dev/null

ABS_PROJECT_PATH="$(realpath "$PROJECT_NAME")"

printf 'Installing dependencies and bootstrap tooling in Docker (%s)...\n' "$NODE_IMAGE"
docker run --rm -v "$ABS_PROJECT_PATH:/workspace" -w /workspace "$NODE_IMAGE" bash -lc "
  set -euo pipefail
  corepack enable
  corepack prepare pnpm@latest --activate

  pnpm install
  pnpm add '$PACKAGE_NAME'

  node -e '
    const fs = require("fs");
    const path = "package.json";
    const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
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
    fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\\n");
  '

  pnpm run project:bootstrap
"

printf 'Creating first commit...\n'
git -C "$PROJECT_NAME" add .
git -C "$PROJECT_NAME" -c user.name="Aurotek Bootstrap" -c user.email="bootstrap@aurotek.local" commit -m "$COMMIT_MESSAGE" >/dev/null

printf '\nDone. Project ready at: %s\n' "$ABS_PROJECT_PATH"
printf 'Next: cd "%s" && pnpm start:dev\n' "$PROJECT_NAME"
