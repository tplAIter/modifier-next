#!/bin/sh
set -eu
: "${APP_ROOT:?actual approved composed application required}"
cd "$APP_ROOT"
test -f bun.lock && test -d node_modules || { echo 'PACKAGE_CLOSURE_MISSING' >&2; exit 2; }
bun run typecheck
bun run test
bun run lint
bun run build
